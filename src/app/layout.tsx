import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Company Simulator",
  description: "실시간으로 일하는 AI 개발회사를 시각화하는 인터랙티브 시뮬레이터",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
