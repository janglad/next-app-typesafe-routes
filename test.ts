import { getRoute, layout, page } from "./routing.js";
import * as z from "zod";
import type { StandardSchemaV1 } from "@standard-schema/spec";

const test = layout({
  path: "[id]",
  params: z.string().brand("id"),
  children: [
    page({ path: "somepage", params: undefined }),
    page({ path: "about", params: undefined }),
    page({ path: "contact", params: undefined }),
    page({ path: "products", params: undefined }),
    page({ path: "services", params: undefined }),
    page({ path: "team", params: undefined }),
    page({ path: "careers", params: undefined }),
    page({ path: "faq", params: undefined }),
    layout({
      path: "[user]",
      params: z.string().brand("user"),
      children: [
        page({ path: "user", params: undefined }),
        page({ path: "profile", params: undefined }),
        page({ path: "settings", params: undefined }),
        page({ path: "orders", params: undefined }),
        page({ path: "wishlist", params: undefined }),
        page({ path: "reviews", params: undefined }),
        page({ path: "notifications", params: undefined }),
        layout({
          path: "[orderId]",
          params: z.string().brand("orderId"),
          children: [
            page({ path: "details", params: undefined }),
            page({ path: "tracking", params: undefined }),
            page({ path: "invoice", params: undefined }),
            page({ path: "return", params: undefined }),
            layout({
              path: "[refundId]",
              params: z.string().brand("refundId"),
              children: [
                page({ path: "status", params: undefined }),
                page({ path: "documents", params: undefined }),
                layout({
                  path: "[documentId]",
                  params: z.string().brand("documentId"),
                  children: [
                    page({ path: "view", params: undefined }),
                    page({ path: "download", params: undefined }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    layout({
      path: "[category]",
      params: z.string().brand("category"),
      children: [
        page({ path: "list", params: undefined }),
        page({ path: "featured", params: undefined }),
        page({ path: "new", params: undefined }),
        page({ path: "sale", params: undefined }),
        page({ path: "bestsellers", params: undefined }),
        layout({
          path: "[subcategory]",
          params: z.string().brand("subcategory"),
          children: [
            page({ path: "items", params: undefined }),
            page({ path: "popular", params: undefined }),
            page({ path: "trending", params: undefined }),
            page({ path: "recommended", params: undefined }),
            layout({
              path: "[itemId]",
              params: z.string().brand("itemId"),
              children: [
                page({ path: "details", params: undefined }),
                page({ path: "reviews", params: undefined }),
                page({ path: "related", params: undefined }),
                layout({
                  path: "[variantId]",
                  params: z.string().brand("variantId"),
                  children: [
                    page({ path: "specs", params: undefined }),
                    page({ path: "stock", params: undefined }),
                    layout({
                      path: "[locationId]",
                      params: z.string().brand("locationId"),
                      children: [
                        page({ path: "availability", params: undefined }),
                        page({ path: "reserve", params: undefined }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    layout({
      path: "[blogId]",
      params: z.string().brand("blogId"),
      children: [
        page({ path: "post", params: undefined }),
        page({ path: "comments", params: undefined }),
        page({ path: "related", params: undefined }),
        page({ path: "author", params: undefined }),
        page({ path: "share", params: undefined }),
        layout({
          path: "[commentId]",
          params: z.string().brand("commentId"),
          children: [
            page({ path: "replies", params: undefined }),
            page({ path: "report", params: undefined }),
            layout({
              path: "[replyId]",
              params: z.string().brand("replyId"),
              children: [
                page({ path: "edit", params: undefined }),
                page({ path: "delete", params: undefined }),
                layout({
                  path: "[historyId]",
                  params: z.string().brand("historyId"),
                  children: [
                    page({ path: "version", params: undefined }),
                    page({ path: "restore", params: undefined }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    layout({
      path: "[eventId]",
      params: z.string().brand("eventId"),
      children: [
        page({ path: "details", params: undefined }),
        page({ path: "register", params: undefined }),
        page({ path: "schedule", params: undefined }),
        page({ path: "speakers", params: undefined }),
        page({ path: "venue", params: undefined }),
        layout({
          path: "[sessionId]",
          params: z.string().brand("sessionId"),
          children: [
            page({ path: "info", params: undefined }),
            page({ path: "join", params: undefined }),
            layout({
              path: "[presentationId]",
              params: z.string().brand("presentationId"),
              children: [
                page({ path: "slides", params: undefined }),
                page({ path: "resources", params: undefined }),
                layout({
                  path: "[resourceId]",
                  params: z.string().brand("resourceId"),
                  children: [
                    page({ path: "preview", params: undefined }),
                    page({ path: "download", params: undefined }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

const route = getRoute(test);

const res = route("/[id]/[user]/[orderId]/[refundId]/documents", {
  id: "1",
  user: "2",
  orderId: "3",
  refundId: "4",
});

console.log(res);
