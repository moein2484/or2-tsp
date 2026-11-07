"use client";

import { useState } from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import { cities, costMatrix } from "@/data/tspData";
import { solveTSP } from "@/lib/glpkSolver";
import { extractSolution } from "@/lib/tspSolution";
import { validateSolution } from "@/lib/tspValidation";
import { formatObjective, formatVariableBounds } from "@/lib/tspModel";

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
      const solverResult = await solveTSP();
      const extractedSolution = extractSolution(solverResult);
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
            برش‌های زیرتور DFJ و کتابخانه GLPK.js
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="rounded-xl bg-white/10 px-4 py-2">
              ۵ شهر
            </span>

            <span className="rounded-xl bg-white/10 px-4 py-2">
              ۲۰ متغیر دودویی
            </span>

            <span className="rounded-xl bg-white/10 px-4 py-2">
              روش برش DFJ
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
                        <span className="text-slate-400">→</span>
                      )}
                    </span>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  شروع و پایان از شهر شماره ۱
                </p>
              </div>
            </section>

          </>
        )}

        {solution && validation && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                تابع هدف و همه محدودیت‌های مدل
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                مدل پایه و همهٔ قیود معتبر DFJ برای زیرمجموعه‌های شهرها نمایش داده می‌شوند؛ موارد استفاده‌شده در حل مشخص شده‌اند.
              </p>
            </div>

            <div className="mb-6 rounded-2xl bg-slate-900 p-5 text-white">
              <p className="mb-2 text-sm font-semibold text-indigo-200">تابع هدف</p>
              <div dir="ltr" className="overflow-x-auto text-sm leading-7">
                <InlineMath math={formatObjective()} />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 font-bold text-slate-800">
                دامنه متغیرهای تصمیم ({formatVariableBounds().length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {formatVariableBounds().map((formula) => (
                  <span key={formula} dir="ltr" className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-700">
                    <InlineMath math={formula} />
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800">
                محدودیت‌ها ({validation.constraints.length})
              </h3>
              {validation.constraints.map((constraint) => (
                <div
                  key={constraint.name}
                  className={`rounded-2xl border p-4 ${constraint.passed ? "border-emerald-100 bg-emerald-50/50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {constraint.description}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${constraint.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {constraint.active ? "برش فعال در این حل" : constraint.passed ? "برقرار" : "نقض‌شده"}
                    </span>
                  </div>
                  <div dir="ltr" className="flex flex-wrap items-center justify-between gap-3 text-left text-xs leading-6 text-slate-600">
                    <InlineMath math={constraint.formula} />
                    <span dir="rtl">
                      مقدار سمت چپ: <InlineMath math={String(constraint.value)} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-slate-400">
          پروژه تحقیق در عملیات ۲ | Traveling Salesman Problem | GLPK.js
        </footer>
      </div>
    </main>
  );
}
