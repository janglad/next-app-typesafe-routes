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
    describe("simple shared query parameters", () => {
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
    });

    describe("separated page/layout query parameters", () => {
      const routesWithSeparatedQuery = page({
        path: "",
        children: [
          page({
            path: "dashboard",
            queryParams: {
              page: {
                activeTab: parseAsString.withDefault("overview"),
              },
              layout: {
                theme: parseAsString.withDefault("light"),
              },
            },
            children: [
              page({
                path: "reports",
                queryParams: {
                  reportType: parseAsString,
                },
              }),
            ],
          }),
        ],
      });
      const separatedRouter = new Router(routesWithSeparatedQuery);

      it("should handle page-specific query params for the page itself", () => {
        const route = separatedRouter.route("/dashboard", {}, {
          activeTab: "settings",
          theme: "dark",
        });
        expect(route.ok).toBe(true);
        expect(route.data).toEqual("/dashboard?theme=dark&activeTab=settings");
      });

                              it("should inherit layout query params from parent to child", () => {
          const route = separatedRouter.route("/dashboard/reports", {}, {
            reportType: "sales",
            theme: "dark", // This should be inherited from parent layout
          });
          expect(route.ok).toBe(true);
          expect(route.data).toEqual("/dashboard/reports?theme=dark&reportType=sales");
        });
    });

    describe("query parameter inheritance", () => {
      const inheritanceRoutes = page({
        path: "",
        children: [
          layout({
            path: "app",
            queryParams: {
              theme: parseAsString.withDefault("light"),
              lang: parseAsString.withDefault("en"),
            },
            children: [
              layout({
                path: "workspace",
                queryParams: {
                  sidebar: parseAsBoolean.withDefault(true),
                },
                children: [
                  page({
                    path: "projects",
                    queryParams: {
                      sort: parseAsString.withDefault("name"),
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      });
      const inheritanceRouter = new Router(inheritanceRoutes);

      it("should inherit query params from multiple parent layouts", () => {
        const route = inheritanceRouter.route("/app/workspace/projects", {}, {
          theme: "dark",      // From /app layout
          lang: "fr",         // From /app layout
          sidebar: false,     // From /workspace layout
          sort: "date",       // From /projects page
        });
        expect(route.ok).toBe(true);
        expect(route.data).toEqual("/app/workspace/projects?theme=dark&lang=fr&sidebar=false&sort=date");
      });
    });

    describe("complex page+layout scenarios", () => {
      const complexRoutes = page({
        path: "",
        children: [
          page({
            path: "user",
            queryParams: {
              page: {
                activeTab: parseAsString.withDefault("profile"),
              },
              layout: {
                mode: parseAsString.withDefault("view"),
              },
            },
            children: [
              page({
                path: "settings",
                queryParams: {
                  section: parseAsString,
                },
              }),
            ],
          }),
        ],
      });
      const complexRouter = new Router(complexRoutes);

      it("should handle page with separated query params", () => {
        const route = complexRouter.route("/user", {}, {
          activeTab: "security",
          mode: "edit",
        });
        expect(route.ok).toBe(true);
        expect(route.data).toEqual("/user?mode=edit&activeTab=security");
      });

      it("should inherit layout params but not page params from parent", () => {
        const route = complexRouter.route("/user/settings", {}, {
          mode: "edit",     // Inherited from parent layout
          section: "privacy", // Page-specific
          // activeTab should NOT be inherited as it's page-specific on parent
        });
        expect(route.ok).toBe(true);
        expect(route.data).toEqual("/user/settings?mode=edit&section=privacy");
      });
    });
  });
});
