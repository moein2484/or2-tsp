import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";

import "./globals.css";

export const metadata = {
  title: "حل مسئله فروشنده دوره‌گرد با DFJ",
  description: "حل مسئله TSP با برش‌های زیرتور DFJ و کتابخانه GLPK.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
