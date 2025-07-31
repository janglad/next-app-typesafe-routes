import { describe, expect, it } from "vitest";
import { layout, page, Router } from "./routing.js";
import z from "zod";
import { parseAsString, parseAsInteger, parseAsBoolean } from "nuqs/server";

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
  describe("makeParser", () => {
    it("should return a function that returns the correct data for a static route", (args) => {
      const parser = router.makeParser("/home");
      args.annotate(JSON.stringify({ parser, routes }, null, 2));
      expect(parser({})).toEqual("/home");
    });
    it("should return a function that returns the correct data for a dynamic route", (args) => {
      const parser = router.makeParser("/hello/[idOne]/[idTwo]");
      args.annotate(JSON.stringify({ parser, routes }, null, 2));
      expect(parser({ idOne: "hi", idTwo: "bye" })).toEqual("/hello/hi/BYE");
    });
  });

  describe("query parameters", () => {
    const routesWithQuery = page({
      path: "",
      children: [
        page({
          path: "home",
          queryParams: {
            search: parseAsString,
            limit: parseAsInteger.withDefault(10),
          },
        }),
        page({
          path: "profile",
          queryParams: {
            tab: parseAsString.withDefault("general"),
          },
        }),
        layout({
          path: "admin",
          queryParams: {
            mode: parseAsString.withDefault("view"),
          },
          children: [
            page({
              path: "users",
              queryParams: {
                filter: parseAsString,
                page: parseAsInteger.withDefault(1),
              },
            }),
          ],
        }),
      ],
    });
    const queryRouter = new Router(routesWithQuery);

    it("should handle routes with query parameters", () => {
      const route = queryRouter.route("/home", {}, {
        search: "test",
        limit: 20,
      });
      expect(route.ok).toBe(true);
      expect(route.data).toEqual("/home?search=test&limit=20");
    });

    it("should handle routes with some query parameters omitted", () => {
      const route = queryRouter.route("/home", {}, {
        search: "test",
      });
      expect(route.ok).toBe(true);
      expect(route.data).toEqual("/home?search=test");
    });

    it("should handle routes with no query parameters", () => {
      const route = queryRouter.route("/home", {});
      expect(route.ok).toBe(true);
      expect(route.data).toEqual("/home");
    });

    it("should handle page-specific query params differently from layout", () => {
      const route = queryRouter.route("/admin/users", {}, {
        filter: "active",
        page: 2,
      });
      expect(route.ok).toBe(true);
      expect(route.data).toEqual("/admin/users?filter=active&page=2");
    });
  });
});
