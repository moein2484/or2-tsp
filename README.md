# حل مسئله فروشنده دوره‌گرد | OR2 TSP Solver

یک برنامهٔ وب فارسی برای حل مسئلهٔ فروشندهٔ دوره‌گرد (TSP) با برنامه‌ریزی عدد صحیح، روش حذف زیرتور DFJ و حل‌کنندهٔ GLPK.js. این پروژه برای درس تحقیق در عملیات ۲ تهیه شده و یک نمونهٔ پنج‌شهری را حل می‌کند.

## قابلیت‌ها

- نمایش ماتریس هزینهٔ حرکت بین پنج شهر
- یافتن تور با کمترین هزینه با استفاده از برنامه‌ریزی عدد صحیح دودویی
- حذف تکرارشوندهٔ زیرتورهای جداگانه با برش‌های Dantzig–Fulkerson–Johnson (DFJ)
- نمایش تابع هدف، دامنهٔ متغیرها و تمام محدودیت‌های مدل در رابط کاربری
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
- `src/lib/tspModel.js`: متغیرها، تابع هدف، محدودیت‌های درجه و برش‌های DFJ
- `src/lib/glpkSolver.js`: حل تکرارشونده و افزودن برش‌های DFJ در GLPK.js
- `src/lib/tspSolution.js`: استخراج تور از پاسخ حل‌کننده
- `src/lib/tspValidation.js`: اعتبارسنجی مستقل پاسخ
- `src/app/page.js`: رابط کاربری

## مدل ریاضی

متغیر دودویی `xᵢⱼ` انتخاب حرکت مستقیم از شهر `i` به شهر `j` را نشان می‌دهد. تابع هدف مجموع هزینهٔ حرکت‌های انتخاب‌شده را کمینه می‌کند و برای هر شهر دقیقاً یک یال ورودی و یک یال خروجی در نظر گرفته می‌شود. ابتدا همین مدل پایه حل می‌شود؛ اگر جواب شامل چند زیرتور باشد، برای هر زیرتور `S` قید DFJ به‌شکل `Σ(i∈S, j∈S) xᵢⱼ ≤ |S| − 1` اضافه می‌شود و مدل دوباره حل می‌گردد تا یک تور واحد به دست آید. تمام تابع هدف، دامنهٔ متغیرهای دودویی، محدودیت‌های درجه و برش‌های DFJ تولیدشده در رابط نمایش داده می‌شوند.

برای تغییر نمونه، آرایه‌های `cities` و `costMatrix` را در `src/data/tspData.js` ویرایش کنید. قطر ماتریس را `null` نگه دارید و هزینهٔ حرکت‌های مجاز را به‌صورت عددی وارد کنید.

---

# OR2 TSP Solver

Traveling Salesman Problem Solver using DFJ subtour cuts and GLPK.js.

A Persian, right-to-left web app that solves a five-city Traveling Salesperson Problem using a mixed-integer programming formulation, iterative Dantzig–Fulkerson–Johnson (DFJ) subtour cuts, and GLPK.js. It displays the cost matrix, objective, all model constraints, optimal tour, total cost, and independent checks of the solution.

## Features

- Five-city travel cost matrix
- Minimum-cost tour solved as a binary integer program
- Iterative DFJ subtour elimination cuts
- Full objective, binary variable domains, degree constraints, and generated DFJ cuts shown in the UI
- Optimal route and objective value
- Independent validation of degree constraints, DFJ cuts, tour connectivity, and total cost
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
- `src/lib/tspModel.js` — decision variables, objective, degree constraints, and DFJ cuts
- `src/lib/glpkSolver.js` — iterative GLPK solve and DFJ cut generation
- `src/lib/tspSolution.js` — route extraction
- `src/lib/tspValidation.js` — independent solution checks
- `src/app/page.js` — user interface

## Mathematical formulation

Binary variable `xᵢⱼ` indicates whether the tour travels directly from city `i` to city `j`. The objective minimizes total travel cost, and each city has exactly one selected incoming and outgoing edge. The base model is solved first. When it yields disconnected subtours, a DFJ cut `Σ(i∈S, j∈S) xᵢⱼ ≤ |S| − 1` is added for each subtour `S`, then the model is solved again until a single tour remains. The UI lists the objective, binary domains, degree constraints, and every DFJ cut generated during the solve.

To change the sample, edit `cities` and `costMatrix` in `src/data/tspData.js`. Keep `null` on the diagonal and use numeric costs for allowed travel arcs.
