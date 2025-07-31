import { describe, expect, it } from "vitest";
import { layout, page, Router } from "./routing.js";
import z from "zod";

const routes = page({
  path: "",
  params: undefined,
  children: [
    page({
      path: "home",
      params: undefined,
    }),
    layout({
      path: "hello",
      params: undefined,
      children: [
        page({
          path: "world",
        }),
        layout({
          path: "[idOne]",
          params: undefined,
          children: [
            page({
              path: "world",
            }),
            page({
              path: "[idTwo]",
              params: z.string().transform((val) => val.toUpperCase()),
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
      const route = router.route("/home", {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/home");
    });
    it("should return noMatch error for a non-existent route", (args) => {
      const route = router.route("/hello" as any, {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.error).toBeDefined();
      expect(route.error?._tag).toEqual("RoutingNoMatchingRouteError");
    });
    it("should return matchedWrongType error for a route that is a layout", (args) => {
      const route = router.route("/hello" as any, {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.error).toBeDefined();
      expect(route.error?._tag).toEqual("RoutingNoMatchingRouteError");
    });
    it("should return the correct data for a dynamic route without a schema", (args) => {
      const route = router.route("/hello/[idOne]/world", {
        idOne: "hi",
      });
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/hello/hi/world");
    });
    it("should return the correct data for a dynamic route with a schema", (args) => {
      const route = router.route("/hello/[idOne]/[idTwo]", {
        idOne: "hi",
        idTwo: "bye",
      });
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/hello/hi/BYE");
    });
  });
});
