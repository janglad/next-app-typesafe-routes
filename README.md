Simple type safe routing for Next.js app router

## Todo

### Bugs

### Features

- [ ] Implement `useParams`
- [ ] Look into parallel/intercepting routes
- [ ] Think about API of passing info (one big object, optional stuff etc)
- [ ] Fast pass for ZOD? (look into handling it as an optional peer dep)
- [ ] Support symmetric parsing of params

### Testing

- [ ] Runtime performance tests

## Example

![Example](./README-assets//autocomplete.webp)

```tsx
const routes = new Routes(
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
routes.href("/(auth)/sign-in", {}, { email: "test@test.com" });

// Type error: not a valid route. Should be /sign-in
routes.href("/(auth)/signIn", {}, { email: "test@test.com" });

// throws validation error: missing param itemId
routes.href("/items/[itemId]", {}, {});

// Runtime error: not a valid UUID
routes.href("/items/[itemId]", { itemId: "123" }, {});
// All methods that can throw also have a safe version that returns a Result type
routes.hrefSafe("/items/[itemId]", { itemId: "123" }, {});

export default routes.implementPage("/(auth)/sign-in", async (props) => {
  const { query } = await props.parse();
  return <div>{query.email}</div>;
});

// Only available in client components
const [query, setQuery] = routes.useLayoutQuery("/(auth)");

const selectedLayoutSegment = routes.useSelectedLayoutSegment("/(auth)");
// "sign-in" | "sign-up"
```
