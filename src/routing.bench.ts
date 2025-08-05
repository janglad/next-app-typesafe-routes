import { bench } from "@ark/attest";
import { parseAsString } from "nuqs";
import z from "zod";
import {
  layout,
  page,
  Router,
  type AllPaths,
  type GetRouteSchema,
} from "./routing.js";

bench("simple route config", () => {
  page("", {
    children: [page("staticPage")],
  });
}).types([29, "instantiations"]);

bench("Simple route config with inferred params", () => {
  page("", {
    children: [page("[dynamicPage]")],
  });
}).types([43, "instantiations"]);

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
}).types([59, "instantiations"]);

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
}).types([175, "instantiations"]);

bench("Route root page", () => {
  new Router(page("")).route("", {}, {});
}).types([712, "instantiations"]);

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
  dynamicRouteRouter.route(
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    {
      noValidationDynamicLayout: "param1",
      noValidationDynamicPage: "param2",
      toUpperCase: "param3",
    },
    {}
  );
}).types([1642, "instantiations"]);

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
  deeplyNestedRouter.route(
    "/layout/level1-layout/level2-layout/[param1]/[param2]/[param3]/deeply-nested/[param4]/final-page",
    {
      param1: "param1",
      param2: "param2",
      param3: "param3",
      param4: "param4",
    },
    {}
  );
}).types([6652, "instantiations"]);

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
bench("Get all paths for router", () => {
  const val = "" as AllPaths<[typeof getAllPathsRoutes], "page">;
}).types([131, "instantiations"]);
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
}).types([313, "instantiations"]);

const test = page("hi").children;
//     ^?
const test2 = page("hi", { children: [page("hi")] }).children;
//     ^?
