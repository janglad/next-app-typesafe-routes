import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { unknown } from "zod";
import { createSerializer, type ParserBuilder, type inferParserType } from "nuqs/server";

// Use real nuqs types
type NuqsParsersRecord = Record<string, ParserBuilder<any>>;

// Query params can be either simple (shared) or split between page/layout
type QueryParamsConfig = 
  | NuqsParsersRecord  // Simple case: shared between page and layout
  | {                  // Complex case: separate page and layout query params
      page?: NuqsParsersRecord;
      layout?: NuqsParsersRecord;
    };

type AnyParamValue = string;

type AnyParamSchema<T extends AnyParamValue = AnyParamValue> = T extends any
  ? StandardSchemaV1<T>
  : never;

type AnyRoute =
  | Page<any, any, any, readonly any[]>
  | Layout<any, any, readonly any[], any>;
export interface RouteBase {
  type: "page" | "layout";
  path: string | undefined;
  params: AnyParamSchema | undefined;
  queryParams: QueryParamsConfig | undefined;
}

type GetParamsSchema<Pathname extends string> = Pathname extends `[${string}]`
  ? StandardSchemaV1<string> | undefined
  : undefined;

export interface Page<
  in out Pathname extends string,
  in out TParams extends GetParamsSchema<Pathname>,
  in out TQueryParams extends QueryParamsConfig | undefined,
  in out Children extends readonly RouteBase[] | undefined
> extends RouteBase {
  type: "page";
  path: Pathname;
  params: TParams;
  queryParams: TQueryParams;
  children: Children;
}
export const page = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname> | undefined = undefined,
  const QueryParams extends QueryParamsConfig | undefined = undefined,
  const Children extends readonly RouteBase[] | undefined = undefined
>(page: {
  path: Pathname;
  params?: ParamsSchema;
  queryParams?: QueryParams;
  children?: Children;
}): Page<Pathname, ParamsSchema, QueryParams, Children> => ({
  type: "page",
  path: page.path,
  params: page.params as ParamsSchema,
  queryParams: page.queryParams as QueryParams,
  children: page.children as Children,
});
export interface Layout<
  in out Pathname extends string,
  in out ParamsSchema extends GetParamsSchema<Pathname>,
  in out Children extends readonly RouteBase[],
  in out TQueryParams extends QueryParamsConfig | undefined
> extends RouteBase {
  type: "layout";
  path: Pathname;
  params: ParamsSchema;
  queryParams: TQueryParams;
  children: Children;
}
export const layout = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname>,
  const Children extends readonly RouteBase[],
  const QueryParams extends QueryParamsConfig | undefined = undefined
>(layout: {
  path: Pathname;
  params?: ParamsSchema;
  queryParams?: QueryParams;
  children?: Children;
}): Layout<Pathname, ParamsSchema, Children, QueryParams> => ({
  type: "layout",
  path: layout.path,
  params: layout.params as ParamsSchema,
  queryParams: layout.queryParams as QueryParams,
  children: layout.children as Children,
});

export type AllPaths<Routes> = Routes extends readonly unknown[]
  ? Routes[number] extends infer Route
    ? Route extends Page<infer Pathname, any, any, infer Children>
      ? Pathname | `${Pathname}/${AllPaths<Children>}`
      : Route extends Layout<infer Pathname, any, infer Children, any>
      ? `${Pathname}/${AllPaths<Children>}`
      : never
    : never
  : never;

type ParamKey<T extends string> = T extends `[${infer P}]` ? P : never;

type ParamSchemaMap<
  RoutePathName extends string,
  RouteParamSchema
> = ParamKey<RoutePathName> extends never
  ? {}
  : {
      [K in ParamKey<RoutePathName>]: RouteParamSchema extends undefined
        ? StandardSchemaV1<string>
        : RouteParamSchema;
    };

type GetMatchingRoute<
  Pathname extends string,
  Routes extends readonly RouteBase[]
> = Extract<Routes[number], { path: Pathname }>;

export type GetRouteSchema<
  Path extends string,
  Routes extends readonly RouteBase[],
  Params extends Record<string, StandardSchemaV1<string>> = {}
> = Path extends `${infer RoutePathName}/${infer Rest}`
  ? GetMatchingRoute<RoutePathName, Routes> extends {
      children: infer RoutePathChildren extends readonly RouteBase[];
      params: infer RouteParamSchema;
      path: RoutePathName;
    }
    ? GetRouteSchema<
        Rest,
        RoutePathChildren,
        ParamSchemaMap<RoutePathName, RouteParamSchema> & Params
      >
    : //   Page must be last
      never
  : GetMatchingRoute<Path, Routes> extends {
      type: "page";
      path: infer RoutePathName extends string;
      params: infer RouteParamSchema;
    }
  ? Prettify<ParamSchemaMap<RoutePathName, RouteParamSchema> & Params>
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type SchemaInput<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
  : never;

// Helper type to extract page-specific query params from QueryParamsConfig
type ExtractPageQueryParams<Config extends QueryParamsConfig> = 
  Config extends { page: infer PageParams extends NuqsParsersRecord }
    ? PageParams
    : Config extends NuqsParsersRecord
    ? Config
    : never;

// Helper type to extract layout-specific query params from QueryParamsConfig  
type ExtractLayoutQueryParams<Config extends QueryParamsConfig> = 
  Config extends { layout: infer LayoutParams extends NuqsParsersRecord }
    ? LayoutParams
    : Config extends NuqsParsersRecord
    ? Config
    : never;

// Get inherited query params from parent layouts
type GetInheritedQueryParams<
  Path extends string,
  Routes extends readonly RouteBase[],
  Inherited extends NuqsParsersRecord = {}
> = Path extends `${infer RoutePathName}/${infer Rest}`
  ? GetMatchingRoute<RoutePathName, Routes> extends {
      children: infer RoutePathChildren extends readonly RouteBase[];
      queryParams: infer ParentQueryParams extends QueryParamsConfig;
    }
    ? GetInheritedQueryParams<
        Rest,
        RoutePathChildren,
        Inherited & ExtractLayoutQueryParams<ParentQueryParams>
      >
    : GetMatchingRoute<RoutePathName, Routes> extends {
        children: infer RoutePathChildren extends readonly RouteBase[];
        queryParams: undefined;
      }
    ? GetInheritedQueryParams<Rest, RoutePathChildren, Inherited>
    : never
  : Inherited;

// Query param schema extraction - gets query params for the exact page plus inherited ones
export type GetRouteQuerySchema<
  Path extends string,
  Routes extends readonly RouteBase[]
> = GetMatchingRoute<Path, Routes> extends {
    type: "page";
    queryParams: infer QueryParams extends QueryParamsConfig;
  }
  ? inferParserType<
      ExtractPageQueryParams<QueryParams> & GetInheritedQueryParams<Path, Routes>
    >
  : GetMatchingRoute<Path, Routes> extends {
    type: "page";
    queryParams: undefined;
  }
  ? inferParserType<GetInheritedQueryParams<Path, Routes>>
  : Path extends `${infer RoutePathName}/${infer Rest}`
  ? GetMatchingRoute<RoutePathName, Routes> extends {
      children: infer RoutePathChildren extends readonly RouteBase[];
    }
    ? GetRouteQuerySchema<Rest, RoutePathChildren>
    : never
  : never;

const getDynamicRouteKey = (path: string) => path.match(/^\[(.*)\]$/)?.[1];

// Helper function to extract page query params from config
const extractPageQueryParams = (config: QueryParamsConfig | undefined): NuqsParsersRecord => {
  if (!config) return {};
  if ('page' in config || 'layout' in config) {
    return (config as any).page || {};
  }
  return config as NuqsParsersRecord;
};

// Helper function to extract layout query params from config
const extractLayoutQueryParams = (config: QueryParamsConfig | undefined): NuqsParsersRecord => {
  if (!config) return {};
  if ('page' in config || 'layout' in config) {
    return (config as any).layout || {};
  }
  return config as NuqsParsersRecord;
};

// Helper function to collect inherited query params from parent routes
const collectInheritedQueryParams = (
  pathSegments: string[],
  routes: AnyRoute
): NuqsParsersRecord => {
  let inherited: NuqsParsersRecord = {};
  let currentRoute: AnyRoute = routes;
  
  for (const segment of pathSegments) {
    const children = currentRoute.children as readonly RouteBase[] | undefined;
    const nextRoute = children?.find(
      (route) => route.path === segment
    );
    if (!nextRoute) break;
    
    // Collect layout query params from this route
    const layoutParams = extractLayoutQueryParams(nextRoute.queryParams);
    inherited = { ...inherited, ...layoutParams };
    
    currentRoute = nextRoute;
  }
  
  return inherited;
};

abstract class TaggedError extends Error {
  abstract readonly _tag: string;
}

/**
 * Occurs when a given path param does not match the expected schema. Given
 * ```ts
 * const routes = page({ path: "[id]", params: z.uuid() })
 * ```
 * the path `/not-a-uuid` would result in an error stating the path is not a valid uuid.
 */
class RoutingValidationError extends TaggedError {
  readonly _tag = "RoutingValidationError";
  readonly expected: AnyParamValue;
  readonly actual: unknown;
  readonly path: string;
  readonly issues: StandardSchemaV1.Issue[];

  constructor(args: {
    expected: AnyParamValue;
    actual: unknown;
    path: string;
    issues: StandardSchemaV1.Issue[];
  }) {
    super(`Expected ${args.expected}, got ${args.actual} at path ${args.path}`);
    this.expected = args.expected;
    this.actual = args.actual;
    this.path = args.path;
    this.issues = args.issues;
  }

  static is(error: unknown): error is RoutingValidationError {
    return (
      typeof error === "object" &&
      error !== null &&
      "_tag" in error &&
      error._tag ===
        ("RoutingValidationError" satisfies RoutingValidationError["_tag"])
    );
  }
}

/**
 * Occurs when a given path does not match any route. Given
 * ```ts
 * const routes = page({ path: "hello" })
 * ```
 * the path `/not-a-path` would result in an error stating that no matching route was found for `/not-a-path` out of `['hello']`.
 */
class RoutingNoMatchingRouteError extends TaggedError {
  readonly _tag = "RoutingNoMatchingRouteError";
  readonly path: string;
  readonly pathCandidates: readonly string[];
  readonly actual: string;
  readonly type: "noMatch" | "matchedWrongType";

  constructor(args: {
    path: string;
    pathCandidates: readonly string[];
    actual: string;
    type: "noMatch" | "matchedWrongType";
  }) {
    super(
      `${
        args.type === "noMatch" ? "No matching route" : "Matched wrong type"
      } for path ${args.path}, expected one of [${args.pathCandidates.join(
        ", "
      )}] but got ${
        args.actual
      }. Note that the last segment of a path should always match a page.`
    );
    this.path = args.path;
    this.pathCandidates = args.pathCandidates;
    this.actual = args.actual;
    this.type = args.type;
  }

  static is(error: unknown): error is RoutingNoMatchingRouteError {
    return (
      typeof error === "object" &&
      error !== null &&
      "_tag" in error &&
      error._tag ===
        ("RoutingNoMatchingRouteError" satisfies RoutingNoMatchingRouteError["_tag"])
    );
  }
}

/**
 * Occurs when the routing library encounters an internal defect. This is a
 * bug in the routing library and should be reported.
 */
class RoutingInternalDefectError extends TaggedError {
  readonly _tag = "RoutingInternalDefectError";

  constructor(args: { message: string }) {
    super(args.message);
  }

  static is(error: unknown): error is RoutingInternalDefectError {
    return (
      typeof error === "object" &&
      error !== null &&
      "_tag" in error &&
      error._tag ===
        ("RoutingInternalDefectError" satisfies RoutingInternalDefectError["_tag"])
    );
  }
}

export class Router<
  in out Routes extends Page<"", any, any, any> | Layout<"", any, any, any>
> {
  readonly ["~routes"]: Routes;
  constructor(routes: Routes) {
    this["~routes"] = routes;
  }
  /**

   * @returns a `{ok: true, data: D} | {ok: false, error: E}` union with
   * - data: an URL with each segment URL encoded
   * - error:
   *   - {@link RoutingValidationError}: a provided param does not match the expected schema
   *   - {@link RoutingNoMatchingRouteError}: the path does not match any route, or the last segment does not match a page
   */
  route<
    const Path extends AllPaths<[Routes]>,
    ParamsSchema extends GetRouteSchema<Path, [Routes]> = GetRouteSchema<
      Path,
      [Routes]
    >
  >(
    path: Path,
    params: {
      [K in keyof ParamsSchema]: SchemaInput<ParamsSchema[K]>;
    },
    queryParams?: GetRouteQuerySchema<Path, [Routes]>
  ):
    | {
        ok: true;
        data: string;
        error?: undefined;
      }
    | {
        ok: false;
        data?: undefined;
        error: RoutingValidationError | RoutingNoMatchingRouteError;
      } {
    let pathSegments = (path as string).split("/").splice(1);
    let url = "";
    let previousRoute: AnyRoute = this["~routes"];

    while (pathSegments.length > 0) {
      const currentSegment = pathSegments[0]!;
      pathSegments.shift();
      const segmentsRemaining = pathSegments.length;
      const children = previousRoute.children as readonly RouteBase[];
      const currentRoute = children.find(
        (route) => route.path === currentSegment
      );

      if (currentRoute === undefined) {
        return {
          ok: false,
          error: new RoutingNoMatchingRouteError({
            path: path,
            pathCandidates: previousRoute.children.map((route) => route.path),
            actual: currentSegment,
            type: "noMatch",
          }),
        };
      }

      if (currentRoute.type === "page" && segmentsRemaining > 0 && !currentRoute.children) {
        return {
          ok: false,
          error: new RoutingNoMatchingRouteError({
            path: path,
            pathCandidates: previousRoute.children.map((route) => route.path),
            actual: currentSegment,
            type: "matchedWrongType",
          }),
        };
      }

      if (currentRoute.type === "layout" && segmentsRemaining < 1) {
        return {
          ok: false,
          error: new RoutingNoMatchingRouteError({
            path: path,
            pathCandidates: previousRoute.children.map((route) => route.path),
            actual: currentSegment,
            type: "matchedWrongType",
          }),
        };
      }

      const dynamicRouteKey = getDynamicRouteKey(currentRoute.path);

      if (dynamicRouteKey !== undefined) {
        const matchingValue = params[dynamicRouteKey as keyof typeof params];

        if (currentRoute.params === undefined) {
          url += `/${encodeURIComponent(matchingValue as string)}`;
        } else {
          const parseRes =
            currentRoute.params["~standard"].validate(matchingValue);
          if (parseRes && typeof parseRes === 'object' && 'then' in parseRes) {
            throw new RoutingInternalDefectError({
              message: `Schema at ${currentRoute.path} is async, only sync schemas are supported`,
            });
          }
          if (parseRes.issues !== undefined) {
            return {
              ok: false,
              error: new RoutingValidationError({
                expected: currentRoute.params["~standard"],
                actual: matchingValue,
                path: path,
                issues: parseRes.issues,
              }),
            };
          }
          url += `/${encodeURIComponent(parseRes.value)}`;
        }
      } else {
        url += `/${currentSegment}`;
      }

      previousRoute = currentRoute;
    }

    // Handle query parameters if present
    let finalUrl = url;
    if (queryParams && previousRoute.type === "page") {
      try {
        // Collect inherited query params from parent layouts
        const pathSegments = (path as string).split("/").splice(1);
        const inheritedParams = collectInheritedQueryParams(pathSegments, this["~routes"]);
        
        // Get page-specific query params
        const pageParams = extractPageQueryParams(previousRoute.queryParams);
        
        // Combine inherited and page-specific params
        const combinedParams = { ...inheritedParams, ...pageParams };
        
        if (Object.keys(combinedParams).length > 0) {
          const serialize = createSerializer(combinedParams);
          const queryString = serialize(queryParams);
          if (queryString) {
            finalUrl = url + (queryString.charAt(0) === "?" ? queryString : "?" + queryString);
          }
        }
      } catch (error) {
        // If serialization fails, just return the base URL
      }
    }

    return {
      ok: true,
      data: finalUrl,
    };
  }

  /** Like {@link route} but throws if the route is not found. */
  routeUnsafe<
    const Path extends AllPaths<[Routes]>,
    ParamsSchema extends GetRouteSchema<Path, [Routes]> = GetRouteSchema<
      Path,
      [Routes]
    >
  >(
    path: Path,
    params: {
      [K in keyof ParamsSchema]: SchemaInput<ParamsSchema[K]>;
    },
    queryParams?: GetRouteQuerySchema<Path, [Routes]>
  ): string {
    const res = this.route(path, params);
    if (res.ok) {
      return res.data;
    }
    throw res.error;
  }

  makeParser<Path extends AllPaths<[Routes]>>(
    path: Path
  ): (params: {
    [K in keyof GetRouteSchema<Path, [Routes]>]: SchemaInput<
      GetRouteSchema<Path, [Routes]>[K]
    >;
  }) => string {
    return (params) => this.routeUnsafe(path, params);
  }
}
