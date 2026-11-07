import {
  cities,
  costMatrix,
  numberOfCities,
} from "@/data/tspData";

// 1. ساخت متغیرهای تصمیم x_ij
const decisionVariables = [];

for (const i of cities) {
  for (const j of cities) {
    if (i !== j) {
      decisionVariables.push({
        name: `x_${i}_${j}`,
        coefficient: costMatrix[i - 1][j - 1],
        type: "binary",
      });
    }
  }
}

// 2. ساخت متغیرهای کمکی u_i
// شهر اول نقطه شروع است و متغیر کمکی ندارد.
const auxiliaryVariables = [];

for (const i of cities) {
  if (i !== 1) {
    auxiliaryVariables.push({
      name: `u_${i}`,
      type: "integer",
      lowerBound: 2,
      upperBound: numberOfCities,
    });
  }
}

// 3. ساخت تابع هدف
const objective = {
  direction: "min",
  terms: decisionVariables.map((variable) => ({
    name: variable.name,
    coefficient: variable.coefficient,
  })),
};

// 4. ساخت محدودیت‌های ورود و خروج
const constraints = [];

// محدودیت خروج از هر شهر
for (const i of cities) {
  const variables = [];

  for (const j of cities) {
    if (i !== j) {
      variables.push({
        name: `x_${i}_${j}`,
        coefficient: 1,
      });
    }
  }

  constraints.push({
    name: `out_city_${i}`,
    variables,
    relation: "=",
    rhs: 1,
  });
}

// محدودیت ورود به هر شهر
for (const j of cities) {
  const variables = [];

  for (const i of cities) {
    if (i !== j) {
      variables.push({
        name: `x_${i}_${j}`,
        coefficient: 1,
      });
    }
  }

  constraints.push({
    name: `in_city_${j}`,
    variables,
    relation: "=",
    rhs: 1,
  });
}

// 5. ساخت محدودیت‌های MTZ
for (const i of cities) {
  for (const j of cities) {
    // شهر اول در محدودیت‌های MTZ شرکت نمی‌کند.
    if (i !== 1 && j !== 1 && i !== j) {
      constraints.push({
        name: `mtz_${i}_${j}`,

        variables: [
          {
            name: `u_${i}`,
            coefficient: 1,
          },
          {
            name: `u_${j}`,
            coefficient: -1,
          },
          {
            name: `x_${i}_${j}`,
            coefficient: numberOfCities,
          },
        ],

        relation: "<=",
        rhs: numberOfCities - 1,
      });
    }
  }
}

export {
  decisionVariables,
  auxiliaryVariables,
  objective,
  constraints,
};