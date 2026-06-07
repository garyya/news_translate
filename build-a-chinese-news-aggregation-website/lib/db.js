import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";

const defaultDatabasePath = "data/news.sqlite";
const moduleDirectory = dirname(fileURLToPath(import.meta.url));

let SQL;
let db;
let dbPath;
let dbMtimeMs = 0;

export function getDatabasePath() {
  const configuredPath = process.env.SQLITE_DATABASE_PATH || defaultDatabasePath;
  return isAbsolute(configuredPath)
    ? configuredPath
    : resolve(/* turbopackIgnore: true */ process.cwd(), configuredPath);
}

export function hasDatabaseUrl() {
  return existsSync(getDatabasePath());
}

function normalizeSql(text) {
  const values = [];
  const sql = text.replace(/\$(\d+)/g, (_, index) => {
    values.push(Number(index) - 1);
    return "?";
  });

  return { sql, values };
}

function rowsFromResult(result) {
  if (!result.length) {
    return [];
  }

  const [{ columns, values }] = result;
  return values.map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index]])));
}

export async function getDatabase() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => resolve(moduleDirectory, "../node_modules/sql.js/dist", file)
    });
  }

  const nextPath = getDatabasePath();
  const nextMtimeMs = existsSync(nextPath) ? statSync(nextPath).mtimeMs : 0;
  if (!db || dbPath !== nextPath || nextMtimeMs > dbMtimeMs) {
    db?.close();
    dbPath = nextPath;
    mkdirSync(dirname(dbPath), { recursive: true });
    db = existsSync(dbPath)
      ? new SQL.Database(readFileSync(dbPath))
      : new SQL.Database();
    dbMtimeMs = nextMtimeMs;
    db.run("pragma foreign_keys = on");
  }

  return db;
}

export async function saveDatabase() {
  if (!db) {
    return;
  }

  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, Buffer.from(db.export()));
  dbMtimeMs = statSync(dbPath).mtimeMs;
}

export async function closeDatabase() {
  await saveDatabase();
  db?.close();
  db = undefined;
  dbMtimeMs = 0;
}

export async function query(text, params = []) {
  const database = await getDatabase();
  const { sql, values } = normalizeSql(text);
  const boundParams = values.length ? values.map((index) => params[index]) : params;
  const statement = database.prepare(sql);

  try {
    statement.bind(boundParams);
    const rows = [];
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }

    const isRead = /^\s*(select|with|pragma)\b/i.test(sql);
    const rowCount = isRead ? rows.length : database.getRowsModified();
    return { rows, rowCount };
  } finally {
    statement.free();
  }
}

export async function exec(text) {
  const database = await getDatabase();
  database.run(text);
  await saveDatabase();
}

export async function withClient(callback) {
  const database = await getDatabase();
  const client = {
    query: async (text, params = []) => query(text, params),
    exec: (text) => database.run(text),
    lastInsertId: () => database.exec("select last_insert_rowid() as id")[0].values[0][0]
  };

  const result = await callback(client);
  await saveDatabase();
  return result;
}
