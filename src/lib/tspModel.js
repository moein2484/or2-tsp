import {
  cities,
  costMatrix,
  numberOfCities,
} from "@/data/tspData";

export const decisionVariables = cities.flatMap((from) =>
  cities
    .filter((to) => to !== from)
    .map((to) => ({
      name: `x_${from}_${to}`,
      from,
      to,
      coefficient: costMatrix[from - 1][to - 1],
      type: "binary",
    }))
);

export const objective = {
  direction: "min",
  terms: decisionVariables.map(({ name, coefficient }) => ({
    name,
    coefficient,
  })),
};

export const variableConstraints = decisionVariables.map((variable) => ({
  name: `binary_${variable.name}`,
  description: `${variable.name} ∈ {0, 1}`,
  type: "binary",
  variables: [{ name: variable.name, coefficient: 1 }],
  relation: "between",
  lowerBound: 0,
  upperBound: 1,
}));

export const degreeConstraints = [
  ...cities.map((city) => ({
    name: `out_city_${city}`,
    description: `از شهر ${city} دقیقاً یک یال خارج می‌شود`,
    variables: decisionVariables
      .filter((variable) => variable.from === city)
      .map(({ name }) => ({ name, coefficient: 1 })),
    relation: "=",
    rhs: 1,
  })),
  ...cities.map((city) => ({
    name: `in_city_${city}`,
    description: `به شهر ${city} دقیقاً یک یال وارد می‌شود`,
    variables: decisionVariables
      .filter((variable) => variable.to === city)
      .map(({ name }) => ({ name, coefficient: 1 })),
    relation: "=",
    rhs: 1,
  })),
];

export function createDfjConstraint(subtour) {
  const members = new Set(subtour);
  const terms = decisionVariables
    .filter((variable) => members.has(variable.from) && members.has(variable.to))
    .map(({ name }) => ({ name, coefficient: 1 }));

  return {
    name: `dfj_${[...subtour].sort((a, b) => a - b).join("_")}`,
    description: `حذف زیرتور میان شهرهای {${subtour.join(", ")}}`,
    variables: terms,
    relation: "<=",
    rhs: subtour.length - 1,
  };
}

export function createDfjConstraints(subtours) {
  return subtours.map(createDfjConstraint);
}

export function formatObjective() {
  const terms = objective.terms.map(({ name, coefficient }) =>
    `${coefficient}·${name}`
  );
  return `min Z = ${terms.join(" + ")}`;
}

export function formatConstraint(constraint) {
  const lhs = constraint.variables
    .map(({ name, coefficient }) => {
      if (coefficient === 1) return name;
      if (coefficient === -1) return `−${name}`;
      return `${coefficient}·${name}`;
    })
    .join(" + ")
    .replaceAll("+ −", "− ");

  if (constraint.relation === "between") {
    return `${constraint.lowerBound} ≤ ${constraint.variables[0].name} ≤ ${constraint.upperBound}`;
  }

  return `${lhs} ${constraint.relation} ${constraint.rhs}`;
}

export function formatVariableBounds() {
  return decisionVariables.map(({ name }) => `${name} ∈ {0, 1}`);
}

export function buildModelConstraints(dfjConstraints = []) {
  return [...degreeConstraints, ...createDfjConstraints(dfjConstraints)];
}

export { numberOfCities };
