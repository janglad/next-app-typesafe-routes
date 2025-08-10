import { parseAsString } from "nuqs";
import { assert, describe, expect, it } from "vitest";
import z from "zod";
import {
  group,
  layout,
  page,
  Router,
  RoutingNoMatchingRouteError,
  type RoutingNoMatchingRouteErrorType,
} from "./router/server.js";

const routes = page("", {
  children: [
    layout("staticLayout", {
      children: [
        layout("[noValidationDynamicLayout]", {
          children: [
            page("staticPage"),
            page("[noValidationDynamicPage]", {
              children: [
                page("[toUpperCase]", {
                  params: z.string().transform((val) => val.toUpperCase()),
                }),
                page("[uuid]", {
                  params: z.uuid(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    page("staticPageAndLayoutQuery", {
      query: {
        layout: {
          layoutParam: parseAsString,
        },
        page: {
          pageParam: parseAsString,
        },
      },
      children: [
        page("[dynamicNoValidation]", {
          query: {
            page: {
              dynamicPagePageParam: parseAsString,
            },
            layout: {
              dynamicLayoutParam: parseAsString,
            },
          },
        }),
      ],
    }),
    page("staticPageWithSharedQuery", {
      query: {
        param1: parseAsString,
      },
      children: [
        page("staticPageWithSharedQueryChild", {
          query: {
            param2: parseAsString,
          },
        }),
      ],
    }),
    group("(group)", {
      query: {
        groupParam: parseAsString,
      },
      children: [
        page("staticPageWithSharedQueryChild"),
        group("(otherGroup)", {
          children: [page("staticPage")],
        }),
      ],
    }),
    page("[...catchAllNoChildren]"),
    page("[[...optionalCatchAllNoChildren]]"),
  ],
});

const router = new Router(routes);

describe("Router", () => {
  it("Should route the root page correctly", (args) => {
    const res = router.routeSafe("/", {}, {});
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("/");
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({});
  });
  it("Should route a route ending with a static page correctly", (args) => {
    const res = router.routeSafe(
      "/staticLayout/[noValidationDynamicLayout]/staticPage",
      {
        noValidationDynamicLayout: "param1",
      },
      {}
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("/staticLayout/param1/staticPage");
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({});
  });
  it("Should route a route ending with a dynamic page correctly", (args) => {
    const res = router.routeSafe(
      "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]",
      {
        noValidationDynamicLayout: "param1",
        noValidationDynamicPage: "param2",
      },
      {}
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("/staticLayout/param1/param2");
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({});
  });
  it("Should use a schema for dynamic routes that define one", (args) => {
    const res = router.routeSafe(
      "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
      {
        noValidationDynamicLayout: "param1",
        noValidationDynamicPage: "param2",
        toUpperCase: "param3",
      },
      {}
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("/staticLayout/param1/param2/PARAM3");
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({});
  });
  it("Should URL encode params correctly", (args) => {
    const res = router.routeSafe(
      "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
      {
        noValidationDynamicLayout: "param1",
        noValidationDynamicPage: "param2",
        toUpperCase: "param3/param4",
      },
      {}
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual(
      `/staticLayout/param1/param2/${encodeURIComponent("PARAM3/PARAM4")}`
    );
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({});
  });
  it("Should return the correct query page params", (args) => {
    const res = router.routeSafe(
      "/staticPageAndLayoutQuery",
      {},
      {
        layoutParam: "param1",
        pageParam: "param2",
      }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data?.startsWith("/staticPageAndLayoutQuery")).toBe(true);
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({
      layoutParam: "param1",
      pageParam: "param2",
    });
  });
  it("Should properly merge parent page/layout query params", (args) => {
    const res = router.routeSafe(
      "/staticPageAndLayoutQuery/[dynamicNoValidation]",
      {
        dynamicNoValidation: "param1",
      },
      {
        layoutParam: "param2",
        // @ts-expect-error -- this should not be accepted
        pageParam: "param3",
        dynamicPagePageParam: "param4",
        dynamicLayoutParam: "param5",
      }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeUndefined();
    expect(res.data?.startsWith("/staticPageAndLayoutQuery/param1")).toBe(true);
    expect(res.data).toHaveExactQueryParams({
      layoutParam: "param2",
      dynamicPagePageParam: "param4",
      dynamicLayoutParam: "param5",
    });
  });
  it("Should not allow routing to layout params", (args) => {
    const res = router.routeSafe(
      // @ts-expect-error -- this should not be accepted
      "/staticLayout/[noValidationDynamicLayout]",
      {
        noValidationDynamicLayout: "param1",
      },
      {
        layoutParam: "param2",
      }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeDefined();
    expect(res.error?._tag).toEqual("RoutingNoMatchingRouteError");
    expect(res.data).toBeUndefined();
    assert(RoutingNoMatchingRouteError.is(res.error));
    expect(res.error.type).toBe(
      "matchedWrongType" satisfies RoutingNoMatchingRouteErrorType
    );
  });
  it("Should not allow routing to non existing routes", (args) => {
    // @ts-expect-error -- this should not be accepted
    const res = router.routeSafe("/staticLayout/notARoute", {});
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeDefined();
    expect(res.error?._tag).toEqual("RoutingNoMatchingRouteError");
    expect(res.data).toBeUndefined();
  });

  it("Should allow routing to a page with shared query params", (args) => {
    const res = router.routeSafe(
      "/staticPageWithSharedQuery/staticPageWithSharedQueryChild",
      {},
      { param1: "param1", param2: "param2" }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeUndefined();
    expect(
      res.data?.startsWith(
        "/staticPageWithSharedQuery/staticPageWithSharedQueryChild"
      )
    ).toBe(true);
    expect(res.data).toHaveExactQueryParams({
      param1: "param1",
      param2: "param2",
    });
  });
  it("Should route children of a group correctly", (args) => {
    const res = router.routeSafe(
      "/(group)/staticPageWithSharedQueryChild",
      {},
      { groupParam: "param1" }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data?.startsWith("/staticPageWithSharedQueryChild")).toBe(true);
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({
      groupParam: "param1",
    });
  });
  it("Should route children of multiple groups correctly", (args) => {
    const res = router.routeSafe(
      "/(group)/(otherGroup)/staticPage",
      {},
      { groupParam: "param1" }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data?.startsWith("/staticPage")).toBe(true);
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({
      groupParam: "param1",
    });
  });
  it("Should not allow routing to groups", (args) => {
    const res = router.routeSafe(
      // @ts-expect-error -- this should not be accepted
      "/(group)",
      {},
      { groupParam: "param1" }
    );

    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeDefined();
    expect(res.error?._tag).toEqual("RoutingNoMatchingRouteError");
    assert(RoutingNoMatchingRouteError.is(res.error));
    expect(res.error.type).toBe(
      "matchedWrongType" satisfies RoutingNoMatchingRouteErrorType
    );
    expect(res.data).toBeUndefined();
  });

  it("Should route catch all params correctly when the last segment is a catch all", (args) => {
    routes.children[4]["~paramSchemaMap"];

    const res = router.routeSafe(
      "/[...catchAllNoChildren]",
      {
        catchAllNoChildren: ["param1", "param2"],
      },
      {}
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("/param1/param2");
  });

  it("Should route optional catch all at end of route without param correctly", (args) => {
    const res = router.routeSafe(
      "/[[...optionalCatchAllNoChildren]]",
      {
        optionalCatchAllNoChildren: undefined,
      },
      {}
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("/");
  });

  it("Should route optional catch all at end of route with param correctly", (args) => {
    const res = router.routeSafe(
      "/[[...optionalCatchAllNoChildren]]",
      {
        optionalCatchAllNoChildren: ["param1", "param2"],
      },
      {}
    );
  });

  describe("implementPage", () => {
    it("should return a sync function if the implementation is sync", () => {
      const res = router.implementPage(
        "/staticPageAndLayoutQuery",
        () => "Output"
      );
      expect(res).not.toBeInstanceOf(Promise);
      expect(res(emptyPageProps)).toEqual("Output");
    });
    it("should return a async function if the implementation is async", async () => {
      const res = router.implementPage(
        "/staticPageAndLayoutQuery",
        async () => "Output"
      )(emptyPageProps);
      expect(res).toBeInstanceOf(Promise);
      await expect(res).resolves.toEqual("Output");
    });
    it("should properly parse params", async () => {
      const res = router.implementPage(
        "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]",
        async ({ parse: parseUnsafe }) => {
          const { params } = await parseUnsafe();
          return (
            params.noValidationDynamicLayout +
            "-" +
            params.noValidationDynamicPage
          );
        }
      )({
        params: Promise.resolve({
          noValidationDynamicLayout: "param1",
          noValidationDynamicPage: "param2",
        }),
        searchParams: Promise.resolve({}),
      });
      await expect(res).resolves.toEqual("param1-param2");
    });
    it("Should properly parse query params", async () => {
      const res = router.implementPage(
        "/staticPageAndLayoutQuery",
        async ({ parse: parseUnsafe }) => {
          const { query } = await parseUnsafe();
          return `${query.layoutParam}-${query.pageParam}`;
        }
      )({
        params: Promise.resolve({}),
        searchParams: Promise.resolve({
          layoutParam: "param1",
          pageParam: "param2",
        }),
      });
      await expect(res).resolves.toEqual("param1-param2");
    });
  });
  describe("implementLayout", () => {
    it("should return a sync function if the implementation is sync", () => {
      const res = router.implementLayout(
        "/staticPageAndLayoutQuery",
        () => "Output"
      );
      expect(res).not.toBeInstanceOf(Promise);
      expect(res(emptyLayoutProps)).toEqual("Output");
    });
    it("should return a async function if the implementation is async", async () => {
      const res = router.implementLayout(
        "/staticPageAndLayoutQuery",
        async () => "Output"
      )(emptyLayoutProps);
      expect(res).toBeInstanceOf(Promise);
      await expect(res).resolves.toEqual("Output");
    });
    it("should properly parse params", async () => {
      const res = router.implementLayout(
        "/staticLayout/[noValidationDynamicLayout]",
        async ({ parse: parseUnsafe }) => {
          const { params } = await parseUnsafe();
          return params.noValidationDynamicLayout;
        }
      )({
        params: Promise.resolve({
          noValidationDynamicLayout: "param1",
        }),
        searchParams: Promise.resolve({}),
        children: undefined,
      });
      await expect(res).resolves.toEqual("param1");
    });
    it("Should properly parse query params", async () => {
      const res = router.implementLayout(
        "/staticPageAndLayoutQuery",
        async ({ parse: parseUnsafe }) => {
          const { query } = await parseUnsafe();
          return `${query.layoutParam}-${
            // @ts-expect-error -- this should not be accepted
            query.pageParam
          }`;
        }
      )({
        params: Promise.resolve({}),
        searchParams: Promise.resolve({
          layoutParam: "param1",
          // Input here is just typed as generic query params input, so this won't error
          pageParam: "param2",
        }),
        children: undefined,
      });
      await expect(res).resolves.toEqual("param1-undefined");
    });
  });
});

const emptyPageProps = {
  searchParams: Promise.resolve({}),
  params: Promise.resolve({}),
};

const emptyLayoutProps = {
  searchParams: Promise.resolve({}),
  params: Promise.resolve({}),
  children: undefined,
};
