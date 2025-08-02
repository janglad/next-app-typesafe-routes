import { expect } from "vitest";

interface CustomMatchers<R = unknown> {
  toHaveExactQueryParams(expected: Record<string, string>): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toHaveExactQueryParams(received: string, expected: Record<string, string>) {
    const { isNot } = this;

    let url: URL;
    try {
      url = new URL(received, "http://localhost");
    } catch {
      return {
        message: () => `Expected ${received} to be a valid URL`,
        pass: false,
      };
    }

    const actualParams = Object.fromEntries(url.searchParams);
    const expectedKeys = Object.keys(expected).sort();
    const actualKeys = Object.keys(actualParams).sort();

    const keysMatch =
      expectedKeys.length === actualKeys.length &&
      expectedKeys.every((key) => actualKeys.includes(key));

    const valuesMatch =
      keysMatch &&
      expectedKeys.every((key) => actualParams[key] === expected[key]);

    const pass = keysMatch && valuesMatch;

    return {
      message: () => {
        if (isNot) {
          return `Expected URL not to have exact query params ${JSON.stringify(
            expected
          )}`;
        }

        if (!keysMatch) {
          return `Expected query params to have keys [${expectedKeys.join(
            ", "
          )}] but got [${actualKeys.join(", ")}]`;
        }

        const mismatchedValues = expectedKeys
          .filter((key) => actualParams[key] !== expected[key])
          .map(
            (key) =>
              `${key}: expected "${expected[key]}", got "${actualParams[key]}"`
          )
          .join(", ");

        return `Query param values don't match: ${mismatchedValues}`;
      },
      pass,
    };
  },
});
