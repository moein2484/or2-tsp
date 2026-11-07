import {
  cities,
  costMatrix,
  numberOfCities,
} from "@/data/tspData";

export function validateSolution(solverResult, solution) {
  const variables = solverResult.result.vars;
  const selectedEdges = solution.selectedEdges;

  const checks = [];

  // افزودن نتیجه هر بررسی
  const addCheck = (title, passed, detail) => {
    checks.push({
      title,
      passed,
      detail,
    });
  };

  // 1. بررسی وضعیت بهینه بودن جواب
  addCheck(
    "بهینگی جواب",
    solverResult.isOptimal,
    solverResult.isOptimal
      ? "حل‌کننده یک جواب بهینه پیدا کرده است."
      : "جواب بهینه توسط حل‌کننده پیدا نشده است."
  );

  // 2. بررسی تعداد مسیرهای ورودی و خروجی
  const outgoingCount = Object.fromEntries(
    cities.map((city) => [city, 0])
  );

  const incomingCount = Object.fromEntries(
    cities.map((city) => [city, 0])
  );

  for (const edge of selectedEdges) {
    outgoingCount[edge.from]++;
    incomingCount[edge.to]++;
  }

  const outgoingValid = cities.every(
    (city) => outgoingCount[city] === 1
  );

  const incomingValid = cities.every(
    (city) => incomingCount[city] === 1
  );

  addCheck(
    "محدودیت خروج از شهرها",
    outgoingValid,
    outgoingValid
      ? "از هر شهر دقیقاً یک مسیر خروجی انتخاب شده است."
      : "حداقل یک شهر تعداد مسیر خروجی نامعتبر دارد."
  );

  addCheck(
    "محدودیت ورود به شهرها",
    incomingValid,
    incomingValid
      ? "به هر شهر دقیقاً یک مسیر ورودی وجود دارد."
      : "حداقل یک شهر تعداد مسیر ورودی نامعتبر دارد."
  );

  // 3. بررسی متغیرهای کمکی MTZ
  const auxiliaryValues = {};

  for (const city of cities) {
    if (city !== 1) {
      auxiliaryValues[city] = variables[`u_${city}`];
    }
  }

  const auxiliaryValid = cities
    .filter((city) => city !== 1)
    .every((city) => {
      const value = auxiliaryValues[city];

      return (
        Number.isFinite(value) &&
        Number.isInteger(Math.round(value)) &&
        value >= 2 - 1e-6 &&
        value <= numberOfCities + 1e-6
      );
    });

  addCheck(
    "محدوده متغیرهای کمکی",
    auxiliaryValid,
    auxiliaryValid
      ? "تمام متغیرهای کمکی صحیح و در بازه مجاز هستند."
      : "حداقل یک متغیر کمکی خارج از محدوده مجاز است."
  );

  // 4. بررسی تمام محدودیت‌های MTZ
  let mtzValid = true;

  for (const i of cities) {
    for (const j of cities) {
      if (i === 1 || j === 1 || i === j) {
        continue;
      }

      const xValue = variables[`x_${i}_${j}`] ?? 0;

      const lhs =
        auxiliaryValues[i] -
        auxiliaryValues[j] +
        numberOfCities * xValue;

      if (lhs > numberOfCities - 1 + 1e-6) {
        mtzValid = false;
      }
    }
  }

  addCheck(
    "محدودیت‌های MTZ",
    mtzValid,
    mtzValid
      ? "تمام ۱۲ محدودیت MTZ برقرار هستند."
      : "حداقل یکی از محدودیت‌های MTZ نقض شده است."
  );

  // 5. بررسی نبود زیرتور
  const routeSet = new Set(solution.route.slice(0, -1));

  const routeValid =
    solution.route.length === numberOfCities + 1 &&
    solution.route[0] === 1 &&
    solution.route[solution.route.length - 1] === 1 &&
    routeSet.size === numberOfCities &&
    cities.every((city) => routeSet.has(city));

  addCheck(
    "نبود زیرتور (Subtour)",
    routeValid,
    routeValid
      ? "تمام شهرها در یک تور واحد بازدید شده‌اند و مسیر به شهر اول بازمی‌گردد."
      : "مسیر شامل زیرتور، شهر تکراری یا شهر بازدیدنشده است."
  );

  // 6. محاسبه مجدد هزینه مسیر
  const calculatedCost = selectedEdges.reduce(
    (total, edge) => {
      return total + costMatrix[edge.from - 1][edge.to - 1];
    },
    0
  );

  const costValid =
    Math.abs(calculatedCost - solverResult.result.z) < 1e-6 &&
    Math.abs(calculatedCost - solution.totalCost) < 1e-6;

  addCheck(
    "صحت تابع هدف",
    costValid,
    costValid
      ? `هزینه محاسبه‌شده (${calculatedCost}) با خروجی GLPK برابر است.`
      : "هزینه محاسبه‌شده با خروجی حل‌کننده مطابقت ندارد."
  );

  return {
    checks,
    isValid: checks.every((check) => check.passed),
    calculatedCost,
  };
}