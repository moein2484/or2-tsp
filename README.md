# حل مسئله فروشنده دوره‌گرد | OR2 TSP Solver

یک برنامهٔ وب فارسی برای حل مسئلهٔ فروشندهٔ دوره‌گرد (TSP) با برنامه‌ریزی عدد صحیح، مدل MTZ و حل‌کنندهٔ GLPK.js. این پروژه برای درس تحقیق در عملیات ۲ تهیه شده و یک نمونهٔ پنج‌شهری را حل می‌کند.

## قابلیت‌ها

- نمایش ماتریس هزینهٔ حرکت بین پنج شهر
- یافتن تور با کمترین هزینه با استفاده از برنامه‌ریزی عدد صحیح دودویی
- حذف زیرتورهای جداگانه با محدودیت‌های Miller–Tucker–Zemlin (MTZ)
- نمایش مسیر بهینه و هزینهٔ کل
- اعتبارسنجی مستقل محدودیت‌ها، پیوستگی مسیر و تابع هدف
- رابط راست‌چین فارسی با فونت وزیرمتن

## فناوری‌ها

Next.js، React، GLPK.js و Tailwind CSS

## پیش‌نیازها

Node.js سازگار با نسخهٔ Next.js پروژه و npm.

## راه‌اندازی

```bash
git clone https://github.com/moein2484/or2-tsp.git
cd or2-tsp
npm install
npm run dev
```

سپس [http://localhost:3000](http://localhost:3000) را باز کنید.

## فرمان‌ها

| فرمان | کاربرد |
| --- | --- |
| `npm run dev` | اجرای سرور توسعه |
| `npm run build` | ساخت نسخهٔ تولید |
| `npm run start` | اجرای نسخهٔ تولید |
| `npm run lint` | بررسی کد با ESLint |

## ساختار پروژه

- `src/data/tspData.js`: شهرها و ماتریس هزینه
- `src/lib/tspModel.js`: متغیرها، تابع هدف و محدودیت‌های MTZ
- `src/lib/glpkSolver.js`: تبدیل مدل و اجرای GLPK.js
- `src/lib/tspSolution.js`: استخراج تور از پاسخ حل‌کننده
- `src/lib/tspValidation.js`: اعتبارسنجی مستقل پاسخ
- `src/app/page.js`: رابط کاربری

## مدل ریاضی

متغیر دودویی `xᵢⱼ` انتخاب حرکت مستقیم از شهر `i` به شهر `j` را نشان می‌دهد. تابع هدف مجموع هزینهٔ حرکت‌های انتخاب‌شده را کمینه می‌کند. برای هر شهر دقیقاً یک یال ورودی و یک یال خروجی در نظر گرفته می‌شود. متغیرهای ترتیبی `uᵢ` و محدودیت‌های MTZ زیرتورهای مجزا را حذف می‌کنند. شهر ۱ نقطهٔ شروع ثابت تور است.

برای تغییر نمونه، آرایه‌های `cities` و `costMatrix` را در `src/data/tspData.js` ویرایش کنید. قطر ماتریس را `null` نگه دارید و هزینهٔ حرکت‌های مجاز را به‌صورت عددی وارد کنید.

---

# OR2 TSP Solver

A Persian, right-to-left web app that solves a five-city Traveling Salesperson Problem (TSP) using a mixed-integer programming formulation, Miller–Tucker–Zemlin (MTZ) subtour elimination constraints, and GLPK.js. It displays the cost matrix, optimal tour, total cost, and independent checks of the solution.

## Features

- Five-city travel cost matrix
- Minimum-cost tour solved as a binary integer program
- MTZ auxiliary variables and subtour elimination constraints
- Optimal route and objective value
- Independent validation of degree constraints, MTZ constraints, tour connectivity, and total cost
- Persian RTL interface with Vazirmatn font

## Tech stack

Next.js, React, GLPK.js, and Tailwind CSS.

## Getting started

Requirements: Node.js compatible with the project's Next.js version and npm.

```bash
git clone https://github.com/moein2484/or2-tsp.git
cd or2-tsp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — create the production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

- `src/data/tspData.js` — cities and travel cost matrix
- `src/lib/tspModel.js` — decision variables, objective, and MTZ constraints
- `src/lib/glpkSolver.js` — GLPK model conversion and solve routine
- `src/lib/tspSolution.js` — route extraction
- `src/lib/tspValidation.js` — independent solution checks
- `src/app/page.js` — user interface

## Mathematical formulation

Binary variable `xᵢⱼ` indicates whether the tour travels directly from city `i` to city `j`. The objective minimizes total travel cost. Each city has exactly one selected incoming and outgoing edge. Ordering variables `uᵢ` and MTZ constraints eliminate disconnected subtours. City 1 is the fixed starting point.

To change the sample, edit `cities` and `costMatrix` in `src/data/tspData.js`. Keep `null` on the diagonal and use numeric costs for allowed travel arcs.
