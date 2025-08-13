import type { UseQueryStatesOptions, UseQueryStatesReturn } from "nuqs";
import {
  Router as RouterBase,
  RoutingInternalDefectError,
  type AbsorbUndefined,
  type GetRouteSchema,
  type LayoutSegments,
  type LazyAllPaths,
  type RouteAtPath,
  type RouteBase,
  type RouteRepresentation,
  type RouteType,
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
    path: LazyAllPaths<[Routes], Path, "page">,
    options?: Partial<
      UseQueryStatesOptions<GetRouteSchema<Path, [Routes]>["query"]["page"]>
    >
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["page"]> {
    forbiddenOnServer("usePageQuery");
  }
  useLayoutQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path>,
    options?: Partial<
      UseQueryStatesOptions<GetRouteSchema<Path, [Routes]>["query"]["layout"]>
    >
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["layout"]> {
    forbiddenOnServer("useLayoutQuery");
  }

  useSelectedLayoutSegment<const Path extends string>(
    _path: LazyAllPaths<[Routes], Path, RouteType> & string
  ): RouteRepresentation<
    AbsorbUndefined<
      RouteAtPath<Path, Routes, RouteType>["children"],
      never
    >[number]
  > | null {
    forbiddenOnServer("useSelectedLayoutSegment");
  }
  useSelectedLayoutSegments<const Path extends string>(
    _path: LazyAllPaths<[Routes], Path> & string
  ): LayoutSegments<RouteAtPath<Path, Routes, RouteType>["children"]> {
    forbiddenOnServer("useSelectedLayoutSegments");
  }
}
export * from "./shared.js";
