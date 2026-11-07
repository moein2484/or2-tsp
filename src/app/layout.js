import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";

import "./globals.css";

export const metadata = {
  title: "حل مسئله فروشنده دوره‌گرد",
  description: "حل مسئله TSP با استفاده از مدل ریاضی MTZ و GLPK.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}