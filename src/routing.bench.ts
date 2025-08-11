import { bench } from "@ark/attest";
import { parseAsString } from "nuqs/server";
import z from "zod";
import {
  layout,
  page,
  Router,
  type GetRoute,
  type GetRouteSchema,
  type LazyAllPaths,
} from "./router/server.js";

bench("simple route config", () => {
  page("", {
    children: [page("staticPage")],
  });
}).types([26, "instantiations"]);

bench("Simple route config with inferred params", () => {
  page("", {
    children: [page("[dynamicPage]")],
  });
}).types([26, "instantiations"]);

bench("Simple route config with query params", () => {
  page("", {
    children: [
      page("staticPage", {
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
}).types([53, "instantiations"]);

bench("Larger route config", () => {
  page("", {
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
    ],
  });
}).types([163, "instantiations"]);

bench("Route root page", () => {
  new Router(page("", { children: [page("hi")] })).routeSafe("/", {}, {});
}).types([987, "instantiations"]);

const dynamicRouteRouter = new Router(
  layout("", {
    children: [
      page("staticLayout", {
        children: [
          layout("[noValidationDynamicLayout]", {
            children: [
              page("[noValidationDynamicPage]", {
                children: [
                  page("[toUpperCase]", {
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
);
bench("Route nested dynamic page", () => {
  dynamicRouteRouter.routeSafe(
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    {
      noValidationDynamicLayout: "param1",
      noValidationDynamicPage: "param2",
      toUpperCase: "param3",
    },
    {}
  );
}).types([1392, "instantiations"]);

const deeplyNestedRouter = new Router(
  layout("", {
    children: [
      page("page"),
      layout("layout", {
        query: {
          layout: {
            layoutParam: parseAsString,
          },
          page: {
            pageParam: parseAsString,
          },
        },
        children: [
          page("level1"),
          layout("level1-layout", {
            children: [
              page("level2"),
              layout("level2-layout", {
                children: [
                  page("level3"),
                  page("[param1]", {
                    children: [
                      page("level4"),
                      layout("[param2]", {
                        children: [
                          page("level5"),
                          page("[param3]", {
                            children: [
                              page("level6"),
                              layout("deeply-nested", {
                                children: [
                                  page("level7"),
                                  page("[param4]", {
                                    children: [
                                      page("level8"),
                                      page("final-page"),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  page("parallel-branch", {
                    children: [
                      page("sub1"),
                      page("sub2"),
                      layout("sub-layout", {
                        children: [
                          page("nested1"),
                          page("nested2"),
                          page("[dynamicSub]", {
                            children: [page("deep1"), page("deep2")],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
);

bench("Route deeply nested page", () => {
  deeplyNestedRouter.routeSafe(
    "/layout/level1-layout/level2-layout/[param1]/[param2]/[param3]/deeply-nested/[param4]/final-page",
    {
      param1: "param1",
      param2: "param2",
      param3: "param3",
      param4: "param4",
    },
    {}
  );
}).types([2060, "instantiations"]);

const getAllPathsRoutes = page("", {
  children: [
    page("page"),
    layout("layout", {
      children: [page("page")],
    }),
    page("[dynamicPage]", {
      children: [page("page")],
    }),
  ],
});
// bench("Get all paths for router", () => {
//   const val = "" as AllPaths<[typeof getAllPathsRoutes], "page">;
// }).types([131, "instantiations"]);
const getRouteSchemaRoutes = page("", {
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
  ],
});
bench("Get route schema", () => {
  const val = {} as GetRouteSchema<
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    [typeof getRouteSchemaRoutes]
  >;
}).types([266, "instantiations"]);

type test = GetRoute<"", typeof getRouteSchemaRoutes>;

bench("Get route", () => {
  const val = {} as GetRoute<
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    typeof getRouteSchemaRoutes
  >;
}).types([252, "instantiations"]);

const routes = page("", {
  children: [page("staticPage"), page("[dynamicPage]")],
});

const get = <const T extends string>(
  path: LazyAllPaths<[typeof routes], T>
): GetRouteSchema<T, [typeof routes]> => {
  return {} as any;
};

type Get<T extends string> = LazyAllPaths<[typeof routes], T>;
