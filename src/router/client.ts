import {
  Router as RouterBase,
  type GetRouteSchema,
  type LazyAllPaths,
  type RouteBase,
} from "./shared.js";

import {
  useQueryStates,
  type UseQueryStatesOptions,
  type UseQueryStatesReturn,
} from "nuqs";

export class Router<
  const in out Routes extends RouteBase & {
    path: "";
    type: "page" | "layout";
  }
> extends RouterBase<Routes> {
  usePageQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path, "page">,
    options?: Partial<
      UseQueryStatesOptions<GetRouteSchema<Path, [Routes]>["query"]["page"]>
    >
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["page"]> {
    const schema = this["~getRouteSchema"](path as string);
    if (schema.error) {
      throw schema.error;
    }

    return useQueryStates(schema.data.schema.query.page, options);
  }
  useLayoutQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path>,
    options?: Partial<
      UseQueryStatesOptions<GetRouteSchema<Path, [Routes]>["query"]["layout"]>
    >
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["layout"]> {
    const schema = this["~getRouteSchema"](path as string);
    if (schema.error) {
      throw schema.error;
    }

    return useQueryStates(schema.data.schema.query.layout, options);
  }
}

export * from "./shared.js";
