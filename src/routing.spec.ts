import { describe, expect, it } from "vitest";
import { layout, page, Router } from "./routing.js";
import z from "zod";
import { parseAsString } from "nuqs";

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

const routes = page({
  path: "",
  children: [
    page({
      path: "staticNoChildren",
    }),
    page({
      path: "staticPageWithQuery",
      query: {
        page: {
          pageParam: parseAsString,
        },
        layout: {
          layoutParam: parseAsString,
        },
      },
      children: [
        page({
          path: "childPage",
        }),
      ],
    }),
    layout({
      path: "staticLayout",
      children: [
        page({
          path: "world",
        }),
        layout({
          path: "[layoutParam]",
          children: [
            page({
              path: "world",
            }),
            page({
              path: "[idTwo]",
              params: z.string().transform((val) => val.toUpperCase()),
              children: [
                page({
                  path: "world",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});
const router = new Router(routes);

describe("Router", () => {
  describe("route", () => {
    it("should return the correct data for a static route", (args) => {
      const route = router.route("/staticNoChildren", {}, {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/staticNoChildren");
    });
    it("should return noMatch error for a non-existent route", (args) => {
      const route = router.route("/hello" as any, {}, {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.error).toBeDefined();
      expect(route.error?._tag).toEqual("RoutingNoMatchingRouteError");
    });
    it("should return matchedWrongType error for a route that is a layout", (args) => {
      const route = router.route("/hello" as any, {}, {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.error).toBeDefined();
      expect(route.error?._tag).toEqual("RoutingNoMatchingRouteError");
    });
    it("should return the correct data for a dynamic route without a schema", (args) => {
      const route = router.route(
        "/staticLayout/[layoutParam]/world",
        {
          layoutParam: "hi",
        },
        {}
      );
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/staticLayout/hi/world");
    });
    it("should return the correct data for a dynamic route with a schema", (args) => {
      const route = router.route(
        "/staticLayout/[layoutParam]/[idTwo]",
        {
          layoutParam: "hi",
          idTwo: "bye",
        },
        {}
      );
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/staticLayout/hi/BYE");
    });
    it("should return the correct url for a route with query params", (args) => {
      const route = router.route(
        "/staticPageWithQuery",
        {},
        {
          pageParam: "hi",
        }
      );
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toHaveExactQueryParams({
        pageParam: "hi",
      });
    });
    it("Should not accept page params for children of that page", (args) => {
      const route = router.route(
        "/staticPageWithQuery/childPage",
        {},
        {
          // @ts-expect-error
          pageParam: "hi",
          layoutParam: "hi",
        }
      );
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toHaveExactQueryParams({
        layoutParam: "hi",
      });
    });
  });
  describe("makeParser", () => {
    it("should return a function that returns the correct data for a static route", (args) => {
      const parser = router.makeParser("/staticNoChildren");
      args.annotate(JSON.stringify({ parser, routes }, null, 2));
      expect(parser({}, {})).toEqual("/staticNoChildren");
    });
    it("should return a function that returns the correct data for a dynamic route", (args) => {
      const parser = router.makeParser("/staticLayout/[layoutParam]/[idTwo]");
      args.annotate(JSON.stringify({ parser, routes }, null, 2));
      expect(parser({ layoutParam: "hi", idTwo: "bye" }, {})).toEqual(
        "/staticLayout/hi/BYE"
      );
    });
  });
});
