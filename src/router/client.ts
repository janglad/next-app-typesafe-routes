import {
  Router as RouterBase,
  type AbsorbUndefined,
  type GetRouteSchema,
  type LayoutSegments,
  type LazyAllPaths,
  type RouteAtPath,
  type RouteBase,
  type RouteRepresentation,
  type RouteType,
} from "./shared.js";

import {
  useSelectedLayoutSegment as useSelectedLayoutSegmentBase,
  useSelectedLayoutSegments as useSelectedLayoutSegmentsBase,
} from "next/navigation.js";
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

  useSelectedLayoutSegment<const Path extends string>(
    _path: LazyAllPaths<[Routes], Path, RouteType> & string
  ): RouteRepresentation<
    AbsorbUndefined<
      RouteAtPath<Path, Routes, RouteType>["children"],
      never
    >[number]
  > | null {
    const useSelectedLayoutSegment = useSelectedLayoutSegmentBase();
    return useSelectedLayoutSegment as any;
  }
  useSelectedLayoutSegments<const Path extends string>(
    _path: LazyAllPaths<[Routes], Path> & string
  ): LayoutSegments<RouteAtPath<Path, Routes, RouteType>["children"]> {
    const useSelectedLayoutSegments = useSelectedLayoutSegmentsBase(
      _path as string
    );
    return useSelectedLayoutSegments as any;
  }
}

export * from "./shared.js";
