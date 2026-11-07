// src/lib/tspSolution.js

import { cities } from "@/data/tspData";

// استخراج مسیرها و متغیرهای انتخاب‌شده
export function extractSolution(solverResult) {
  if (!solverResult.isOptimal) {
    throw new Error("GLPK did not find an optimal solution.");
  }

  const variables = solverResult.result.vars;

  // 1. استخراج مسیرهای انتخاب‌شده
  const selectedEdges = Object.entries(variables)
    .filter(([name, value]) => {
      return name.startsWith("x_") && value > 0.5;
    })
    .map(([name, value]) => {
      const [, from, to] = name.split("_");

      return {
        name,
        from: Number(from),
        to: Number(to),
        value,
      };
    });

  // 2. استخراج مقادیر متغیرهای کمکی
  const auxiliaryValues = Object.entries(variables)
    .filter(([name]) => name.startsWith("u_"))
    .map(([name, value]) => ({
      name,
      value,
    }));

  // 3. ساخت مسیر نهایی از شهر شماره 1
  const route = [1];
  const visited = new Set([1]);

  let currentCity = 1;

  for (let step = 0; step < cities.length; step++) {
    const nextEdge = selectedEdges.find(
      (edge) => edge.from === currentCity
    );

    if (!nextEdge) {
      throw new Error(
        `No outgoing selected edge from city ${currentCity}`
      );
    }

    currentCity = nextEdge.to;
    route.push(currentCity);

    if (currentCity === 1) {
      break;
    }

    if (visited.has(currentCity)) {
      throw new Error("Invalid route: a city was visited twice.");
    }

    visited.add(currentCity);
  }

  // 4. اعتبارسنجی مسیر
  if (
    route.length !== cities.length + 1 ||
    route[route.length - 1] !== 1 ||
    visited.size !== cities.length
  ) {
    throw new Error("The extracted route is not a valid TSP tour.");
  }

  // 5. آماده‌سازی خروجی نهایی
  return {
    totalCost: solverResult.result.z,
    route,
    selectedEdges,
    auxiliaryValues,
  };
}