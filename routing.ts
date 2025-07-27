import * as z from "zod";

interface RouteBase {
  type: "page" | "layout";
  path: string | undefined;
  params: z.ZodType<string> | z.ZodType<string[]> | undefined;
}

type GetParamName<Pathname extends string> =
  Pathname extends `[${infer ParamName extends string}]` ? ParamName : never;

type Params<Pathname extends string> = [GetParamName<Pathname>] extends [never]
  ? undefined
  : z.ZodType<string>;

interface Page<
  in out Pathname extends string,
  in out TParams extends Params<Pathname>
> extends RouteBase {
  type: "page";
  path: Pathname;
  params: TParams;
}
export const page = <
  const Pathname extends string,
  const TParams extends Params<Pathname>
>(
  page: Omit<Page<Pathname, TParams>, "type">
): Page<Pathname, TParams> =>
  ({
    ...page,
    type: "page",
  } as Page<Pathname, TParams>);

interface Layout<
  in out Pathname extends string,
  in out TParams extends Params<Pathname>,
  in out Children extends readonly RouteBase[]
> extends RouteBase {
  type: "layout";
  path: Pathname;
  params: TParams;
  children: Children;
}
export const layout = <
  const Pathname extends string,
  const TParams extends Params<Pathname>,
  const Children extends readonly RouteBase[]
>(
  layout: Omit<Layout<Pathname, TParams, Children>, "type">
): Layout<Pathname, TParams, Children> =>
  ({
    ...layout,
    type: "layout",
  } as Layout<Pathname, TParams, Children>);

type AllPaths<Routes extends readonly RouteBase[]> =
  Routes[number] extends infer Route extends RouteBase
    ? Route extends Page<any, any>
      ? Route["path"]
      : Route extends Layout<any, any, any>
      ? `${Route["path"]}/${AllPaths<Route["children"]>}`
      : never
    : never;

type GetMatchingRoute<
  Pathname extends string,
  Routes extends readonly RouteBase[]
> = Extract<Routes[number], { path: Pathname }>;

type GetRoute<
  Path extends string,
  Routes extends readonly RouteBase[],
  Params extends Record<string, string | string[]> = {}
> = Path extends `${infer Pathname extends string}/${infer Rest extends string}`
  ? GetMatchingRoute<Pathname, Routes> extends infer Route extends Layout<
      any,
      any,
      any
    >
    ? GetRoute<
        Rest,
        Route["children"],
        Route["params"] extends undefined
          ? Params
          : Params & {
              [K in GetParamName<Route["path"]>]: z.output<Route["params"]>;
            }
      >
    : //   Page must be last
      never
  : GetMatchingRoute<Path, Routes> extends infer Route extends RouteBase
  ? Route extends Page<any, any>
    ? Prettify<Params>
    : never
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const getRoute =
  <const Routes extends readonly RouteBase[]>(routes: Routes) =>
  <const Path extends AllPaths<Routes>>(
    path: `/${Path}`
  ): GetRoute<Path, Routes> => {};
const res = getRoute("/[id]/[user]/user");
