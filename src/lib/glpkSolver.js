// src/lib/glpkSolver.js

import GLPK from "glpk.js";

import {
  decisionVariables,
  auxiliaryVariables,
  objective,
  constraints,
} from "./tspModel";

// تبدیل محدودیت‌های مدل خودمان به ساختار GLPK
function convertConstraints(glpk) {
  return constraints.map((constraint) => {
    let bounds;

    if (constraint.relation === "=") {
      bounds = {
        type: glpk.GLP_FX,
        lb: constraint.rhs,
        ub: constraint.rhs,
      };
    } else if (constraint.relation === "<=") {
      bounds = {
        type: glpk.GLP_UP,
        lb: 0,
        ub: constraint.rhs,
      };
    } else if (constraint.relation === ">=") {
      bounds = {
        type: glpk.GLP_LO,
        lb: constraint.rhs,
        ub: 0,
      };
    } else {
      throw new Error(`Unsupported relation: ${constraint.relation}`);
    }

    return {
      name: constraint.name,

      vars: constraint.variables.map((variable) => ({
        name: variable.name,
        coef: variable.coefficient,
      })),

      bnds: bounds,
    };
  });
}

// تبدیل مدل ریاضی به فرمت GLPK
function buildGlpkModel(glpk) {
  return {
    name: "TSP",

    objective: {
      direction: glpk.GLP_MIN,
      name: "total_cost",

      vars: objective.terms.map((term) => ({
        name: term.name,
        coef: term.coefficient,
      })),
    },

    subjectTo: convertConstraints(glpk),

    // متغیرهای دودویی
    binaries: decisionVariables.map((variable) => variable.name),

    // متغیرهای صحیح
    generals: auxiliaryVariables.map((variable) => variable.name),

    // کران متغیرهای کمکی
    bounds: auxiliaryVariables.map((variable) => ({
      name: variable.name,
      type: glpk.GLP_DB,
      lb: variable.lowerBound,
      ub: variable.upperBound,
    })),
  };
}

// اجرای حل‌کننده
export async function solveTSP() {
  // مقداردهی اولیه GLPK
  const glpk = await GLPK();

  // ساخت مدل قابل‌فهم برای GLPK
  const model = buildGlpkModel(glpk);

  // حل مسئله
  const result = await glpk.solve(model, {
    msglev: glpk.GLP_MSG_OFF,
    presol: true,
  });

  return {
    ...result,
    isOptimal: result.result.status === glpk.GLP_OPT,
  };
}
