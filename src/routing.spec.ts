import { assert, describe, expect, it } from "vitest";
import {
  layout,
  page,
  Router,
  RoutingNoMatchingRouteError,
  type AllPaths,
  type GetRouteSchema,
  type RoutingNoMatchingRouteErrorType,
} from "./routing.js";
import z from "zod";
import { parseAsString } from "nuqs";
import { bench } from "@ark/attest";

const routes = page({
  path: "",
  children: [
    layout({
      path: "staticLayout",
      children: [
        layout({
          path: "[noValidationDynamicLayout]",
          children: [
            page({
              path: "staticPage",
            }),
            page({
              path: "[noValidationDynamicPage]",
              children: [
                page({
                  path: "[toUpperCase]",
                  params: z.string().transform((val) => val.toUpperCase()),
                }),
                page({
                  path: "[uuid]",
                  params: z.string().uuid(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    page({
      path: "staticPageAndLayoutQuery",
      query: {
        layout: {
          layoutParam: parseAsString,
        },
        page: {
          pageParam: parseAsString,
        },
      },
      children: [
        page({
          path: "[dynamicNoValidation]",
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
  ],
});

const router = new Router(routes);

describe("Router", () => {
  it("Should route the root page correctly", (args) => {
    const res = router.route("", {}, {});
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.data).toEqual("");
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({});
  });
  it("Should route a route ending with a static page correctly", (args) => {
    const res = router.route(
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
    const res = router.route(
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
    const res = router.route(
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
    const res = router.route(
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
    const res = router.route(
      "/staticPageAndLayoutQuery",
      {},
      {
        layoutParam: "param1",
        pageParam: "param2",
      }
    );
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeUndefined();
    expect(res.data).toHaveExactQueryParams({
      layoutParam: "param1",
      pageParam: "param2",
    });
  });
  it("Should properly merge parent page/layout query params", (args) => {
    const res = router.route(
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
    expect(res.data).toHaveExactQueryParams({
      layoutParam: "param2",
      dynamicPagePageParam: "param4",
      dynamicLayoutParam: "param5",
    });
  });
  it("Should not allow routing to layout params", (args) => {
    const res = router.route(
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
    const res = router.route("/staticLayout/notARoute", {}, {});
    args.annotate(JSON.stringify(res, null, 2));
    expect(res.error).toBeDefined();
    expect(res.error?._tag).toEqual("RoutingNoMatchingRouteError");
    expect(res.data).toBeUndefined();
  });
});

bench("simple route config", () => {
  page({
    path: "",
    children: [
      page({
        path: "staticPage",
      }),
    ],
  });
}).types([30, "instantiations"]);

bench("Simple route config with inferred params", () => {
  page({
    path: "",
    children: [
      page({
        path: "[dynamicPage]",
      }),
    ],
  });
}).types([45, "instantiations"]);

bench("Simple route config with query params", () => {
  page({
    path: "",
    children: [
      page({
        path: "staticPage",
        query: {
          page: {
            pageParam: parseAsString,
          },
          layout: {
            layoutParam: parseAsString,
          },
        },
      }),
    ],
  });
}).types([56, "instantiations"]);

bench("Larger route config", () => {
  page({
    path: "",
    children: [
      layout({
        path: "staticLayout",
        children: [
          layout({
            path: "[noValidationDynamicLayout]",
            children: [
              page({
                path: "staticPage",
              }),
              page({
                path: "[noValidationDynamicPage]",
                children: [
                  page({
                    path: "[toUpperCase]",
                    params: z.string().transform((val) => val.toUpperCase()),
                  }),
                  page({
                    path: "[uuid]",
                    params: z.string().uuid(),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      page({
        path: "staticPageAndLayoutQuery",
        query: {
          layout: {
            layoutParam: parseAsString,
          },
          page: {
            pageParam: parseAsString,
          },
        },
        children: [
          page({
            path: "[dynamicNoValidation]",
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
    ],
  });
}).types([169, "instantiations"]);

bench("Route root page", () => {
  new Router(page({ path: "" })).route("", {}, {});
}).types([715, "instantiations"]);

bench("Route nested dynamic page", () => {
  new Router(
    layout({
      path: "",
      children: [
        page({
          path: "staticLayout",
          children: [
            layout({
              path: "[noValidationDynamicLayout]",
              children: [
                page({
                  path: "[noValidationDynamicPage]",
                  children: [
                    page({
                      path: "[toUpperCase]",
                      params: z.string().transform((val) => val.toUpperCase()),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  ).route(
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    {
      noValidationDynamicLayout: "param1",
      noValidationDynamicPage: "param2",
      toUpperCase: "param3",
    },
    {}
  );
}).types([2030, "instantiations"]);

bench("Get all paths for router", () => {
  const routes = page({
    path: "",
    children: [
      page({
        path: "page",
      }),
      layout({
        path: "layout",
        children: [
          page({
            path: "page",
          }),
        ],
      }),
      page({
        path: "[dynamicPage]",
        children: [
          page({
            path: "page",
          }),
        ],
      }),
    ],
  });

  const val = "" as AllPaths<typeof routes, "page">;
}).types([120, "instantiations"]);

bench("Get route schema", () => {
  page({
    path: "",
    children: [
      layout({
        path: "staticLayout",
        children: [
          layout({
            path: "[noValidationDynamicLayout]",
            children: [
              page({
                path: "staticPage",
              }),
              page({
                path: "[noValidationDynamicPage]",
                children: [
                  page({
                    path: "[toUpperCase]",
                    params: z.string().transform((val) => val.toUpperCase()),
                  }),
                  page({
                    path: "[uuid]",
                    params: z.string().uuid(),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      page({
        path: "staticPageAndLayoutQuery",
        query: {
          layout: {
            layoutParam: parseAsString,
          },
          page: {
            pageParam: parseAsString,
          },
        },
        children: [
          page({
            path: "[dynamicNoValidation]",
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
    ],
  });
  const val = {} as GetRouteSchema<
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    [typeof routes]
  >;
}).types([569, "instantiations"]);
