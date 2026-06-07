"use client";

import Link from "next/link";
import { Moon, Newspaper, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = saved ? saved === "dark" : prefersDark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    window.localStorage.setItem("theme", nextDark ? "dark" : "light");
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">
          <Newspaper size={20} aria-hidden />
        </span>
        <span>華聞聚合</span>
      </Link>
      <nav aria-label="主要導覽">
        <Link href="/">今日主題</Link>
        <a href="https://www.bbc.com/news" target="_blank" rel="noreferrer">BBC</a>
        <a href="https://www.cnn.com/world" target="_blank" rel="noreferrer">CNN</a>
        <a href="https://www.nbcnews.com/" target="_blank" rel="noreferrer">NBC</a>
        <a href="https://www.reuters.com/" target="_blank" rel="noreferrer">Reuters</a>
      </nav>
      <button className="icon-button" type="button" onClick={toggleTheme} aria-label="切換深色模式">
        {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
      </button>
    </header>
  );
}
