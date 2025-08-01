import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createSerializer, type Parser } from "nuqs/server";

type AnyParamValue = string;

type AnyParamSchema<T extends AnyParamValue = AnyParamValue> = T extends any
  ? StandardSchemaV1<T>
  : never;

interface QueryParamParserMap<T> extends Record<string, Parser<T>> {}

interface QueryParams<
  Layout extends QueryParamParserMap<any> = {},
  Page extends QueryParamParserMap<any> = {}
> {
  readonly layout: Layout;
  readonly page: Page;
}

type AnyRoute =
  | Page<string, GetParamsSchema<string>, QueryParams, readonly any[]>
  | Layout<string, GetParamsSchema<string>, QueryParams, readonly any[]>
  | Group<`(${string})`, readonly any[], QueryParams>;

type RouteType = "page" | "layout" | "group";
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

type MakeQueryParamsReturn<T> = T extends QueryParamParserMap<any>
  ? QueryParams<T, T>
  : T;

const makeQueryParams = <
  // const PageParserMap extends QueryParamParserMap<any>,
  // const LayoutParserMap extends QueryParamParserMap<any> = PageParserMap
  const ParserMap extends QueryParamParserMap<any> | QueryParams<any, any>
>(
  parser: ParserMap
): MakeQueryParamsReturn<ParserMap> => {
  if (
    Object.keys(parser).length === 2 &&
    ("layout" in parser || "page" in parser)
  ) {
    return parser as any;
  }

  return {
    layout: parser,
    page: parser,
  } as any;
};

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
  const QueryParamsSchema extends QueryParams | QueryParamParserMap<any> = {
    layout: {};
    page: {};
  },
  const Children extends readonly RouteBase[] = []
>(
  path: Pathname,
  config: {
    readonly params?: ParamsSchema;
    readonly children?: Children;
    readonly query?: QueryParamsSchema;
  } = {}
): Page<
  Pathname,
  ParamsSchema,
  MakeQueryParamsReturn<QueryParamsSchema>,
  Children
> => ({
  type: "page",
  path: path,
  params: config.params as ParamsSchema,
  children: (config.children ?? []) as Children,
  query: (config.query
    ? makeQueryParams(config.query)
    : { page: {}, layout: {} }) as MakeQueryParamsReturn<QueryParamsSchema>,
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
  const QueryParamsSchema extends QueryParams | QueryParamParserMap<any> = {
    layout: {};
    page: {};
  },
  const Children extends readonly RouteBase[] = []
>(
  path: Pathname,
  config: {
    readonly params?: ParamsSchema;
    readonly children: Children;
    readonly query?: QueryParamsSchema;
  }
): Layout<
  Pathname,
  ParamsSchema,
  MakeQueryParamsReturn<QueryParamsSchema>,
  Children
> => ({
  type: "layout",
  path: path,
  params: config.params as ParamsSchema,
  children: (config.children ?? []) as Children,
  query: (config.query
    ? makeQueryParams(config.query)
    : { page: {}, layout: {} }) as MakeQueryParamsReturn<QueryParamsSchema>,
});

export interface Group<
  in out Pathname extends `(${string})`,
  in out Children extends readonly RouteBase[],
  in out QueryParamsSchema extends QueryParams
> extends RouteBase {
  readonly type: "group";
  readonly path: Pathname;
  readonly children: Children;
  readonly query: QueryParamsSchema;
  readonly params: undefined;
}

export const group = <
  const Pathname extends `(${string})`,
  const Children extends readonly RouteBase[],
  const QueryParamsSchema extends QueryParams | QueryParamParserMap<any> = {
    layout: {};
    page: {};
  }
>(
  path: Pathname,
  config: {
    readonly children: Children;
    readonly query?: QueryParamsSchema;
  }
): Group<Pathname, Children, MakeQueryParamsReturn<QueryParamsSchema>> => ({
  type: "group",
  path: path,
  children: (config.children ?? []) as Children,
  query: (config.query
    ? makeQueryParams(config.query)
    : { page: {}, layout: {} }) as MakeQueryParamsReturn<QueryParamsSchema>,
  params: undefined,
});

export type AllPaths<
  Routes,
  Type extends RouteType
> = Routes extends readonly unknown[]
  ? Routes[number] extends infer Route
    ? Route extends {
        type: infer PathType;
        path: infer Pathname extends string;
        children: infer Children;
      }
      ?
          | (PathType extends "page" ? Pathname : never)
          | `${Pathname}/${AllPaths<Children, Type>}`
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
      readonly [K in ParamKey<RoutePathName>]: RouteParamSchema extends undefined
        ? StandardSchemaV1<string>
        : RouteParamSchema;
    };

type GetMatchingRoute<
  Pathname extends string,
  Routes extends readonly RouteBase[]
> = Extract<Routes[number], { readonly path: Pathname }>;

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
  readonly [K in keyof T]?: T[K] extends Parser<infer U> ? U | null : never;
};

type GetParamMapInput<ParamSchema> = {
  readonly [K in keyof ParamSchema]: ParamSchema[K] extends AnyParamSchema
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

export type RoutingNoMatchingRouteErrorType = "noMatch" | "matchedWrongType";

/**
 * Occurs when a given path does not match any route. Given
 * ```ts
 * const routes = page({ path: "hello" })
 * ```
 * the path `/not-a-path` would result in an error stating that no matching route was found for `/not-a-path` out of `['hello']`.
 */
export class RoutingNoMatchingRouteError extends TaggedError {
  readonly _tag = "RoutingNoMatchingRouteError";
  readonly path: string;
  readonly pathCandidates: readonly string[];
  readonly actual: string;
  readonly type: RoutingNoMatchingRouteErrorType;

  constructor(args: {
    readonly path: string;
    readonly pathCandidates: readonly string[];
    readonly actual: string;
    readonly type: RoutingNoMatchingRouteErrorType;
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
export class RoutingInternalDefectError extends TaggedError {
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
      readonly ok: true;
      readonly data: string;
      readonly error?: undefined;
    }
  | {
      readonly ok: false;
      readonly data?: undefined;
      readonly error: RoutingValidationError | RoutingNoMatchingRouteError;
    };

export type GetRouteSchemaReturn<
  Routes extends RouteBase,
  Path extends AllPaths<Routes, RouteType>
> =
  | {
      readonly ok: true;
      readonly data: {
        readonly schema: GetRouteSchema<Path, [Routes]>;
        readonly matchedType: RouteType;
      };
      readonly error?: undefined;
    }
  | {
      readonly ok: false;
      readonly data?: undefined;
      readonly error: RoutingNoMatchingRouteError;
    };

export class Router<
  in out Routes extends Page<"", any, any, any> | Layout<"", any, any, any>
> {
  readonly ["~routes"]: Routes;
  constructor(routes: Routes) {
    this["~routes"] = routes;
  }

  static fillInPathParams(
    path: string,
    nonEncodedParams: Record<string, string>
  ) {
    return path.replace(/\[([^\]]+)\]/g, (_, key) => {
      const value = nonEncodedParams[key];
      if (value === undefined) {
        throw new RoutingInternalDefectError({
          message: `Missing parameter: ${key}`,
          metaData: {
            params: nonEncodedParams,
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

  getRouteSchemaCache = new Map<
    string,
    GetRouteSchemaReturn<Routes, AllPaths<[Routes], RouteType>>
  >();

  getRouteSchema<const Path extends AllPaths<[Routes], RouteType>>(
    path: Path
  ): GetRouteSchemaReturn<Routes, Path> {
    const cached = this.getRouteSchemaCache.get(path);
    if (cached !== undefined) {
      return cached;
    }

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

    const returnValue = {
      ok: true as const,
      data: {
        schema: res as GetRouteSchema<Path, [Routes]>,
        matchedType: currentRoute["type"],
      },
    };

    this.getRouteSchemaCache.set(path, returnValue);

    return returnValue;
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

    if (schemaRes.data.matchedType !== "page") {
      return {
        ok: false,
        error: new RoutingNoMatchingRouteError({
          path: path,
          pathCandidates: [path],
          actual: path,
          type: "matchedWrongType",
        }),
      };
    }

    const parsedNonEncodedParams: Record<string, string> = {};

    for (const dynamicRouteKey of Object.keys(schemaRes.data.schema.params)) {
      const paramsSchema: StandardSchemaV1<string> | undefined =
        schemaRes.data.schema.params[
          dynamicRouteKey as keyof typeof schemaRes.data.schema.params
        ];

      if (paramsSchema === undefined) {
        parsedNonEncodedParams[dynamicRouteKey] = params[
          dynamicRouteKey as keyof typeof params
        ] as string;
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
        parsedNonEncodedParams[dynamicRouteKey] = parseRes.value;
      }
    }

    const urlWithParams = Router.fillInPathParams(path, parsedNonEncodedParams);
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
