import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { UseQueryStatesOptions, UseQueryStatesReturn } from "nuqs";
import {
  createLoader,
  createSerializer,
  type inferParserType,
  type Parser,
} from "nuqs/server";
import type { ReactNode } from "react";

export type AnyParamValue = string | string[] | undefined;

export type AnyParamSchema =
  // [param]
  | StandardSchemaV1<string>
  // [...param]
  | StandardSchemaV1<string[]>
  // [[...param]]
  | StandardSchemaV1<string[] | undefined>;

export interface QueryParamParserMap<T> extends Record<string, Parser<T>> {}

export interface QueryParams<
  Layout extends QueryParamParserMap<any> = {},
  Page extends QueryParamParserMap<any> = {}
> {
  readonly layout: Layout;
  readonly page: Page;
}

export type RouteType = "page" | "layout" | "group";
export interface RouteBase {
  readonly type: RouteType;
  readonly path: string;
  readonly params: AnyParamSchema | undefined;
  readonly query: QueryParams | undefined;
  readonly children: readonly RouteBase[] | undefined;
  readonly ["~paramSchemaMap"]: Record<string, AnyParamSchema | undefined>;
}

export type GetParamsSchema<Pathname extends string> =
  | (Pathname extends `[${infer Inner}]`
      ? Inner extends `...${string}`
        ? StandardSchemaV1<string[]>
        : Inner extends `[...${string}]`
        ? StandardSchemaV1<string[] | undefined>
        : StandardSchemaV1<string>
      : undefined)
  | undefined;

type MakeQueryParamsReturn<
  T,
  Type extends RouteType
> = T extends QueryParamParserMap<any>
  ? QueryParams<T, Type extends "page" ? T : {}>
  : T;

const makeQueryParams = <
  // const PageParserMap extends QueryParamParserMap<any>,
  // const LayoutParserMap extends QueryParamParserMap<any> = PageParserMap
  const ParserMap extends QueryParamParserMap<any> | QueryParams<any, any>,
  const Type extends RouteType
>(
  parser: ParserMap,
  type: Type
): MakeQueryParamsReturn<ParserMap, Type> => {
  if (
    Object.keys(parser).length === 2 &&
    "layout" in parser &&
    "page" in parser
  ) {
    return parser as any;
  }

  if (type !== "page") {
    return {
      page: {},
      layout: parser,
    } as any;
  }

  return {
    layout: parser,
    page: parser,
  } as any;
};

export interface Page<
  in out Pathname extends string,
  in out ParamSchema extends GetParamsSchema<Pathname>,
  in out QueryParamSchema extends QueryParams | undefined,
  in out Children extends readonly RouteBase[] | undefined
> extends RouteBase {
  readonly type: "page";
  readonly path: Pathname;
  readonly params: ParamSchema;
  readonly children: Children;
  readonly query: QueryParamSchema;
  readonly ["~paramSchemaMap"]: ParamSchemaMap<Pathname, ParamSchema>;
}

export const page = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname> | undefined,
  const QueryParamsSchema extends
    | QueryParams
    | QueryParamParserMap<any>
    | undefined = undefined,
  const Children extends readonly RouteBase[] | undefined = undefined
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
  MakeQueryParamsReturn<QueryParamsSchema, "page">,
  undefined extends Children ? undefined : Children
> => ({
  type: "page",
  path: path,
  params: config.params as ParamsSchema,
  children: config.children as any,
  query: (config.query
    ? makeQueryParams(config.query, "page")
    : { page: {}, layout: {} }) as MakeQueryParamsReturn<
    QueryParamsSchema,
    "page"
  >,
  ["~paramSchemaMap"]: {} as ParamSchemaMap<Pathname, ParamsSchema>,
});

export interface Layout<
  in out Pathname extends string,
  in out ParamsSchema extends GetParamsSchema<Pathname>,
  in out QueryParamsSchema extends QueryParams | undefined,
  in out Children extends readonly RouteBase[]
> extends RouteBase {
  readonly type: "layout";
  readonly path: Pathname;
  readonly params: ParamsSchema;
  readonly children: Children;
  readonly query: QueryParamsSchema;
  readonly ["~paramSchemaMap"]: ParamSchemaMap<Pathname, ParamsSchema>;
}
export const layout = <
  const Pathname extends string,
  const ParamsSchema extends GetParamsSchema<Pathname>,
  const QueryParamsSchema extends
    | QueryParams
    | QueryParamParserMap<any>
    | undefined = undefined,
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
  undefined extends QueryParamsSchema
    ? undefined
    : MakeQueryParamsReturn<QueryParamsSchema, "layout">,
  Children
> => ({
  type: "layout",
  path: path,
  params: config.params as ParamsSchema,
  children: (config.children ?? []) as Children,
  query: (config.query === undefined
    ? undefined
    : makeQueryParams(config.query, "layout")) as any,
  ["~paramSchemaMap"]: {} as ParamSchemaMap<Pathname, ParamsSchema>,
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
  readonly ["~paramSchemaMap"]: {};
}

export const group = <
  const Pathname extends `(${string})`,
  const Children extends readonly RouteBase[],
  const QueryParamsSchema extends QueryParams | QueryParamParserMap<any> = {
    layout: Record<string, never>;
    page: Record<string, never>;
  }
>(
  path: Pathname,
  config: {
    readonly children: Children;
    readonly query?: QueryParamsSchema;
  }
): Group<
  Pathname,
  Children,
  MakeQueryParamsReturn<QueryParamsSchema, "group">
> => ({
  type: "group",
  path: path,
  children: (config.children ?? []) as Children,
  query: (config.query
    ? makeQueryParams(config.query, "group")
    : { page: {}, layout: {} }) as MakeQueryParamsReturn<
    QueryParamsSchema,
    "group"
  >,
  params: undefined,
  ["~paramSchemaMap"]: {},
});

export type AbsorbUndefined<T, AbsorbWith = never> = T extends undefined
  ? AbsorbWith
  : T;

export type NumberPassThroughNever<T extends readonly unknown[]> = [T] extends [
  never
]
  ? never
  : T[number];

export type LazyAllPaths<
  Route extends [any],
  Path extends string,
  Type extends RouteType = RouteType
> = string extends Path
  ? Path
  : (_GetPath<Path, [{ children: Route }], Type> & string) | "/";

type GetChildrenOfType<
  Route extends [any],
  Type extends RouteType
> = AbsorbUndefined<Route[0]["children"]>[number] & {
  type: Type;
};

type _GetPath<
  Path extends string,
  Route extends [any],
  Type extends RouteType
> = Path extends `${infer First}/${infer Rest}`
  ? `${First}/${_GetPath<
      Rest,
      [AbsorbUndefined<Route[0]["children"]>[number] & { path: First }],
      Type
    >}`
  : Path extends GetChildrenOfType<Route, Type>["path"]
  ? Path
  : Path extends AbsorbUndefined<Route[0]["children"]>[number]["path"]
  ? never
  : AbsorbUndefined<Route[0]["children"]>[number]["path"];

type ParamKey<T extends string> = T extends `[${infer Inner}]`
  ? Inner extends `...${infer ParamName}`
    ? ParamName
    : Inner extends `[...${infer ParamName}]`
    ? ParamName
    : Inner
  : never;

type ParamSchemaMap<RoutePathName extends string, RouteParamSchema> = {
  readonly [K in ParamKey<RoutePathName>]: RouteParamSchema extends undefined
    ? NonNullable<GetParamsSchema<RoutePathName>>
    : RouteParamSchema;
};

type GetMatchingRoute<
  Pathname extends string,
  Routes extends readonly RouteBase[]
> = Extract<Routes[number], { readonly path: Pathname }>;

type GetPageQueryParamsSchema<T> = T extends QueryParams ? T["page"] : {};
type GetLayoutQueryParamsSchema<T> = T extends QueryParams ? T["layout"] : {};

// TODO: fine better way to solve this
type StrictEmptyObject<T> = T;

export type GetRouteSchema<
  Path extends string,
  Routes extends readonly RouteBase[],
  Type extends RouteType = RouteType,
  Params extends Record<string, StandardSchemaV1<string>> = {},
  PageQueryParamMap = {}
> = Path extends `${infer RoutePathName}/${infer Rest}`
  ? GetMatchingRoute<RoutePathName, Routes> extends {
      children: infer RoutePathChildren extends readonly RouteBase[];
      ["~paramSchemaMap"]: infer RouteParamSchemaMap;
      query: infer RouteQuerySchema;
    }
    ? GetRouteSchema<
        Rest,
        RoutePathChildren,
        Type,
        RouteParamSchemaMap & Params,
        GetLayoutQueryParamsSchema<RouteQuerySchema> & PageQueryParamMap
      >
    : never
  : GetMatchingRoute<Path, Routes> extends {
      type: infer RouteType extends Type;
      ["~paramSchemaMap"]: infer RouteParamSchemaMap;
      query: infer RouteQuerySchema;
    }
  ? {
      type: RouteType;
      params: StrictEmptyObject<Prettify<RouteParamSchemaMap & Params>>;
      query: {
        page: StrictEmptyObject<
          Prettify<
            PageQueryParamMap &
              GetPageQueryParamsSchema<RouteQuerySchema> &
              GetLayoutQueryParamsSchema<RouteQuerySchema>
          >
        >;
        layout: StrictEmptyObject<
          Prettify<
            PageQueryParamMap & GetLayoutQueryParamsSchema<RouteQuerySchema>
          >
        >;
      };
    }
  : never;

export type RouteAtPath<
  Path extends string,
  Route extends RouteBase,
  Type extends RouteType
> = Path extends `${infer First}/${infer Rest}`
  ? GetMatchingRoute<First, [Route]> extends {
      children: infer Children extends readonly RouteBase[];
    }
    ? RouteAtPath<Rest, Children[number], Type>
    : never
  : GetMatchingRoute<Path, [Route]> extends infer Route extends RouteBase & {
      type: Type;
    }
  ? Route
  : never;

type UndefinedToNull<T> =
  // Force distribution so we can map over the union
  T extends any
    ? //
      T extends undefined
      ? null
      : T
    : never;

export type RouteRepresentation<Route extends RouteBase> =
  Route["params"] extends undefined
    ? Route["path"]
    : // Optional catch all (e.g. [[...param]]) is represented as undefined in params but null when using Next's useSelectedLayoutSegment(s) hooks
      UndefinedToNull<SchemaOutput<Route["params"]>>;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type SchemaInput<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
  : never;

export type SchemaOutput<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<T>
  : never;

export type GetParserMapInput<T extends Record<string, Parser<any>>> = {
  readonly [K in keyof T]?: T[K] extends Parser<infer U> ? U | null : never;
};

// TODO: check how to handle null/default values
export type GetParserMapOutput<T extends Record<string, Parser<any>>> =
  inferParserType<T>;

export type GetParamMapInput<ParamSchema> = {
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
  readonly expectedTypes: readonly RouteType[];
  readonly pathCandidates: readonly { path: string; type: RouteType }[];
  readonly type: RoutingNoMatchingRouteErrorType;

  constructor(args: {
    readonly path: string;
    readonly expectedTypes: readonly RouteType[];
    readonly pathCandidates: readonly { path: string; type: RouteType }[];
    readonly type: RoutingNoMatchingRouteErrorType;
  }) {
    super(
      `No matching route found for path ${
        args.path
      }, excepted to find a type ${args.expectedTypes.join(
        ", "
      )} out of ${args.pathCandidates
        .map((p) => `${p.path} (${p.type})`)
        .join(", ")}`
    );
    this.path = args.path;
    this.pathCandidates = args.pathCandidates;
    this.type = args.type;
    this.expectedTypes = args.expectedTypes;
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
  Path extends string
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

export abstract class Router<
  const in out Routes extends RouteBase & { path: ""; type: "page" | "layout" }
> {
  readonly ["~routes"]: Routes;
  constructor(routes: Routes) {
    this["~routes"] = routes;
  }

  // static ["~fillInPathParams"](
  //   path: string,
  //   nonEncodedParams: Record<string, string | string[]>
  // ) {
  //   return path.replace(
  //     /\[\[\.{3}([^\]]+)\]\]|\[\.{3}([^\]]+)\]|\[([^\]]+)\]/g,
  //     (_, optionalCatchAllKey, catchAllKey, singleKey) => {
  //       // Optional catch-all: [[...param]]
  //       if (optionalCatchAllKey) {
  //         const value = nonEncodedParams[optionalCatchAllKey];
  //         if (
  //           value === undefined ||
  //           (Array.isArray(value) && value.length === 0)
  //         ) {
  //           return ""; // remove segment entirely
  //         }
  //         if (!Array.isArray(value)) {
  //           throw new RoutingInternalDefectError({
  //             message: `Expected array for optional catch-all param: ${optionalCatchAllKey}, received ${value} out of ${JSON.stringify(
  //               nonEncodedParams
  //             )}`,
  //             metaData: {
  //               params: nonEncodedParams,
  //               path,
  //               key: optionalCatchAllKey,
  //             },
  //           });
  //         }
  //         return value.map((v) => encodeURIComponent(v)).join("/");
  //       }

  //       // Required catch-all: [...param]
  //       if (catchAllKey) {
  //         const value = nonEncodedParams[catchAllKey];
  //         if (!Array.isArray(value) || value.length === 0) {
  //           throw new RoutingInternalDefectError({
  //             message: `Missing or empty required catch-all param: ${catchAllKey}, received ${value} out of ${JSON.stringify(
  //               nonEncodedParams
  //             )}`,
  //             metaData: { params: nonEncodedParams, path, key: catchAllKey },
  //           });
  //         }
  //         return value.map((v) => encodeURIComponent(v)).join("/");
  //       }
  //       const value = nonEncodedParams[singleKey];

  //       // Single param: [param]
  //       if (value === undefined) {
  //         throw new RoutingInternalDefectError({
  //           message: `Missing parameter: ${singleKey}`,
  //           metaData: { params: nonEncodedParams, path, key: singleKey },
  //         });
  //       }
  //       if (Array.isArray(value)) {
  //         throw new RoutingInternalDefectError({
  //           message: `Expected string for single param: ${singleKey}`,
  //           metaData: { params: nonEncodedParams, path, key: singleKey },
  //         });
  //       }
  //       return encodeURIComponent(value);
  //     }
  //   );
  // }
  static ["~fillInPathParams"](
    path: string,
    nonEncodedParams: Record<string, string | string[]>
  ) {
    const segments = path.split("/");

    return segments
      .map((segment) => {
        // Optional catch-all: [[...param]]
        if (segment.startsWith("[[...") && segment.endsWith("]]")) {
          const key = segment.slice(5, -2);
          const value = nonEncodedParams[key];
          if (
            value === undefined ||
            (Array.isArray(value) && value.length === 0)
          ) {
            return undefined; // remove segment entirely
          }
          if (!Array.isArray(value)) {
            throw new RoutingInternalDefectError({
              message: `Expected array for optional catch-all param: ${key}`,
              metaData: { params: nonEncodedParams, path, key },
            });
          }
          return value.map((v) => encodeURIComponent(v)).join("/");
        }

        // Required catch-all: [...param]
        if (segment.startsWith("[...") && segment.endsWith("]")) {
          const key = segment.slice(4, -1);
          const value = nonEncodedParams[key];
          if (!Array.isArray(value) || value.length === 0) {
            throw new RoutingInternalDefectError({
              message: `Missing or empty required catch-all param: ${key}`,
              metaData: { params: nonEncodedParams, path, key },
            });
          }
          return value.map((v) => encodeURIComponent(v)).join("/");
        }

        // Single param: [param]
        if (segment.startsWith("[") && segment.endsWith("]")) {
          const key = segment.slice(1, -1);
          const value = nonEncodedParams[key];
          if (value === undefined) {
            throw new RoutingInternalDefectError({
              message: `Missing parameter: ${key}`,
              metaData: { params: nonEncodedParams, path, key },
            });
          }
          if (Array.isArray(value)) {
            throw new RoutingInternalDefectError({
              message: `Expected string for single param: ${key}`,
              metaData: { params: nonEncodedParams, path, key },
            });
          }
          return encodeURIComponent(value);
        }

        // Static segment
        return segment;
      })
      .join("/");
  }

  static ["~stripGroups"](path: string) {
    return path.replace(/\/?\(\w+\)/g, "");
  }
  static ["~getDynamicRouteKey"](path: string) {
    if (path.startsWith("[[...") && path.endsWith("]]")) {
      return path.slice(5, -2);
    }
    if (path.startsWith("[...") && path.endsWith("]")) {
      return path.slice(4, -1);
    }
    if (path.startsWith("[") && path.endsWith("]")) {
      return path.slice(1, -1);
    }
    return undefined;
  }

  ["~getRouteSchemaCache"] = new Map<
    string,
    GetRouteSchemaReturn<Routes, string>
  >();

  ["~getRouteSchema"]<const Path extends string>(
    path: LazyAllPaths<[Routes], Path>
  ): GetRouteSchemaReturn<Routes, Path> {
    const cached = this["~getRouteSchemaCache"].get(path);
    if (cached !== undefined) {
      return cached as any;
    }

    const res = {
      params: {} as Record<string, AnyParamSchema | undefined>,
      query: {
        layout: {} as Record<string, Parser<any>>,
        page: {} as Record<string, Parser<any>>,
      },
    };
    let pathSegments = path.split("/");

    if (path.endsWith("/")) {
      pathSegments.pop();
    }

    let routeCandidates: readonly RouteBase[] = [this["~routes"]];
    let matchedType: RouteType | undefined;

    while (true) {
      const currentSegment = pathSegments.shift();

      if (currentSegment === undefined) {
        break;
      }

      const currentRoute = routeCandidates.find(
        (route) => route.path === currentSegment
      );

      if (currentRoute === undefined) {
        return {
          ok: false,
          error: new RoutingNoMatchingRouteError({
            path: path,
            pathCandidates: routeCandidates.map((route) => ({
              path: route.path,
              type: route["type"],
            })),
            expectedTypes: ["page", "layout", "group"],
            type: "noMatch",
          }),
        };
      }
      routeCandidates = currentRoute.children ?? [];
      matchedType = currentRoute["type"];

      const dynamicRouteKey = Router["~getDynamicRouteKey"](currentRoute.path);
      if (dynamicRouteKey !== undefined) {
        if (currentRoute.params !== undefined) {
          res.params[dynamicRouteKey] = currentRoute.params;
        } else {
          res.params[dynamicRouteKey] = undefined;
        }
      }

      if (currentRoute.query !== undefined) {
        // Merge in params of all layouts above this route for both pages and layouts
        for (const key of Object.keys(currentRoute.query.layout)) {
          res.query.layout[key] = currentRoute.query.layout[
            key as keyof typeof currentRoute.query.layout
          ] as any;
          res.query.page[key] = currentRoute.query.layout[
            key as keyof typeof currentRoute.query.layout
          ] as any;
        }
      }

      if (currentRoute.query !== undefined) {
        // Page query params are only added for that specific page
        if (pathSegments.length === 0) {
          for (const key of Object.keys(currentRoute.query.page)) {
            res.query.page[key] = currentRoute.query.page[
              key as keyof typeof currentRoute.query.page
            ] as any;
          }
        }
      }
    }

    const returnValue = {
      ok: true as const,
      data: {
        schema: res as GetRouteSchema<Path, [Routes]>,
        matchedType: matchedType,
      },
    };

    this["~getRouteSchemaCache"].set(path, returnValue as any);

    return returnValue as any;
  }

  /**

   * @returns a `{ok: true, data: D} | {ok: false, error: E}` union with
   * - data: an URL with each segment URL encoded
   * - error:
   *   - {@link RoutingValidationError}: a provided param does not match the expected schema
   *   - {@link RoutingNoMatchingRouteError}: the path does not match any route, or the last segment does not match a page
   */
  routeSafe<
    const Path extends string,
    const RouteSchema extends GetRouteSchema<Path, [Routes], "page">
  >(
    path: LazyAllPaths<[Routes], Path, "page">,
    params: GetParamMapInput<RouteSchema["params"]>,
    query: GetParserMapInput<RouteSchema["query"]["page"]>
  ): RouterRouteReturn {
    const schemaRes = this["~getRouteSchema"](path as string);
    if (schemaRes.ok === false) {
      return schemaRes;
    }

    if (schemaRes.data.matchedType !== "page") {
      return {
        ok: false,
        error: new RoutingNoMatchingRouteError({
          path: path,
          pathCandidates: [{ path: path, type: schemaRes.data.matchedType }],
          expectedTypes: ["page"],
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

    const urlWithParams = Router["~fillInPathParams"](
      path,
      parsedNonEncodedParams
    );
    const urlWithParamsWithoutGroups = Router["~stripGroups"](urlWithParams);
    const serializer = createSerializer(schemaRes.data.schema.query.page);
    const queryString = serializer(query as any);
    const url = `${urlWithParamsWithoutGroups}${queryString}`;

    return {
      ok: true,
      data: url,
    };
  }

  /** Like {@link routeSafe} but throws if the route is not found. */
  route<
    const Path extends string,
    const RouteSchema extends GetRouteSchema<Path, [Routes], "page">
  >(
    path: LazyAllPaths<[Routes], Path, "page"> & string,
    params: GetParamMapInput<RouteSchema["params"]>,
    query: GetParserMapInput<RouteSchema["query"]["page"]>
  ): string {
    const res = this.routeSafe(path as string, params, query);
    if (res.ok) {
      return res.data;
    }
    throw res.error;
  }

  makeSerializer<Path extends string>(
    path: LazyAllPaths<[Routes], Path, "page">
  ): Serializer<[Routes], Path> {
    return (params, query) => this.route(path as string, params, query);
  }

  makeSafeSerializer<Path extends string>(
    path: LazyAllPaths<[Routes], Path, "page">
  ): SafeSerializer<[Routes], Path> {
    return (params, query) => this.routeSafe(path as string, params, query);
  }

  ["~parseSafe"]<
    const Path extends string,
    const RouteSchema extends GetRouteSchema<Path, [Routes]>
  >(
    path: LazyAllPaths<[Routes], Path>,
    target: "page" | "layout",
    props: MapAwaited<RawPageProps>
  ): PageParseSafeReturn<RouteSchema> {
    const schemaRes = this["~getRouteSchema"](path as string);
    if (schemaRes.ok === false) {
      return schemaRes;
    }

    if (target === "page" && schemaRes.data.matchedType !== "page") {
      return {
        ok: false,
        error: new RoutingNoMatchingRouteError({
          path: path,
          pathCandidates: [{ path: path, type: schemaRes.data.matchedType }],
          expectedTypes: ["page"],
          type: "matchedWrongType",
        }),
      };
    }

    const parsedParams: Record<string, string> = {};

    for (const key of Object.keys(schemaRes.data.schema.params)) {
      const paramSchema =
        schemaRes.data.schema.params[
          key as keyof typeof schemaRes.data.schema.params
        ];
      if (paramSchema === undefined) {
        // @ts-expect-error: TODO: check if this is correct
        parsedParams[key] = props.params[key];
      } else {
        const parseRes = (paramSchema as StandardSchemaV1<string>)[
          "~standard"
        ].validate(props.params[key as keyof typeof props.params]);

        if (parseRes instanceof Promise) {
          throw new RoutingInternalDefectError({
            message: `Schema at ${key} of ${path} is async, only sync schemas are supported`,
          });
        }

        if (parseRes.issues !== undefined) {
          return {
            ok: false,
            error: new RoutingValidationError({
              expected: paramSchema,
              actual: props.params[key as keyof typeof props.params],
              path: path,
              issues: parseRes.issues,
            }),
          };
        }
        parsedParams[key] = parseRes.value;
      }
    }
    const queryParamParser = createLoader(schemaRes.data.schema.query[target]);
    // TODO: check if this can throw
    const queryParseRes = queryParamParser(props.searchParams);

    return {
      ok: true,
      data: {
        params: parsedParams as RouteParamsOutput<RouteSchema>,
        query: queryParseRes as PageQueryOutput<RouteSchema>,
      },
    };
  }

  parsePageSafe<
    const Path extends string,
    const RouteSchema extends GetRouteSchema<Path, [Routes], "page">
  >(
    path: LazyAllPaths<[Routes], Path, "page">,
    props: MapAwaited<RawPageProps>
  ): PageParseSafeReturn<RouteSchema> {
    return this["~parseSafe"](path as string, "page", props);
  }

  parseLayoutSafe<
    const Path extends string,
    const RouteSchema extends GetRouteSchema<Path, [Routes]>
  >(
    path: LazyAllPaths<[Routes], Path>,
    props: MapAwaited<RawPageProps>
  ): LayoutParseSafeReturn<RouteSchema> {
    return this["~parseSafe"](path as string, "layout", props);
  }

  implementPage<const Path extends string, const Out>(
    path: LazyAllPaths<[Routes], Path, "page">,
    implementation: PageImplementation<[Routes], Path, Out>
  ): (props: RawPageProps) => Out {
    const safeParser = async (props: RawPageProps) => {
      const params = await props.params;
      const searchParams = await props.searchParams;
      return this.parsePageSafe(path as string, {
        params,
        searchParams,
      });
    };

    const unsafeParser = async (props: RawPageProps) => {
      const params = await props.params;
      const searchParams = await props.searchParams;
      const res = this.parsePageSafe(path as string, {
        params,
        searchParams,
      });
      if (res.ok) {
        return res.data;
      }
      throw res.error;
    };

    return (props: RawPageProps) => {
      const safeParseScoped = () => safeParser(props);
      const unsafeParseScoped = () => unsafeParser(props);
      return implementation({
        props,
        parseSafe: safeParseScoped,
        parse: unsafeParseScoped,
      });
    };
  }

  implementLayout<const Path extends string, const Out>(
    path: LazyAllPaths<[Routes], Path, RouteType>,
    implementation: LayoutImplementation<[Routes], Path, Out>
  ): (props: RawLayoutProps) => Out {
    const safeParser = async (props: RawLayoutProps) => {
      const params = await props.params;
      const searchParams = await props.searchParams;
      return this.parseLayoutSafe(path as string, {
        params,
        searchParams,
      });
    };

    const unsafeParser = async (props: RawLayoutProps) => {
      const params = await props.params;
      const searchParams = await props.searchParams;
      const res = this.parseLayoutSafe(path as string, {
        params,
        searchParams,
      });
      if (res.ok) {
        return res.data;
      }
      throw res.error;
    };

    return (props: RawLayoutProps) => {
      const safeParseScoped = () => safeParser(props);
      const unsafeParseScoped = () => unsafeParser(props);
      return implementation({
        props,
        parseSafe: safeParseScoped,
        parse: unsafeParseScoped,
      });
    };
  }

  abstract usePageQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path, "page"> & string,
    options?: Partial<
      UseQueryStatesOptions<GetRouteSchema<Path, [Routes]>["query"]["page"]>
    >
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["page"]>;
  abstract useLayoutQuery<const Path extends string>(
    path: LazyAllPaths<[Routes], Path> & string,
    options?: Partial<
      UseQueryStatesOptions<GetRouteSchema<Path, [Routes]>["query"]["page"]>
    >
  ): UseQueryStatesReturn<GetRouteSchema<Path, [Routes]>["query"]["layout"]>;

  /** Note this does no runtime validation. */
  abstract useSelectedLayoutSegment<const Path extends string>(
    path: LazyAllPaths<[Routes], Path> & string
  ): RouteRepresentation<
    AbsorbUndefined<
      RouteAtPath<Path, Routes, RouteType>["children"],
      never
    >[number]
  > | null;
}

interface SafeSerializer<
  in out Routes extends readonly RouteBase[],
  in out Path extends string
> {
  (
    params: GetParamMapInput<GetRouteSchema<Path, Routes>["params"]>,
    query: GetParserMapInput<GetRouteSchema<Path, Routes>["query"]["page"]>
  ): RouterRouteReturn;
}

interface Serializer<
  in out Routes extends readonly RouteBase[],
  in out Path extends string
> {
  (
    params: GetParamMapInput<GetRouteSchema<Path, Routes>["params"]>,
    query: GetParserMapInput<GetRouteSchema<Path, Routes>["query"]["page"]>
  ): string;
}

interface PageImplementation<
  in out Routes extends readonly RouteBase[],
  in out Path extends string,
  in out Out,
  in out RouteSchema extends GetRouteSchema<Path, Routes> = GetRouteSchema<
    Path,
    Routes
  >
> {
  (args: {
    props: RawPageProps;
    parseSafe: PageImplParser<Routes, Path, RouteSchema>;
    parse: PageImplParserUnsafe<Routes, Path, RouteSchema>;
  }): Out;
}
type PageParseSafeReturn<RouteSchema extends GetRouteSchema<any, any>> =
  | {
      readonly ok: true;
      readonly data: {
        readonly params: RouteParamsOutput<RouteSchema>;
        readonly query: PageQueryOutput<RouteSchema>;
      };
      readonly error?: undefined;
    }
  | {
      readonly ok: false;
      readonly data?: undefined;
      readonly error: RoutingValidationError | RoutingNoMatchingRouteError;
    };

export interface PageParseReturn<
  in out RouteSchema extends GetRouteSchema<any, any>
> {
  readonly params: RouteParamsOutput<RouteSchema>;
  readonly query: PageQueryOutput<RouteSchema>;
}
export interface PageImplParser<
  in out Routes extends readonly RouteBase[],
  in out Path extends string,
  in out RouteSchema extends GetRouteSchema<Path, Routes> = GetRouteSchema<
    Path,
    Routes
  >
> {
  (): Promise<PageParseSafeReturn<RouteSchema>>;
}
export interface PageImplParserUnsafe<
  in out Routes extends readonly RouteBase[],
  in out Path extends string,
  in out RouteSchema extends GetRouteSchema<Path, Routes> = GetRouteSchema<
    Path,
    Routes
  >
> {
  (): Promise<PageParseReturn<RouteSchema>>;
}

export interface LayoutImplementation<
  in out Routes extends readonly RouteBase[],
  in out Path extends string,
  in out Out,
  in out RouteSchema extends GetRouteSchema<Path, Routes> = GetRouteSchema<
    Path,
    Routes,
    RouteType
  >
> {
  (args: {
    props: RawLayoutProps;
    parseSafe: LayoutImplParser<Routes, Path, RouteSchema>;
    parse: LayoutImplParserUnsafe<Routes, Path, RouteSchema>;
  }): Out;
}

export type LayoutParseSafeReturn<
  RouteSchema extends GetRouteSchema<any, any>
> =
  | {
      readonly ok: true;
      readonly data: {
        readonly params: RouteParamsOutput<RouteSchema>;
        readonly query: LayoutQueryOutput<RouteSchema>;
      };
      readonly error?: undefined;
    }
  | {
      readonly ok: false;
      readonly data?: undefined;
      readonly error: RoutingValidationError | RoutingNoMatchingRouteError;
    };

export interface LayoutParseReturn<
  in out RouteSchema extends GetRouteSchema<any, any>
> {
  readonly params: RouteParamsOutput<RouteSchema>;
  readonly query: LayoutQueryOutput<RouteSchema>;
}
export interface LayoutImplParser<
  in out Routes extends readonly RouteBase[],
  in out Path extends string,
  in out RouteSchema extends GetRouteSchema<Path, Routes> = GetRouteSchema<
    Path,
    Routes
  >
> {
  (): Promise<LayoutParseSafeReturn<RouteSchema>>;
}
export interface LayoutImplParserUnsafe<
  in out Routes extends readonly RouteBase[],
  in out Path extends string,
  in out RouteSchema extends GetRouteSchema<Path, Routes> = GetRouteSchema<
    Path,
    Routes
  >
> {
  (): Promise<LayoutParseReturn<RouteSchema>>;
}

export type MapAwaited<T> = {
  [K in keyof T]: Awaited<T[K]>;
};

export interface RawPageProps {
  readonly params: Promise<Record<string, string | string[]>>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface RawLayoutProps extends RawPageProps {
  children: ReactNode;
}

export type RouteParamsOutput<RouteSchema extends GetRouteSchema<any, any>> = {
  [K in keyof RouteSchema["params"]]: SchemaOutput<RouteSchema["params"][K]>;
};

export type PageQueryOutput<RouteSchema extends GetRouteSchema<any, any>> =
  GetParserMapOutput<RouteSchema["query"]["page"]>;

export type LayoutQueryOutput<RouteSchema extends GetRouteSchema<any, any>> =
  GetParserMapOutput<RouteSchema["query"]["layout"]>;
