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
}).types([132, "instantiations"]);

bench("Simple route config with inferred params", () => {
  page("", {
    children: [page("[dynamicPage]")],
  });
}).types([137, "instantiations"]);

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
}).types([154, "instantiations"]);

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
}).types([1089, "instantiations"]);

bench("Route root page", () => {
  new Router(page("")).route("", {}, {});
}).types([761, "instantiations"]);

bench("Route nested dynamic page", () => {
  new Router(
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
  ).route(
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    {
      noValidationDynamicLayout: "param1",
      noValidationDynamicPage: "param2",
      toUpperCase: "param3",
    },
    {}
  );
}).types([2623, "instantiations"]);

bench("Get all paths for router", () => {
  const routes = page("", {
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

  const val = "" as AllPaths<[typeof routes], "page">;
}).types([379, "instantiations"]);

bench("Get route schema", () => {
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
    ],
  });
  const val = {} as GetRouteSchema<
    "/staticLayout/[noValidationDynamicLayout]/[noValidationDynamicPage]/[toUpperCase]",
    [typeof routes]
  >;
}).types([1484, "instantiations"]);
