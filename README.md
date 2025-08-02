Simple type safe routing for Next.js app router

## Todo

### Bugs

- [ ] Fix type issue with `{}` on paths without params

### Features

- [ ] Figure out best way to handle parsing props on server/client (wrap client side hooks?)
- [ ] Add support for route groups
- [ ] Look into parallel/intercepting routes
- [ ] Add support for catch all routes (e.g. `[...path]`)
- [ ] Think about API of passing info (one big object, optional stuff etc)
- [ ] Don't require both `layout` and `page` to be passed for `query`
- [ ] Remove `page` on `query` for `layout` routes

### Testing

- [ ] Type tests (incl performance tests)
- [ ] Runtime performance tests

## Example

```ts
const routes = layout({
  path: "",
  children: [
    layout({ path: "hello" }),
    page({ path: "[userId]", schema: z.string().uuid().brand("userId") }),
  ],
});

const router = new Router(routes);

router.route("/hi/[userId]", { userId: "1213" });
// type error: not a valid route
router.route("/hello/[userId]", { userId: "1213" });
// error: not a valid UUID
router.route("/hello/[userId]", {
  userId: "359bd75c-b3b8-4119-a6c8-1cff9c1cbd19",
});
// /hello/359bd75c-b3b8-4119-a6c8-1cff9c1cbd19
```

## Define routes

There are 2 types of routes

- `layout`: indicating the path can not be navigated to
- `page`: indicating the path can be navigated to. When you define both a layout and a page on a route, you should define it as a singular page here.

Each route should define a `path` and can define `children`, which are an array of `layout` or `page`. When the route's path matches `[pathName]`, it will be treated as a dynamic route and will require `{ pathName: string }` as a parameter when navigating to it. You can optionally define a `schema` for this parameter, which can be any `StandardSchema` that extends `string`.
