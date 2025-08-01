import { describe, expect, it } from "vitest";
import { layout, page, Router } from "./routing.js";
import z from "zod";
import { parseAsString } from "nuqs";

const routes = page({
  path: "",
  params: undefined,
  children: [
    page({
      path: "staticNoChildren",
      params: undefined,
    }),
    page({
      path: "staticPageWithQuery",
      query: {
        page: {
          pageParam: parseAsString,
        },
        layout: {},
      },
    }),
    layout({
      path: "staticLayout",
      params: undefined,
      children: [
        page({
          path: "world",
        }),
        layout({
          path: "[layoutParam]",
          params: undefined,
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
      expect(route.data).toEqual("/staticPageWithQuery?pageParam=hi");
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
