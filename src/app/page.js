"use client";

import { useState } from "react";

import { cities, costMatrix } from "@/data/tspData";
import { solveTSP } from "@/lib/glpkSolver";
import { extractSolution } from "@/lib/tspSolution";
import { validateSolution } from "@/lib/tspValidation";

export default function Home() {
  const [solution, setSolution] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSolve = async () => {
    setLoading(true);
    setError("");
    setSolution(null);
    setValidation(null);

    try {
      // اجرای حل‌کننده
      const solverResult = await solveTSP();

      // استخراج جواب
      const extractedSolution = extractSolution(solverResult);

      // اعتبارسنجی مستقل جواب
      const validationResult = validateSolution(
        solverResult,
        extractedSolution
      );

      setSolution(extractedSolution);
      setValidation(validationResult);
    } catch (err) {
      console.error(err);
      setError(err.message || "خطایی هنگام حل مسئله رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 rounded-3xl bg-gradient-to-l from-indigo-950 via-indigo-900 to-violet-800 p-7 text-white shadow-xl sm:p-10">
          <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-100">
            پروژه تحقیق در عملیات ۲
          </div>

          <h1 className="mb-3 text-2xl font-bold sm:text-4xl">
            مسئله فروشنده دوره‌گرد
          </h1>

          <p className="max-w-2xl text-sm leading-8 text-indigo-100 sm:text-base">
            حل مسئله TSP با استفاده از برنامه‌ریزی عدد صحیح،
            مدل MTZ و کتابخانه GLPK.js
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="rounded-xl bg-white/10 px-4 py-2">
              ۵ شهر
            </span>

            <span className="rounded-xl bg-white/10 px-4 py-2">
              ۲۰ متغیر تصمیم
            </span>

            <span className="rounded-xl bg-white/10 px-4 py-2">
              ۱۲ محدودیت MTZ
            </span>
          </div>
        </header>

        {/* Cost Matrix */}
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
              ماتریس هزینه‌ها
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              هزینه حرکت از هر شهر به سایر شهرها
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-center text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="rounded-r-xl px-4 py-4">
                    مبدأ / مقصد
                  </th>

                  {cities.map((city) => (
                    <th key={city} className="px-4 py-4">
                      شهر {city}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {costMatrix.map((row, i) => (
                  <tr
                    key={cities[i]}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <th className="bg-slate-50 px-4 py-4 font-semibold text-slate-700">
                      شهر {cities[i]}
                    </th>

                    {row.map((cost, j) => (
                      <td
                        key={j}
                        className={`px-4 py-4 font-medium ${
                          cost === null
                            ? "bg-slate-50 text-slate-300"
                            : "text-slate-700"
                        }`}
                      >
                        {cost ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            علامت — نشان‌دهنده حرکت از یک شهر به خودش است.
          </p>
        </section>

        {/* Solve Section */}
        <section className="mb-6 flex flex-col items-start justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              اجرای مدل ریاضی
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              با اجرای حل‌کننده، بهترین مسیر و هزینه کل محاسبه می‌شود.
            </p>
          </div>

          <button
            onClick={handleSolve}
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "در حال حل مسئله..." : "حل مسئله"}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700">
            {error}
          </div>
        )}

        {/* Solution */}
        {solution && (
          <>
            {/* Result Summary */}
            <section className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  هزینه کل مسیر بهینه
                </p>

                <div className="mt-3 text-4xl font-bold text-emerald-600">
                  {solution.totalCost}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  مقدار تابع هدف (Z)
                </p>
              </div>

              <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  مسیر بهینه
                </p>

                <div
                  dir="ltr"
                  className="mt-4 flex flex-wrap items-center gap-2 text-lg font-bold text-indigo-700"
                >
                  {solution.route.map((city, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2"
                    >
                      <span className="rounded-lg bg-indigo-50 px-3 py-2">
                        {city}
                      </span>

                      {index !== solution.route.length - 1 && (
                        <span className="text-slate-400">←</span>
                      )}
                    </span>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  شروع و پایان از شهر شماره ۱
                </p>
              </div>
            </section>

            {/* Validation */}
            <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    گزارش اعتبارسنجی
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    بررسی صحت جواب بر اساس محدودیت‌های مدل ریاضی
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    validation.isValid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {validation.isValid
                    ? "تمام بررسی‌ها موفق"
                    : "وجود خطا در اعتبارسنجی"}
                </span>
              </div>

              <div className="space-y-3">
                {validation.checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${
                        check.passed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {check.passed ? "✓" : "×"}
                    </span>

                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {check.title}
                      </h3>

                      <p className="mt-1 text-sm leading-7 text-slate-500">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-800">
                هزینه محاسبه‌شده مجدد:{" "}
                <strong>{validation.calculatedCost}</strong>
              </div>
            </section>

            {/* Decision Variables */}
            <section className="mb-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="mb-5 text-lg font-bold text-slate-800">
                  متغیرهای تصمیم انتخاب‌شده
                </h2>

                <div className="space-y-3">
                  {solution.selectedEdges.map((edge) => (
                    <div
                      key={edge.name}
                      className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3"
                    >
                      <span dir="ltr" className="font-semibold text-slate-700">
                        {edge.name}
                      </span>

                      <span className="font-bold text-emerald-700">
                        {edge.value}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  این متغیرها نشان‌دهنده مسیرهایی هستند که در جواب نهایی انتخاب شده‌اند.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="mb-5 text-lg font-bold text-slate-800">
                  متغیرهای کمکی MTZ
                </h2>

                <div className="space-y-3">
                  {solution.auxiliaryValues.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3"
                    >
                      <span dir="ltr" className="font-semibold text-slate-700">
                        {variable.name}
                      </span>

                      <span className="font-bold text-indigo-700">
                        {variable.value}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  این متغیرها ترتیب بازدید شهرها را در مدل MTZ مشخص می‌کنند.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-slate-400">
          پروژه تحقیق در عملیات ۲ | Traveling Salesman Problem | GLPK.js
        </footer>
      </div>
    </main>
  );
}