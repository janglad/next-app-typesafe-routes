import { describe, expect, it } from "vitest";
import { layout, page, Router } from "./routing.js";

describe("Router", () => {
  describe("route", () => {
    it("should return the correct data for a static route", (args) => {
      const routes = page({
        path: "",
        params: undefined,
        children: [
          page({
            path: "home",
            params: undefined,
          }),
        ],
      });
      const router = new Router(routes);
      const route = router.route("/home", {});
      args.annotate(JSON.stringify({ route, routes }, null, 2));
      expect(route.data).toEqual("/home");
    });
  });
});
