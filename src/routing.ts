import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parseAsStringEnum, type Parser } from "nuqs/server";

type AnyParamValue = string;

type AnyParamSchema<T extends AnyParamValue = AnyParamValue> = T extends any
  ? StandardSchemaV1<T>
  : never;

interface QueryParamsSchema<Layout, Page> {
  layout: Record<string, Parser<any>>;
  page: Record<string, Parser<any>>;
}

interface AnyQueryParamsSchema extends QueryParamsSchema<any, any> {}

type AnyRoute =
  | Page<any, any, readonly any[], any>
  | Layout<any, any, readonly any[], any>;
export interface RouteBase {
  type: "page" | "layout";
  path: string | undefined;
  params: AnyParamSchema | undefined;
  query: AnyQueryParamsSchema | undefined;
}

type GetParamsSchema<Pathname extends string> = Pathname extends `[${string}]`
  ? StandardSchemaV1<string> | undefined
  : undefined;

export interface Page<
  in out Pathname extends string,
  in out TParams extends GetParamsSchema<Pathname>,
  in out Children extends readonly RouteBase[] | undefined,
  in out TQuery extends AnyQueryParamsSchema | undefined
> extends RouteBase {
  type: "page";
  path: Pathname;
  params: TParams;
  children: Children;
  query: TQuery;
}
export const page = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname> | undefined = undefined,
  const Children extends readonly RouteBase[] | undefined = undefined,
  const QueryParamsSchema extends AnyQueryParamsSchema | undefined = undefined
>(page: {
  path: Pathname;
  params?: ParamsSchema;
  children?: Children;
  query?: QueryParamsSchema;
}): Page<Pathname, ParamsSchema, Children, QueryParamsSchema> => ({
  type: "page",
  path: page.path,
  params: page.params as ParamsSchema,
  children: page.children as Children,
  query: page.query as QueryParamsSchema,
});

export interface Layout<
  in out Pathname extends string,
  in out ParamsSchema extends GetParamsSchema<Pathname>,
  in out Children extends readonly RouteBase[],
  in out QueryParamsSchema extends AnyQueryParamsSchema | undefined
> extends RouteBase {
  type: "layout";
  path: Pathname;
  params: ParamsSchema;
  children: Children;
  query: QueryParamsSchema;
}
export const layout = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname>,
  const Children extends readonly RouteBase[],
  const QueryParamsSchema extends AnyQueryParamsSchema | undefined
>(layout: {
  path: Pathname;
  params?: ParamsSchema;
  children: Children;
  query?: QueryParamsSchema;
}): Layout<Pathname, ParamsSchema, Children, QueryParamsSchema> => ({
  type: "layout",
  path: layout.path,
  params: layout.params as ParamsSchema,
  children: layout.children as Children,
  query: layout.query as QueryParamsSchema,
});

export type AllPaths<Routes> = Routes extends readonly unknown[]
  ? Routes[number] extends infer Route
    ? Route extends Page<infer Pathname, any, infer Children, any>
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

const getDynamicRouteKey = (path: string) => path.match(/^\[(.*)\]$/)?.[1];

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
    }
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
      const currentRoute = previousRoute.children.find(
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

      if (currentRoute.type === "page" && segmentsRemaining > 0) {
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
          if (parseRes instanceof Promise) {
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

    return {
      ok: true,
      data: url,
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
    }
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
