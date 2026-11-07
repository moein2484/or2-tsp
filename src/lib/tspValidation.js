import {
  cities,
  costMatrix,
  numberOfCities,
} from "@/data/tspData";
import {
  buildModelConstraints,
  createDfjConstraint,
  formatConstraint,
  listDfjSubsets,
} from "@/lib/tspModel";

export function validateSolution(solverResult, solution) {
  const variables = solverResult.result.vars;
  const selectedEdges = solution.selectedEdges;
  const checks = [];
  const addCheck = (title, passed, detail) => checks.push({ title, passed, detail });

  addCheck(
    "بهینگی جواب",
    solverResult.isOptimal,
    solverResult.isOptimal
      ? "حل‌کننده یک جواب بهینه پیدا کرده است."
      : "جواب بهینه توسط حل‌کننده پیدا نشده است."
  );

  const outgoingCount = Object.fromEntries(cities.map((city) => [city, 0]));
  const incomingCount = Object.fromEntries(cities.map((city) => [city, 0]));
  for (const edge of selectedEdges) {
    outgoingCount[edge.from] += 1;
    incomingCount[edge.to] += 1;
  }

  const outgoingValid = cities.every((city) => outgoingCount[city] === 1);
  const incomingValid = cities.every((city) => incomingCount[city] === 1);
  addCheck(
    "محدودیت درجه خروجی",
    outgoingValid,
    outgoingValid
      ? "از هر شهر دقیقاً یک یال خروجی انتخاب شده است."
      : "تعداد یال‌های خروجی بعضی شهرها برابر یک نیست."
  );
  addCheck(
    "محدودیت درجه ورودی",
    incomingValid,
    incomingValid
      ? "به هر شهر دقیقاً یک یال ورودی انتخاب شده است."
      : "تعداد یال‌های ورودی بعضی شهرها برابر یک نیست."
  );

  const binaryValid = selectedEdges.length === numberOfCities &&
    selectedEdges.every((edge) => Math.abs(edge.value - 1) < 1e-6);
  addCheck(
    "دامنه متغیرهای دودویی",
    binaryValid,
    binaryValid
      ? "تمام متغیرهای انتخاب‌شده برابر ۱ هستند و سایر متغیرها صفرند."
      : "جواب با دامنه دودویی متغیرهای تصمیم سازگار نیست."
  );

  const routeSet = new Set(solution.route.slice(0, -1));
  const routeValid = solution.route.length === numberOfCities + 1 &&
    solution.route[0] === 1 &&
    solution.route[solution.route.length - 1] === 1 &&
    routeSet.size === numberOfCities &&
    cities.every((city) => routeSet.has(city));
  addCheck(
    "اتصال تور و نبود زیرتور",
    routeValid,
    routeValid
      ? "تمام شهرها در یک تور بازدید شده‌اند و مسیر به شهر آغازین بازمی‌گردد."
      : "مسیر شامل زیرتور، شهر تکراری یا شهر بازدیدنشده است."
  );

  const cutConstraints = (solverResult.dfjCuts ?? []).map(createDfjConstraint);
  const satisfiedCuts = cutConstraints.every((constraint) => {
    const lhs = constraint.variables.reduce(
      (sum, variable) => sum + variable.coefficient * (variables[variable.name] ?? 0),
      0
    );
    return lhs <= constraint.rhs + 1e-6;
  });
  addCheck(
    "محدودیت‌های DFJ تولیدشده",
    satisfiedCuts,
    cutConstraints.length === 0
      ? "در حل نهایی زیرتوری وجود نداشت که به برش DFJ نیاز داشته باشد."
      : satisfiedCuts
        ? `هر ${cutConstraints.length} برش DFJ اضافه‌شده در جواب نهایی برقرار است.`
        : "حداقل یکی از برش‌های DFJ در جواب نهایی نقض شده است."
  );

  const calculatedCost = selectedEdges.reduce(
    (total, edge) => total + costMatrix[edge.from - 1][edge.to - 1],
    0
  );
  const costValid =
    Math.abs(calculatedCost - solverResult.result.z) < 1e-6 &&
    Math.abs(calculatedCost - solution.totalCost) < 1e-6;
  addCheck(
    "صحت تابع هدف",
    costValid,
    costValid
      ? `هزینه بازحساب‌شده (${calculatedCost}) با مقدار هدف حل‌کننده برابر است.`
      : "هزینه بازحساب‌شده با مقدار هدف حل‌کننده برابر نیست."
  );

  const activeCutKeys = new Set(
    (solverResult.dfjCuts ?? []).map((subtour) => [...subtour].sort((a, b) => a - b).join(","))
  );
  const constraints = [
    ...buildModelConstraints(),
    ...listDfjSubsets().map((subtour) => ({
      ...createDfjConstraint(subtour),
      active: activeCutKeys.has([...subtour].sort((a, b) => a - b).join(",")),
    })),
  ];
  const displayedConstraints = [
    ...constraints.map((constraint) => ({
      ...constraint,
      formula: formatConstraint(constraint),
      value: constraint.variables.reduce(
        (sum, variable) => sum + variable.coefficient * (variables[variable.name] ?? 0),
        0
      ),
      passed: constraint.relation === "="
        ? Math.abs(
            constraint.variables.reduce(
              (sum, variable) => sum + variable.coefficient * (variables[variable.name] ?? 0),
              0
            ) - constraint.rhs
          ) < 1e-6
        : constraint.variables.reduce(
            (sum, variable) => sum + variable.coefficient * (variables[variable.name] ?? 0),
            0
          ) <= constraint.rhs + 1e-6,
    })),
  ];

  return {
    checks,
    isValid: checks.every((check) => check.passed),
    calculatedCost,
    constraints: displayedConstraints,
  };
}
