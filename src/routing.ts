import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createSerializer, type Parser } from "nuqs/server";

type AnyParamValue = string;

type AnyParamSchema<T extends AnyParamValue = AnyParamValue> = T extends any
  ? StandardSchemaV1<T>
  : never;

interface QueryParams<
  Layout extends Record<string, Parser<any>> = {},
  Page extends Record<string, Parser<any>> = {}
> {
  layout: Layout;
  page: Page;
}

type AnyRoute =
  | Page<string, GetParamsSchema<string>, QueryParams, readonly any[]>
  | Layout<string, GetParamsSchema<string>, QueryParams, readonly any[]>;

type RouteType = "page" | "layout";
export interface RouteBase {
  readonly type: RouteType;
  readonly path: string | undefined;
  readonly params: AnyParamSchema | undefined;
  readonly query: QueryParams | undefined;
  readonly children: readonly RouteBase[];
}

type GetParamsSchema<Pathname extends string> = Pathname extends `[${string}]`
  ? StandardSchemaV1<string> | undefined
  : undefined;

export interface Page<
  in out Pathname extends string,
  in out ParamSchema extends GetParamsSchema<Pathname>,
  in out QueryParamSchema extends QueryParams,
  in out Children extends readonly RouteBase[]
> extends RouteBase {
  readonly type: "page";
  readonly path: Pathname;
  readonly params: ParamSchema;
  readonly children: Children;
  readonly query: QueryParamSchema;
}
export const page = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname> | undefined,
  const QueryParamsSchema extends QueryParams = { layout: {}; page: {} },
  const Children extends readonly RouteBase[] = []
>(page: {
  readonly path: Pathname;
  readonly params?: ParamsSchema;
  readonly children?: Children;
  readonly query?: QueryParamsSchema;
}): Page<Pathname, ParamsSchema, QueryParamsSchema, Children> => ({
  type: "page",
  path: page.path,
  params: page.params as ParamsSchema,
  children: (page.children ?? []) as Children,
  query: (page.query ?? { page: {}, layout: {} }) as QueryParamsSchema,
});

export interface Layout<
  in out Pathname extends string,
  in out ParamsSchema extends GetParamsSchema<Pathname>,
  in out QueryParamsSchema extends QueryParams,
  in out Children extends readonly RouteBase[]
> extends RouteBase {
  readonly type: "layout";
  readonly path: Pathname;
  readonly params: ParamsSchema;
  readonly children: Children;
  readonly query: QueryParamsSchema;
}
export const layout = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname>,
  const QueryParamsSchema extends QueryParams = { layout: {}; page: {} },
  const Children extends readonly RouteBase[] = []
>(layout: {
  readonly path: Pathname;
  readonly params?: ParamsSchema;
  readonly children: Children;
  readonly query?: QueryParamsSchema;
}): Layout<Pathname, ParamsSchema, QueryParamsSchema, Children> => ({
  type: "layout",
  path: layout.path,
  params: layout.params as ParamsSchema,
  children: (layout.children ?? []) as Children,
  query: (layout.query ?? { page: {}, layout: {} }) as QueryParamsSchema,
});

export type AllPaths<
  Routes,
  Type extends RouteType
> = Routes extends readonly unknown[]
  ? Routes[number] extends infer Route
    ? Route extends Page<infer Pathname, any, any, infer Children>
      ? Pathname | `${Pathname}/${AllPaths<Children, Type>}`
      : Route extends Layout<infer Pathname, any, any, infer Children>
      ?
          | `${Pathname}/${AllPaths<Children, Type>}`
          | (Type extends "layout" ? Pathname : never)
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

type GetPageQueryParamsSchema<T> = T extends QueryParams ? T["page"] : {};
type GetLayoutQueryParamsSchema<T> = T extends QueryParams ? T["layout"] : {};

export type GetRouteSchema<
  Path extends string,
  Routes extends readonly RouteBase[],
  Params extends Record<string, StandardSchemaV1<string>> = {},
  PageQueryParamMap = {}
> = Path extends `${infer RoutePathName}/${infer Rest}`
  ? GetMatchingRoute<RoutePathName, Routes> extends {
      children: infer RoutePathChildren extends readonly RouteBase[];
      params: infer RouteParamSchema;
      path: RoutePathName;
      query: infer RouteQuerySchema;
    }
    ? GetRouteSchema<
        Rest,
        RoutePathChildren,
        ParamSchemaMap<RoutePathName, RouteParamSchema> & Params,
        GetLayoutQueryParamsSchema<RouteQuerySchema> & PageQueryParamMap
      >
    : never
  : GetMatchingRoute<Path, Routes> extends {
      type: "page";
      path: infer RoutePathName extends string;
      params: infer RouteParamSchema;
      query: infer RouteQuerySchema;
    }
  ? {
      params: Prettify<
        ParamSchemaMap<RoutePathName, RouteParamSchema> & Params
      >;
      query: {
        page: Prettify<
          PageQueryParamMap &
            GetPageQueryParamsSchema<RouteQuerySchema> &
            GetLayoutQueryParamsSchema<RouteQuerySchema>
        >;
        layout: Prettify<
          PageQueryParamMap & GetLayoutQueryParamsSchema<RouteQuerySchema>
        >;
      };
    }
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type SchemaInput<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
  : never;

type GetParserMapInput<T extends Record<string, Parser<any>>> = {
  [K in keyof T]?: T[K] extends Parser<infer U> ? U | null : never;
};

type GetParamMapInput<ParamSchema> = {
  [K in keyof ParamSchema]: ParamSchema[K] extends AnyParamSchema
    ? SchemaInput<ParamSchema[K]>
    : never;
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
  readonly issues: readonly StandardSchemaV1.Issue[];

  constructor(args: {
    expected: AnyParamValue;
    actual: unknown;
    path: string;
    issues: readonly StandardSchemaV1.Issue[];
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
  readonly metaData?: Record<string, unknown>;

  constructor(args: { message: string; metaData?: Record<string, unknown> }) {
    super(args.message);
    this.metaData = args.metaData;
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

type RouterRouteReturn =
  | {
      ok: true;
      data: string;
      error?: undefined;
    }
  | {
      ok: false;
      data?: undefined;
      error: RoutingValidationError | RoutingNoMatchingRouteError;
    };

export class Router<
  in out Routes extends Page<"", any, any, any> | Layout<"", any, any, any>
> {
  readonly ["~routes"]: Routes;
  constructor(routes: Routes) {
    this["~routes"] = routes;
  }

  static fillInPathParams(path: string, params: Record<string, string>) {
    return path.replace(/\[([^\]]+)\]/g, (_, key) => {
      const value = params[key];
      if (value === undefined) {
        throw new RoutingInternalDefectError({
          message: `Missing parameter: ${key}`,
          metaData: {
            params,
            path,
            key,
          },
        });
      }
      return encodeURIComponent(String(value));
    });
  }

  static getDynamicRouteKey(path: string) {
    return path.match(/^\[(.*)\]$/)?.[1];
  }

  getRouteSchema<const Path extends AllPaths<[Routes], RouteType>>(
    path: Path
  ):
    | {
        ok: true;
        data: {
          schema: GetRouteSchema<Path, [Routes]>;
          matchedType: RouteType;
        };
        error?: undefined;
      }
    | {
        ok: false;
        data?: undefined;
        error: RoutingNoMatchingRouteError;
      } {
    const res = {
      params: {} as Record<string, AnyParamSchema | undefined>,
      query: {
        layout: {} as Record<string, Parser<any>>,
        page: {} as Record<string, Parser<any>>,
      },
    };
    let pathSegments = (path as string).split("/").splice(1);
    let currentRoute: AnyRoute = this["~routes"];

    while (true) {
      const dynamicRouteKey = Router.getDynamicRouteKey(currentRoute.path);
      if (dynamicRouteKey !== undefined) {
        if (currentRoute.params !== undefined) {
          res.params[dynamicRouteKey] = currentRoute.params;
        } else {
          res.params[dynamicRouteKey] = undefined;
        }
      }

      // Merge in params of all layouts above this route for both pages and layouts
      for (const key of Object.keys(currentRoute.query.layout)) {
        res.query.layout[key] = currentRoute.query.layout[
          key as keyof typeof currentRoute.query.layout
        ] as any;
        res.query.page[key] = currentRoute.query.layout[
          key as keyof typeof currentRoute.query.layout
        ] as any;
      }

      // Page query params are only added for that specific page
      if (pathSegments.length === 0) {
        for (const key of Object.keys(currentRoute.query.page)) {
          res.query.page[key] = currentRoute.query.page[
            key as keyof typeof currentRoute.query.page
          ] as any;
        }
      }

      if (pathSegments.length === 0) {
        break;
      }

      const newRoute = currentRoute.children.find(
        (route) => route.path === pathSegments[0]
      );
      if (newRoute === undefined) {
        return {
          ok: false,
          error: new RoutingNoMatchingRouteError({
            path: path,
            pathCandidates: currentRoute.children.map((route) => route.path),
            actual: pathSegments[0]!,
            type: "noMatch",
          }),
        };
      }
      currentRoute = newRoute;
      pathSegments.shift();
    }

    return {
      ok: true,
      data: {
        schema: res as GetRouteSchema<Path, [Routes]>,
        matchedType: currentRoute["type"],
      },
    };
  }

  /**

   * @returns a `{ok: true, data: D} | {ok: false, error: E}` union with
   * - data: an URL with each segment URL encoded
   * - error:
   *   - {@link RoutingValidationError}: a provided param does not match the expected schema
   *   - {@link RoutingNoMatchingRouteError}: the path does not match any route, or the last segment does not match a page
   */
  route<
    const Path extends AllPaths<[Routes], "page">,
    const RouteSchema extends GetRouteSchema<Path, [Routes]>
  >(
    path: Path,
    params: GetParamMapInput<RouteSchema["params"]>,
    query: GetParserMapInput<RouteSchema["query"]["page"]>
  ): RouterRouteReturn {
    const schemaRes = this.getRouteSchema(path);
    if (schemaRes.ok === false) {
      return schemaRes;
    }

    const parsedParams: Record<string, string> = {};

    for (const dynamicRouteKey of Object.keys(schemaRes.data.schema.params)) {
      const paramsSchema: StandardSchemaV1<string> | undefined =
        schemaRes.data.schema.params[
          dynamicRouteKey as keyof typeof schemaRes.data.schema.params
        ];

      if (paramsSchema === undefined) {
        parsedParams[dynamicRouteKey] = encodeURIComponent(
          params[dynamicRouteKey as keyof typeof params] as string
        );
      } else {
        const parseRes = (paramsSchema as StandardSchemaV1<string>)[
          "~standard"
        ].validate(params[dynamicRouteKey as keyof typeof params]);
        if (parseRes instanceof Promise) {
          throw new RoutingInternalDefectError({
            message: `Schema at ${dynamicRouteKey} of ${path} is async, only sync schemas are supported`,
          });
        }
        if (parseRes.issues !== undefined) {
          return {
            ok: false,
            error: new RoutingValidationError({
              expected: paramsSchema,
              actual: params[dynamicRouteKey as keyof typeof params],
              path: path,
              issues: parseRes.issues,
            }),
          };
        }
        parsedParams[dynamicRouteKey] = encodeURIComponent(parseRes.value);
      }
    }

    const urlWithParams = Router.fillInPathParams(path, parsedParams);
    const serializer = createSerializer(schemaRes.data.schema.query.page);
    const queryString = serializer(query);
    const url = `${urlWithParams}${queryString}`;

    return {
      ok: true,
      data: url,
    };
  }

  /** Like {@link route} but throws if the route is not found. */
  routeUnsafe<
    const Path extends AllPaths<[Routes], "page">,
    const RouteSchema extends GetRouteSchema<Path, [Routes]>
  >(
    path: Path,
    params: GetParamMapInput<RouteSchema["params"]>,
    query: GetParserMapInput<RouteSchema["query"]["page"]>
  ): string {
    const res = this.route(path, params, query);
    if (res.ok) {
      return res.data;
    }
    throw res.error;
  }

  makeParser<Path extends AllPaths<[Routes], "page">>(
    path: Path
  ): <const RouteSchema extends GetRouteSchema<Path, [Routes]>>(
    params: GetParamMapInput<RouteSchema["params"]>,
    query: GetParserMapInput<RouteSchema["query"]["page"]>
  ) => string {
    return (params, query) => this.routeUnsafe(path, params, query);
  }
}
