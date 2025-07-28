import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { unknown } from "zod";

type AnyParamSchema = StandardSchemaV1<string>;

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
  ): string => {
    let pathSegments = (path as string).split("/").splice(1);
    let url = "";
    let routeCandidates: readonly AnyRoute[] = [routes];

    for (let i = 0; i < pathSegments.length; i++) {
      const currentSegment = pathSegments[i];
      if (currentSegment === undefined) {
        throw new Error(`Invalid path: ${path}`);
      }
      const currentRoute = routeCandidates.find(
        (route) => route.path === currentSegment
      );

      if (currentRoute === undefined) {
        throw new Error(`No route found for ${currentSegment}`);
      }

      if (currentRoute.type === "layout") {
        if (i >= pathSegments.length - 1) {
          throw new Error(`Expected page at ${currentRoute.path}, got layout`);
        }
        routeCandidates = currentRoute.children;
      }

      const dynamicRouteKey = getDynamicRouteKey(currentRoute.path);

      if (dynamicRouteKey !== undefined) {
        if (currentRoute.params === undefined) {
          throw new Error(`No params defined for route ${currentRoute.path}`);
        }

        const matchingValue = params[dynamicRouteKey as keyof typeof params];

        if (matchingValue === undefined) {
          throw new Error(`Missing param value for ${dynamicRouteKey}`);
        }

        const parseRes =
          currentRoute.params["~standard"].validate(matchingValue);
        if (parseRes instanceof Promise) {
          throw new Error(
            `Schema at ${currentRoute.path} is async, only sync schemas are supported`
          );
        }
        if (parseRes.issues !== undefined) {
          throw new Error(`Invalid value at ${currentRoute.path}`, {
            cause: parseRes.issues,
          });
        }
        url += `/${parseRes.value}`;
      } else {
        url += `/${currentSegment}`;
      }
    }
    return url;
  };
