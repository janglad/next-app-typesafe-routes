import type { StandardSchemaV1 } from "@standard-schema/spec";
import { parseAsString, type ParserBuilder } from "nuqs";
import { describe, expectTypeOf, it } from "vitest";
import z from "zod";
import { page, type GetRouteSchema } from "./router/client.js";

const BrandedString = z.string().brand("BrandedString");
// Needed to get __exact__ type match. This is what it turns into due to StandardSchemaV1 I think?
type BrandedString = z.z.core.$ZodBranded<z.ZodString, "BrandedString">;

const routes = page("", {
  children: [
    page("staticNoChildren"),
    page("staticNoChildrenWithPLQuery", {
      query: {
        page: {
          pageParam: parseAsString,
        },
        layout: {
          layoutParam: parseAsString,
        },
      },
    }),
    page("[dynamicNoValidation]"),
    page("[dynamicValidation]", {
      params: BrandedString,
    }),
    page("[...catchAllNoValidation]"),
    page("[...catchAllValidation]", {
      params: BrandedString.array(),
    }),
    page("[[...optionalCatchAllNoValidation]]"),
    page("[[...optionalCatchAllValidation]]", {
      params: BrandedString.array().optional(),
    }),
  ],
});

describe("routes", () => {
  describe("GetRouteSchema", () => {
    it("Should return the correct schema for pages", () => {
      expectTypeOf<GetRouteSchema<"/", typeof routes>>().toEqualTypeOf<{
        type: "page";
        params: Record<string, never>;
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/staticNoChildren", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: Record<string, never>;
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/staticNoChildrenWithPLQuery", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: Record<string, never>;
        query: {
          page: {
            readonly pageParam: ParserBuilder<string>;
            readonly layoutParam: ParserBuilder<string>;
          };
          layout: {
            readonly layoutParam: ParserBuilder<string>;
          };
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/[dynamicNoValidation]", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: {
          readonly dynamicNoValidation: StandardSchemaV1<string>;
        };
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/[dynamicValidation]", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: {
          readonly dynamicValidation: BrandedString;
        };
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/[...catchAllNoValidation]", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: {
          readonly catchAllNoValidation: StandardSchemaV1<string[]>;
        };
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/[...catchAllValidation]", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: {
          readonly catchAllValidation: z.ZodArray<BrandedString>;
        };
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/[[...optionalCatchAllNoValidation]]", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: {
          readonly optionalCatchAllNoValidation: StandardSchemaV1<
            string[] | undefined
          >;
        };
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();

      expectTypeOf<
        GetRouteSchema<"/[[...optionalCatchAllValidation]]", typeof routes>
      >().toEqualTypeOf<{
        type: "page";
        params: {
          readonly optionalCatchAllValidation: z.ZodOptional<
            z.ZodArray<BrandedString>
          >;
        };
        query: {
          page: Record<string, never>;
          layout: Record<string, never>;
        };
      }>();
    });
  });
});
