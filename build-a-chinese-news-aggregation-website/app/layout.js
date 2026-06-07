import "./globals.css";
import { Header } from "../components/header";

export const metadata = {
  title: "華聞聚合",
  description: "BBC, CNN, NBC, Reuters 的繁體中文新聞摘要聚合"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
