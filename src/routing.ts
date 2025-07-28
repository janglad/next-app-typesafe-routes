import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { unknown } from "zod";

type AnyParamValue = string;

type AnyParamSchema<T extends AnyParamValue = AnyParamValue> = T extends any
  ? StandardSchemaV1<T>
  : never;

type AnyRoute = Page<any, any> | Layout<any, any, readonly any[]>;
export interface RouteBase {
  type: "page" | "layout";
  path: string | undefined;
  params: AnyParamSchema | undefined;
}

type Params<Pathname extends string> = Pathname extends `[${infer ParamName}]`
  ? StandardSchemaV1<string>
  : undefined;

export interface Page<
  in out Pathname extends string,
  in out TParams extends Params<Pathname>
> extends RouteBase {
  type: "page";
  path: Pathname;
  params: TParams;
}
export const page = <const T extends Omit<Page<any, any>, "type">>(
  page: T
): Page<T["path"], Params<T["path"]>> => ({ ...page, type: "page" });
export interface Layout<
  in out Pathname extends string,
  in out TParams extends Params<Pathname>,
  in out Children extends readonly RouteBase[]
> extends RouteBase {
  type: "layout";
  path: Pathname;
  params: TParams;
  children: Children;
}
export const layout = <const T extends Omit<Layout<any, any, any>, "type">>(
  layout: T
): Layout<T["path"], T["params"], T["children"]> => ({
  ...layout,
  type: "layout",
});

export type AllPaths<Routes extends readonly RouteBase[]> =
  Routes[number] extends infer Route
    ? Route extends Page<infer Pathname, any>
      ? Pathname
      : Route extends Layout<infer Pathname, any, infer Children>
      ? `${Pathname}/${AllPaths<Children>}`
      : never
    : never;

type GetMatchingRoute<
  Pathname extends string,
  Routes extends readonly RouteBase[]
> = Extract<Routes[number], { path: Pathname }>;

type ExtractParam<T extends string> = T extends `[${infer P}]` ? P : never;

type ParamMap<T extends string> = ExtractParam<T> extends never
  ? {}
  : { [K in ExtractParam<T>]: StandardSchemaV1<string> };

export type GetRouteSchema<
  Path extends string,
  Routes extends readonly RouteBase[],
  Params extends Record<string, string | string[]> = {}
> = Path extends `${infer Pathname}/${infer Rest}`
  ? GetMatchingRoute<Pathname, Routes> extends Layout<
      any,
      any,
      infer PathChildren
    >
    ? GetRouteSchema<Rest, PathChildren, ParamMap<Pathname> & Params>
    : //   Page must be last
      never
  : GetMatchingRoute<Path, Routes> extends Page<infer PathName, any>
  ? Prettify<ParamMap<PathName> & Params>
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type SchemaInput<T> = T extends StandardSchemaV1
  ? StandardSchemaV1.InferInput<T>
  : T;

const getDynamicRouteKey = (path: string) => path.match(/^\[(.*)\]$/)?.[1];

export const getRoute =
  <const Routes extends AnyRoute>(routes: Routes) =>
  <
    const Path extends AllPaths<[Routes]>,
    ParamsSchema extends GetRouteSchema<Path, [Routes]> = GetRouteSchema<
      Path,
      [Routes]
    >
  >(
    path: `/${Path}`,
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
      } => {
    let pathSegments = (path as string).split("/").splice(1);
    let url = "";
    let routeCandidates: readonly AnyRoute[] = [routes];

    for (let i = 0; i < pathSegments.length; i++) {
      const currentSegment = pathSegments[i]!;

      const currentRoute = routeCandidates.find(
        (route) => route.path === currentSegment
      );

      if (currentRoute === undefined) {
        return {
          ok: false,
          error: new RoutingNoMatchingRouteError({
            path: path,
            pathCandidates: routeCandidates
              .filter((route) => route.type === "layout")
              .map((route) => route.path),
            actual: currentSegment,
          }),
        };
      }

      if (currentRoute.type === "layout") {
        if (i >= pathSegments.length - 1) {
          return {
            ok: false,
            error: new RoutingNoMatchingRouteError({
              path: path,
              pathCandidates: routeCandidates
                .filter((route) => route.type === "page")
                .map((route) => route.path),
              actual: currentSegment,
            }),
          };
        }
        routeCandidates = currentRoute.children;
      }

      const dynamicRouteKey = getDynamicRouteKey(currentRoute.path);

      if (dynamicRouteKey !== undefined && currentRoute.params !== undefined) {
        const matchingValue = params[dynamicRouteKey as keyof typeof params];

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
        url += `/${parseRes.value}`;
      } else {
        url += `/${currentSegment}`;
      }
    }
    return {
      ok: true,
      data: url,
    };
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

  constructor(args: {
    path: string;
    pathCandidates: readonly string[];
    actual: string;
  }) {
    super(
      `No matching route found for path ${
        args.path
      }, expected one of [${args.pathCandidates.join(", ")}] but got ${
        args.actual
      }. Note that the last segment of a path should always match a page.`
    );
    this.path = args.path;
    this.pathCandidates = args.pathCandidates;
    this.actual = args.actual;
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
