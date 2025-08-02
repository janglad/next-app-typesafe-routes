Simple type safe routing for Next.js app router

## Todo

### Bugs

- [ ] Fix type issue with `{}` on paths without params

### Features

- [ ] Figure out best way to handle parsing props on server/client (wrap client side hooks?)
- [ ] Look into parallel/intercepting routes
- [ ] Add support for catch all routes (e.g. `[...path]`)
- [ ] Think about API of passing info (one big object, optional stuff etc)
- [ ] Remove `page` on `query` for `layout` routes

### Testing

- [ ] Runtime performance tests

## Example

```ts
const router = new Router(
  page("", {
    children: [
      // Route group - not part of actual URL
      group("(auth)", {
        // Defined with NUQS, will be available to all children of this group
        query: {
          email: parseAsString,
        },
        children: [page("sign-in"), page("sign-up")],
      }),
      layout("orders", {
        // [path] notation is a dynamic route, automatically inferred as string
        children: [page("[orderId]", { children: [page("tracking-details")] })],
      }),
      // Use a page + children when you have both a layout and a page on a route
      page("items", {
        query: {
          // These are only available on the /items page and will not be shared with children
          page: {
            sortOn: parseAsStringEnum(["name", "price"]),
            sortOrder: parseAsStringEnum(["asc", "desc"]),
          },
          // These would be available on /items and all children of /items
          layout: {},
        },
        // dynamic routes can optionally define a StandardSchema
        children: [page("[itemId]", { params: z.uuid() })],
      }),
    ],
  })
);

// /sign-in?email=test@test.com (with URI encoding)
router.route("/sign-in", {}, { email: "test@test.com" });

// Type error: not a valid route. Should be /sign-up
router.route("signUp", {}, { email: "test@test.com" });

// Type error: missing param itemId
router.route("/items/[itemId]", {}, {});

// Runtime error: not a valid UUID
router.route("/items/[itemId]", { itemId: "123" }, {});
```
