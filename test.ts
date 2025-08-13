import { parseAsString, useQueryStates } from "nuqs";
import * as z from "zod";
import {
  group,
  layout,
  page,
  Routes,
  type RouteAtPath,
  type GetRouteSchema,
  type LazyAllPaths,
  type RouteBase,
  type AbsorbUndefined,
  type RouteRepresentation,
  type RouteType,
  type LayoutSegments,
} from "./src/router/client.js";

export const routes = page("", {
  children: [
    page("[id]", {
      params: z.string().brand("id"),
      query: {
        page: {
          idPageQuery: parseAsString,
        },
        layout: {
          idLayoutQuery: parseAsString,
        },
      },
      children: [
        page("somepage"),
        page("about"),
        page("contact"),
        page("products"),
        page("services"),
        page("team"),
        page("careers"),
        page("faq"),
        page("privacy"),
        page("terms"),
        page("support"),
        page("documentation"),
        page("api"),
        page("changelog"),
        page("status"),
        page("blog"),
        page("news"),
        page("press"),
        page("investors"),
        page("legal"),

        // User management section
        layout("[user]", {
          params: z.string().brand("user"),
          children: [
            page("user"),
            page("profile"),
            page("settings"),
            page("orders"),
            page("wishlist"),
            page("reviews"),
            page("notifications"),
            page("subscriptions"),
            page("billing"),
            page("security"),
            page("preferences"),
            page("activity"),
            page("followers"),
            page("following"),
            page("achievements"),

            // Orders nested deeply
            layout("[orderId]", {
              params: z.string().brand("orderId"),
              children: [
                page("details"),
                page("tracking"),
                page("invoice"),
                page("return"),
                page("exchange"),
                page("cancel"),
                page("modify"),
                page("shipping"),
                page("payment"),
                page("history"),

                // Refunds with complex nesting
                layout("[refundId]", {
                  params: z.string().brand("refundId"),
                  children: [
                    page("status"),
                    page("documents"),
                    page("timeline"),
                    page("communication"),
                    page("dispute"),

                    // Documents with deep nesting
                    layout("[documentId]", {
                      params: z.string().brand("documentId"),
                      children: [
                        page("view"),
                        page("download"),
                        page("share"),
                        page("edit"),
                        page("versions"),
                        page("comments"),
                        page("annotations"),

                        // Versions with even deeper nesting
                        layout("[versionId]", {
                          params: z.string().brand("versionId"),
                          children: [
                            page("compare"),
                            page("restore"),
                            page("diff"),
                            page("metadata"),

                            // Approval workflow
                            layout("[approvalId]", {
                              params: z.string().brand("approvalId"),
                              children: [
                                page("request"),
                                page("approve"),
                                page("reject"),
                                page("delegate"),

                                // Approval history
                                layout("[historyId]", {
                                  params: z.string().brand("historyId"),
                                  children: [
                                    page("entry"),
                                    page("audit"),
                                    page("export"),
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

                // Order items
                layout("[itemId]", {
                  params: z.string().brand("itemId"),
                  children: [
                    page("details"),
                    page("warranty"),
                    page("manual"),
                    page("support"),
                    page("accessories"),

                    // Item tracking
                    layout("[trackingId]", {
                      params: z.string().brand("trackingId"),
                      children: [
                        page("location"),
                        page("updates"),
                        page("delivery"),
                        page("signature"),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Social features
            layout("[socialId]", {
              params: z.string().brand("socialId"),
              children: [
                page("profile"),
                page("posts"),
                page("photos"),
                page("videos"),
                page("friends"),
                page("groups"),
                page("events"),
                page("messages"),

                // Posts with deep nesting
                layout("[postId]", {
                  params: z.string().brand("postId"),
                  children: [
                    page("view"),
                    page("edit"),
                    page("comments"),
                    page("likes"),
                    page("shares"),
                    page("analytics"),

                    // Comments system
                    layout("[commentId]", {
                      params: z.string().brand("commentId"),
                      children: [
                        page("reply"),
                        page("edit"),
                        page("delete"),
                        page("report"),
                        page("reactions"),

                        // Nested replies
                        layout("[replyId]", {
                          params: z.string().brand("replyId"),
                          children: [
                            page("view"),
                            page("edit"),
                            page("delete"),
                            page("report"),

                            // Reply threads
                            layout("[threadId]", {
                              params: z.string().brand("threadId"),
                              children: [
                                page("continue"),
                                page("collapse"),
                                page("moderate"),
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
          ],
        }),

        // Massive product catalog section
        layout("[category]", {
          params: z.string().brand("category"),
          children: [
            page("list"),
            page("featured"),
            page("new"),
            page("sale"),
            page("bestsellers"),
            page("trending"),
            page("recommended"),
            page("clearance"),
            page("premium"),
            page("exclusive"),
            page("seasonal"),
            page("limited"),
            page("bundles"),
            page("gifts"),
            page("compare"),

            // Subcategories with massive nesting
            layout("[subcategory]", {
              params: z.string().brand("subcategory"),
              children: [
                page("items"),
                page("popular"),
                page("trending"),
                page("recommended"),
                page("reviews"),
                page("guides"),
                page("tutorials"),
                page("comparisons"),
                page("specifications"),
                page("compatibility"),
                page("accessories"),
                page("warranty"),
                page("support"),
                page("documentation"),
                page("downloads"),

                // Individual items with complex structure
                layout("[itemId]", {
                  params: z.string().brand("itemId"),
                  children: [
                    page("details"),
                    page("reviews"),
                    page("related"),
                    page("specifications"),
                    page("gallery"),
                    page("videos"),
                    page("manual"),
                    page("warranty"),
                    page("support"),
                    page("faq"),
                    page("compatibility"),
                    page("accessories"),
                    page("bundles"),
                    page("alternatives"),
                    page("history"),

                    // Product variants with deep nesting
                    layout("[variantId]", {
                      params: z.string().brand("variantId"),
                      children: [
                        page("specs"),
                        page("stock"),
                        page("pricing"),
                        page("images"),
                        page("videos"),
                        page("360view"),
                        page("ar"),
                        page("customization"),
                        page("personalization"),
                        page("engraving"),
                        page("packaging"),
                        page("shipping"),
                        page("delivery"),
                        page("installation"),
                        page("setup"),

                        // Location-based availability
                        layout("[locationId]", {
                          params: z.string().brand("locationId"),
                          children: [
                            page("availability"),
                            page("reserve"),
                            page("pickup"),
                            page("delivery"),
                            page("installation"),
                            page("demo"),
                            page("trial"),
                            page("rental"),
                            page("lease"),
                            page("financing"),

                            // Store services
                            layout("[serviceId]", {
                              params: z.string().brand("serviceId"),
                              children: [
                                page("book"),
                                page("schedule"),
                                page("cancel"),
                                page("reschedule"),
                                page("status"),
                                page("feedback"),

                                // Service appointments
                                layout("[appointmentId]", {
                                  params: z.string().brand("appointmentId"),
                                  children: [
                                    page("details"),
                                    page("confirm"),
                                    page("modify"),
                                    page("cancel"),
                                    page("checkin"),
                                    page("complete"),
                                    page("invoice"),
                                    page("receipt"),
                                    page("warranty"),
                                    page("followup"),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),

                        // Customization options
                        layout("[customizationId]", {
                          params: z.string().brand("customizationId"),
                          children: [
                            page("options"),
                            page("preview"),
                            page("price"),
                            page("timeline"),
                            page("approval"),
                            page("production"),
                            page("quality"),
                            page("shipping"),

                            // Custom features
                            layout("[featureId]", {
                              params: z.string().brand("featureId"),
                              children: [
                                page("configure"),
                                page("validate"),
                                page("simulate"),
                                page("test"),
                                page("optimize"),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),

                    // Product reviews system
                    layout("[reviewId]", {
                      params: z.string().brand("reviewId"),
                      children: [
                        page("view"),
                        page("verify"),
                        page("helpful"),
                        page("report"),
                        page("respond"),
                        page("photos"),
                        page("videos"),

                        // Review responses
                        layout("[responseId]", {
                          params: z.string().brand("responseId"),
                          children: [
                            page("view"),
                            page("edit"),
                            page("delete"),
                            page("escalate"),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),

                // Brand pages within subcategories
                layout("[brandId]", {
                  params: z.string().brand("brandId"),
                  children: [
                    page("about"),
                    page("products"),
                    page("story"),
                    page("sustainability"),
                    page("innovation"),
                    page("awards"),
                    page("partnerships"),
                    page("careers"),
                    page("press"),
                    page("contact"),

                    // Brand collections
                    layout("[collectionId]", {
                      params: z.string().brand("collectionId"),
                      children: [
                        page("overview"),
                        page("products"),
                        page("inspiration"),
                        page("lookbook"),
                        page("styling"),
                        page("campaign"),

                        // Collection seasons
                        layout("[seasonId]", {
                          params: z.string().brand("seasonId"),
                          children: [
                            page("trends"),
                            page("forecast"),
                            page("colors"),
                            page("materials"),
                            page("sustainability"),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Category filters and search
            layout("[filterId]", {
              params: z.string().brand("filterId"),
              children: [
                page("apply"),
                page("save"),
                page("share"),
                page("reset"),
                page("advanced"),

                // Filter combinations
                layout("[combinationId]", {
                  params: z.string().brand("combinationId"),
                  children: [
                    page("results"),
                    page("refine"),
                    page("export"),
                    page("alert"),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Blog and content section
        layout("[blogId]", {
          params: z.string().brand("blogId"),
          children: [
            page("post"),
            page("comments"),
            page("related"),
            page("author"),
            page("share"),
            page("analytics"),
            page("edit"),
            page("draft"),
            page("preview"),
            page("publish"),
            page("schedule"),
            page("archive"),
            page("seo"),
            page("tags"),
            page("categories"),

            // Blog comments with threading
            layout("[commentId]", {
              params: z.string().brand("commentId"),
              children: [
                page("replies"),
                page("report"),
                page("moderate"),
                page("approve"),
                page("spam"),
                page("delete"),
                page("edit"),
                page("pin"),
                page("highlight"),
                page("feature"),

                // Nested comment replies
                layout("[replyId]", {
                  params: z.string().brand("replyId"),
                  children: [
                    page("edit"),
                    page("delete"),
                    page("report"),
                    page("approve"),
                    page("like"),
                    page("dislike"),
                    page("flag"),
                    page("block"),

                    // Comment history and moderation
                    layout("[historyId]", {
                      params: z.string().brand("historyId"),
                      children: [
                        page("version"),
                        page("restore"),
                        page("compare"),
                        page("audit"),
                        page("log"),

                        // Moderation actions
                        layout("[actionId]", {
                          params: z.string().brand("actionId"),
                          children: [
                            page("execute"),
                            page("undo"),
                            page("appeal"),
                            page("escalate"),
                            page("review"),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Blog series and collections
            layout("[seriesId]", {
              params: z.string().brand("seriesId"),
              children: [
                page("overview"),
                page("posts"),
                page("order"),
                page("progress"),
                page("bookmark"),
                page("subscribe"),
                page("download"),
                page("print"),

                // Series chapters
                layout("[chapterId]", {
                  params: z.string().brand("chapterId"),
                  children: [
                    page("read"),
                    page("notes"),
                    page("highlights"),
                    page("quiz"),
                    page("discussion"),
                    page("resources"),

                    // Chapter sections
                    layout("[sectionId]", {
                      params: z.string().brand("sectionId"),
                      children: [
                        page("content"),
                        page("exercises"),
                        page("solutions"),
                        page("feedback"),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Event management system
        layout("[eventId]", {
          params: z.string().brand("eventId"),
          children: [
            page("details"),
            page("register"),
            page("schedule"),
            page("speakers"),
            page("venue"),
            page("tickets"),
            page("pricing"),
            page("sponsors"),
            page("partners"),
            page("media"),
            page("press"),
            page("livestream"),
            page("recordings"),
            page("feedback"),
            page("analytics"),

            // Event sessions
            layout("[sessionId]", {
              params: z.string().brand("sessionId"),
              children: [
                page("info"),
                page("join"),
                page("materials"),
                page("transcript"),
                page("recording"),
                page("chat"),
                page("qa"),
                page("polls"),
                page("feedback"),
                page("notes"),
                page("bookmarks"),
                page("certificates"),
                page("credits"),
                page("networking"),
                page("followup"),

                // Session presentations
                layout("[presentationId]", {
                  params: z.string().brand("presentationId"),
                  children: [
                    page("slides"),
                    page("resources"),
                    page("downloads"),
                    page("references"),
                    page("code"),
                    page("demos"),
                    page("interactive"),
                    page("workshop"),
                    page("handson"),
                    page("assignments"),
                    page("projects"),
                    page("collaboration"),
                    page("discussion"),
                    page("feedback"),
                    page("ratings"),

                    // Presentation resources
                    layout("[resourceId]", {
                      params: z.string().brand("resourceId"),
                      children: [
                        page("preview"),
                        page("download"),
                        page("share"),
                        page("bookmark"),
                        page("annotate"),
                        page("translate"),
                        page("convert"),
                        page("embed"),
                        page("api"),
                        page("integration"),

                        // Resource versions and history
                        layout("[versionId]", {
                          params: z.string().brand("versionId"),
                          children: [
                            page("view"),
                            page("compare"),
                            page("restore"),
                            page("changelog"),
                            page("diff"),
                            page("merge"),
                            page("branch"),

                            // Version metadata and tracking
                            layout("[metadataId]", {
                              params: z.string().brand("metadataId"),
                              children: [
                                page("details"),
                                page("properties"),
                                page("tags"),
                                page("permissions"),
                                page("access"),
                                page("usage"),
                                page("analytics"),
                                page("reports"),
                                page("export"),
                                page("backup"),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),

                // Session attendees and networking
                layout("[attendeeId]", {
                  params: z.string().brand("attendeeId"),
                  children: [
                    page("profile"),
                    page("connect"),
                    page("message"),
                    page("schedule"),
                    page("meetings"),
                    page("interests"),
                    page("expertise"),
                    page("recommendations"),

                    // Networking connections
                    layout("[connectionId]", {
                      params: z.string().brand("connectionId"),
                      children: [
                        page("chat"),
                        page("video"),
                        page("calendar"),
                        page("collaboration"),
                        page("projects"),
                        page("follow"),

                        // Collaboration spaces
                        layout("[workspaceId]", {
                          params: z.string().brand("workspaceId"),
                          children: [
                            page("dashboard"),
                            page("files"),
                            page("discussions"),
                            page("tasks"),
                            page("calendar"),
                            page("video"),
                            page("whiteboard"),
                            page("notes"),
                            page("archive"),
                            page("settings"),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Event exhibitors and sponsors
            layout("[exhibitorId]", {
              params: z.string().brand("exhibitorId"),
              children: [
                page("booth"),
                page("products"),
                page("demos"),
                page("presentations"),
                page("meetings"),
                page("brochures"),
                page("contact"),
                page("leads"),
                page("analytics"),
                page("followup"),

                // Exhibitor activities
                layout("[activityId]", {
                  params: z.string().brand("activityId"),
                  children: [
                    page("schedule"),
                    page("register"),
                    page("attend"),
                    page("materials"),
                    page("feedback"),
                    page("certificate"),

                    // Activity participants
                    layout("[participantId]", {
                      params: z.string().brand("participantId"),
                      children: [
                        page("progress"),
                        page("completion"),
                        page("results"),
                        page("recognition"),
                        page("badge"),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Learning management system
        layout("[courseId]", {
          params: z.string().brand("courseId"),
          children: [
            page("overview"),
            page("curriculum"),
            page("prerequisites"),
            page("enrollment"),
            page("pricing"),
            page("instructors"),
            page("reviews"),
            page("faq"),
            page("certificate"),
            page("community"),
            page("support"),
            page("resources"),
            page("downloads"),
            page("projects"),
            page("portfolio"),

            // Course modules
            layout("[moduleId]", {
              params: z.string().brand("moduleId"),
              children: [
                page("content"),
                page("video"),
                page("transcript"),
                page("notes"),
                page("quiz"),
                page("assignment"),
                page("discussion"),
                page("resources"),
                page("progress"),
                page("completion"),
                page("certificate"),
                page("badge"),

                // Module lessons
                layout("[lessonId]", {
                  params: z.string().brand("lessonId"),
                  children: [
                    page("watch"),
                    page("read"),
                    page("practice"),
                    page("exercise"),
                    page("solution"),
                    page("explanation"),
                    page("tips"),
                    page("troubleshooting"),
                    page("examples"),
                    page("case_studies"),
                    page("real_world"),
                    page("best_practices"),
                    page("common_mistakes"),
                    page("advanced"),
                    page("bonus"),

                    // Lesson components
                    layout("[componentId]", {
                      params: z.string().brand("componentId"),
                      children: [
                        page("interactive"),
                        page("simulation"),
                        page("lab"),
                        page("sandbox"),
                        page("experiment"),
                        page("test"),
                        page("validate"),
                        page("debug"),
                        page("optimize"),
                        page("deploy"),

                        // Component results and analytics
                        layout("[resultId]", {
                          params: z.string().brand("resultId"),
                          children: [
                            page("view"),
                            page("analyze"),
                            page("compare"),
                            page("improve"),
                            page("share"),
                            page("export"),
                            page("report"),
                            page("feedback"),
                            page("mentor"),
                            page("peer_review"),
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

        // Enterprise and admin section
        layout("[organizationId]", {
          params: z.string().brand("organizationId"),
          children: [
            page("dashboard"),
            page("overview"),
            page("analytics"),
            page("reports"),
            page("users"),
            page("teams"),
            page("departments"),
            page("roles"),
            page("permissions"),
            page("policies"),
            page("compliance"),
            page("audit"),
            page("security"),
            page("backup"),
            page("integration"),

            // Organization departments
            layout("[departmentId]", {
              params: z.string().brand("departmentId"),
              children: [
                page("overview"),
                page("members"),
                page("structure"),
                page("budget"),
                page("projects"),
                page("resources"),
                page("performance"),
                page("goals"),
                page("metrics"),
                page("reports"),
                page("meetings"),
                page("calendar"),
                page("documents"),
                page("policies"),
                page("training"),

                // Department teams
                layout("[teamId]", {
                  params: z.string().brand("teamId"),
                  children: [
                    page("members"),
                    page("lead"),
                    page("projects"),
                    page("tasks"),
                    page("sprints"),
                    page("backlog"),
                    page("kanban"),
                    page("timeline"),
                    page("milestones"),
                    page("deliverables"),
                    page("retrospectives"),
                    page("standup"),
                    page("velocity"),
                    page("burndown"),
                    page("capacity"),

                    // Team projects
                    layout("[projectId]", {
                      params: z.string().brand("projectId"),
                      children: [
                        page("overview"),
                        page("scope"),
                        page("requirements"),
                        page("specifications"),
                        page("design"),
                        page("architecture"),
                        page("development"),
                        page("testing"),
                        page("deployment"),
                        page("monitoring"),
                        page("maintenance"),
                        page("documentation"),
                        page("changelog"),
                        page("releases"),
                        page("roadmap"),

                        // Project phases
                        layout("[phaseId]", {
                          params: z.string().brand("phaseId"),
                          children: [
                            page("planning"),
                            page("execution"),
                            page("monitoring"),
                            page("review"),
                            page("closure"),
                            page("lessons"),
                            page("handover"),
                            page("support"),

                            // Phase deliverables
                            layout("[deliverableId]", {
                              params: z.string().brand("deliverableId"),
                              children: [
                                page("requirements"),
                                page("design"),
                                page("implementation"),
                                page("testing"),
                                page("review"),
                                page("approval"),
                                page("delivery"),
                                page("acceptance"),
                                page("feedback"),
                                page("iterations"),

                                // Deliverable components
                                layout("[componentId]", {
                                  params: z.string().brand("componentId"),
                                  children: [
                                    page("specification"),
                                    page("development"),
                                    page("unit_tests"),
                                    page("integration"),
                                    page("performance"),
                                    page("security"),
                                    page("documentation"),
                                    page("deployment"),
                                    page("monitoring"),
                                    page("maintenance"),
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
              ],
            }),
          ],
        }),
        page("[settings]", { params: z.string().brand("settings") }),
      ],
    }),
  ],
});

type NotHello<T extends string> = T extends "hello" ? never : T;

declare const test:
  | ["hi", ...[NotHello<string>, ...string[]]]
  | ["hi", "hello"]
  | ["hi", "hello", "world"]
  | ["hello"];

if (test[0] === "hello") {
  test;
  // ^?
}

if (test[1] === "hello") {
  test;
  //  ["hi", string, ...string[]] | ["hi", "hello"] | ["hi", "hello", "world"] | ["hello"]
  // ^?
}
if (test[2] === "world") {
  test;
  // ^?
}

const UserId = z.string().brand("userId");
type UserId = z.infer<typeof UserId>;

const testRouter = new Routes(
  page("", {
    children: [
      page("hello", {
        children: [
          page("world"),
          page("nested", {
            children: [page("world"), page("[...id]")],
          }),
          page("[userId]", { params: UserId }),
        ],
      }),
    ],
  })
);
