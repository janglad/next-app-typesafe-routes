import type { UseQueryStatesReturn } from "nuqs";
import {
  Router as RouterBase,
  RoutingInternalDefectError,
  type GetRouteSchema,
  type LazyAllPaths,
  type RouteBase,
} from "./shared.js";

function forbiddenOnServer(functionName: string): never {
  throw new RoutingInternalDefectError({
    message: `Tried to call ${functionName} on the server. This method can only be called on the client.`,
  });
}

export class Router<
  const in out Routes extends RouteBase & { path: ""; type: "page" | "layout" }
> extends RouterBase<Routes> {
  usePageQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path, "page">
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["page"]> {
    forbiddenOnServer("usePageQuery");
  }
  useLayoutQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path>
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["layout"]> {
    forbiddenOnServer("useLayoutQuery");
  }
}
export * from "./shared.js";
