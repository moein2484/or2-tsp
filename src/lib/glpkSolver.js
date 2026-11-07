import GLPK from "glpk.js";

import {
  buildModelConstraints,
  decisionVariables,
  objective,
} from "./tspModel";

function convertConstraints(glpk, constraints) {
  return constraints.map((constraint) => {
    const bounds = constraint.relation === "="
      ? {
          type: glpk.GLP_FX,
          lb: constraint.rhs,
          ub: constraint.rhs,
        }
      : {
          type: glpk.GLP_UP,
          lb: 0,
          ub: constraint.rhs,
        };

    return {
      name: constraint.name,
      vars: constraint.variables.map(({ name, coefficient }) => ({
        name,
        coef: coefficient,
      })),
      bnds: bounds,
    };
  });
}

function buildGlpkModel(glpk, dfjConstraints) {
  return {
    name: "TSP_DFJ",
    objective: {
      direction: glpk.GLP_MIN,
      name: "total_cost",
      vars: objective.terms.map(({ name, coefficient }) => ({
        name,
        coef: coefficient,
      })),
    },
    subjectTo: convertConstraints(glpk, buildModelConstraints(dfjConstraints)),
    binaries: decisionVariables.map(({ name }) => name),
  };
}

function findSubtours(selectedEdges, cities) {
  const nextCity = new Map(selectedEdges.map(({ from, to }) => [from, to]));
  const visited = new Set();
  const subtours = [];

  for (const start of cities) {
    if (visited.has(start)) continue;

    const tour = [];
    let current = start;

    while (!visited.has(current)) {
      visited.add(current);
      tour.push(current);
      current = nextCity.get(current);
      if (current === undefined) break;
    }

    if (tour.length > 0 && current !== undefined) subtours.push(tour);
  }

  return subtours;
}

export async function solveTSP() {
  const { cities } = await import("@/data/tspData");
  const glpk = await GLPK();
  const dfjCuts = [];
  const cutKeys = new Set();
  let result;
  let iterations = 0;

  while (true) {
    result = await glpk.solve(buildGlpkModel(glpk, dfjCuts), {
      msglev: glpk.GLP_MSG_OFF,
      presol: true,
    });
    iterations += 1;

    if (result.result.status !== glpk.GLP_OPT) {
      throw new Error("GLPK did not find an optimal solution.");
    }

    const selectedEdges = Object.entries(result.result.vars)
      .filter(([name, value]) => name.startsWith("x_") && value > 0.5)
      .map(([name, value]) => {
        const [, from, to] = name.split("_");
        return { name, from: Number(from), to: Number(to), value };
      });
    const subtours = findSubtours(selectedEdges, cities)
      .filter((subtour) => subtour.length < cities.length);

    if (subtours.length === 0) break;

    for (const subtour of subtours) {
      const key = [...subtour].sort((a, b) => a - b).join(",");
      if (!cutKeys.has(key)) {
        cutKeys.add(key);
        dfjCuts.push(subtour);
      }
    }
  }

  return {
    ...result,
    isOptimal: result.result.status === glpk.GLP_OPT,
    dfjCuts,
    iterations,
  };
}
