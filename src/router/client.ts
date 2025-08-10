import {
  Router as RouterBase,
  type GetRouteSchema,
  type LazyAllPaths,
  type RouteBase,
} from "./shared.js";

import { useQueryStates, type UseQueryStatesReturn } from "nuqs";

export class Router<
  const in out Routes extends RouteBase & {
    path: "";
    type: "page" | "layout";
  }
> extends RouterBase<Routes> {
  usePageQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path, "page">
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["page"]> {
    const schema = this["~getRouteSchema"](path as string);
    if (schema.error) {
      throw schema.error;
    }

    return useQueryStates(schema.data.schema.query.page);
  }
  useLayoutQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path>
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["layout"]> {
    const schema = this["~getRouteSchema"](path as string);
    if (schema.error) {
      throw schema.error;
    }

    return useQueryStates(schema.data.schema.query.layout);
  }
}

export * from "./shared.js";
