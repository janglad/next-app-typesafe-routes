import * as z from "zod";
import {
  getRoute,
  layout,
  page,
  Router,
  type AllPaths,
} from "./src/routing.js";

const routes = layout({
  path: "",
  params: undefined,
  children: [
    layout({
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
        page({ path: "privacy", params: undefined }),
        page({ path: "terms", params: undefined }),
        page({ path: "support", params: undefined }),
        page({ path: "documentation", params: undefined }),
        page({ path: "api", params: undefined }),
        page({ path: "changelog", params: undefined }),
        page({ path: "status", params: undefined }),
        page({ path: "blog", params: undefined }),
        page({ path: "news", params: undefined }),
        page({ path: "press", params: undefined }),
        page({ path: "investors", params: undefined }),
        page({ path: "legal", params: undefined }),

        // User management section
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
            page({ path: "subscriptions", params: undefined }),
            page({ path: "billing", params: undefined }),
            page({ path: "security", params: undefined }),
            page({ path: "preferences", params: undefined }),
            page({ path: "activity", params: undefined }),
            page({ path: "followers", params: undefined }),
            page({ path: "following", params: undefined }),
            page({ path: "achievements", params: undefined }),

            // Orders nested deeply
            layout({
              path: "[orderId]",
              params: z.string().brand("orderId"),
              children: [
                page({ path: "details", params: undefined }),
                page({ path: "tracking", params: undefined }),
                page({ path: "invoice", params: undefined }),
                page({ path: "return", params: undefined }),
                page({ path: "exchange", params: undefined }),
                page({ path: "cancel", params: undefined }),
                page({ path: "modify", params: undefined }),
                page({ path: "shipping", params: undefined }),
                page({ path: "payment", params: undefined }),
                page({ path: "history", params: undefined }),

                // Refunds with complex nesting
                layout({
                  path: "[refundId]",
                  params: z.string().brand("refundId"),
                  children: [
                    page({ path: "status", params: undefined }),
                    page({ path: "documents", params: undefined }),
                    page({ path: "timeline", params: undefined }),
                    page({ path: "communication", params: undefined }),
                    page({ path: "dispute", params: undefined }),

                    // Documents with deep nesting
                    layout({
                      path: "[documentId]",
                      params: z.string().brand("documentId"),
                      children: [
                        page({ path: "view", params: undefined }),
                        page({ path: "download", params: undefined }),
                        page({ path: "share", params: undefined }),
                        page({ path: "edit", params: undefined }),
                        page({ path: "versions", params: undefined }),
                        page({ path: "comments", params: undefined }),
                        page({ path: "annotations", params: undefined }),

                        // Versions with even deeper nesting
                        layout({
                          path: "[versionId]",
                          params: z.string().brand("versionId"),
                          children: [
                            page({ path: "compare", params: undefined }),
                            page({ path: "restore", params: undefined }),
                            page({ path: "diff", params: undefined }),
                            page({ path: "metadata", params: undefined }),

                            // Approval workflow
                            layout({
                              path: "[approvalId]",
                              params: z.string().brand("approvalId"),
                              children: [
                                page({ path: "request", params: undefined }),
                                page({ path: "approve", params: undefined }),
                                page({ path: "reject", params: undefined }),
                                page({ path: "delegate", params: undefined }),

                                // Approval history
                                layout({
                                  path: "[historyId]",
                                  params: z.string().brand("historyId"),
                                  children: [
                                    page({ path: "entry", params: undefined }),
                                    page({ path: "audit", params: undefined }),
                                    page({ path: "export", params: undefined }),
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
                layout({
                  path: "[itemId]",
                  params: z.string().brand("itemId"),
                  children: [
                    page({ path: "details", params: undefined }),
                    page({ path: "warranty", params: undefined }),
                    page({ path: "manual", params: undefined }),
                    page({ path: "support", params: undefined }),
                    page({ path: "accessories", params: undefined }),

                    // Item tracking
                    layout({
                      path: "[trackingId]",
                      params: z.string().brand("trackingId"),
                      children: [
                        page({ path: "location", params: undefined }),
                        page({ path: "updates", params: undefined }),
                        page({ path: "delivery", params: undefined }),
                        page({ path: "signature", params: undefined }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Social features
            layout({
              path: "[socialId]",
              params: z.string().brand("socialId"),
              children: [
                page({ path: "profile", params: undefined }),
                page({ path: "posts", params: undefined }),
                page({ path: "photos", params: undefined }),
                page({ path: "videos", params: undefined }),
                page({ path: "friends", params: undefined }),
                page({ path: "groups", params: undefined }),
                page({ path: "events", params: undefined }),
                page({ path: "messages", params: undefined }),

                // Posts with deep nesting
                layout({
                  path: "[postId]",
                  params: z.string().brand("postId"),
                  children: [
                    page({ path: "view", params: undefined }),
                    page({ path: "edit", params: undefined }),
                    page({ path: "comments", params: undefined }),
                    page({ path: "likes", params: undefined }),
                    page({ path: "shares", params: undefined }),
                    page({ path: "analytics", params: undefined }),

                    // Comments system
                    layout({
                      path: "[commentId]",
                      params: z.string().brand("commentId"),
                      children: [
                        page({ path: "reply", params: undefined }),
                        page({ path: "edit", params: undefined }),
                        page({ path: "delete", params: undefined }),
                        page({ path: "report", params: undefined }),
                        page({ path: "reactions", params: undefined }),

                        // Nested replies
                        layout({
                          path: "[replyId]",
                          params: z.string().brand("replyId"),
                          children: [
                            page({ path: "view", params: undefined }),
                            page({ path: "edit", params: undefined }),
                            page({ path: "delete", params: undefined }),
                            page({ path: "report", params: undefined }),

                            // Reply threads
                            layout({
                              path: "[threadId]",
                              params: z.string().brand("threadId"),
                              children: [
                                page({ path: "continue", params: undefined }),
                                page({ path: "collapse", params: undefined }),
                                page({ path: "moderate", params: undefined }),
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
        layout({
          path: "[category]",
          params: z.string().brand("category"),
          children: [
            page({ path: "list", params: undefined }),
            page({ path: "featured", params: undefined }),
            page({ path: "new", params: undefined }),
            page({ path: "sale", params: undefined }),
            page({ path: "bestsellers", params: undefined }),
            page({ path: "trending", params: undefined }),
            page({ path: "recommended", params: undefined }),
            page({ path: "clearance", params: undefined }),
            page({ path: "premium", params: undefined }),
            page({ path: "exclusive", params: undefined }),
            page({ path: "seasonal", params: undefined }),
            page({ path: "limited", params: undefined }),
            page({ path: "bundles", params: undefined }),
            page({ path: "gifts", params: undefined }),
            page({ path: "compare", params: undefined }),

            // Subcategories with massive nesting
            layout({
              path: "[subcategory]",
              params: z.string().brand("subcategory"),
              children: [
                page({ path: "items", params: undefined }),
                page({ path: "popular", params: undefined }),
                page({ path: "trending", params: undefined }),
                page({ path: "recommended", params: undefined }),
                page({ path: "reviews", params: undefined }),
                page({ path: "guides", params: undefined }),
                page({ path: "tutorials", params: undefined }),
                page({ path: "comparisons", params: undefined }),
                page({ path: "specifications", params: undefined }),
                page({ path: "compatibility", params: undefined }),
                page({ path: "accessories", params: undefined }),
                page({ path: "warranty", params: undefined }),
                page({ path: "support", params: undefined }),
                page({ path: "documentation", params: undefined }),
                page({ path: "downloads", params: undefined }),

                // Individual items with complex structure
                layout({
                  path: "[itemId]",
                  params: z.string().brand("itemId"),
                  children: [
                    page({ path: "details", params: undefined }),
                    page({ path: "reviews", params: undefined }),
                    page({ path: "related", params: undefined }),
                    page({ path: "specifications", params: undefined }),
                    page({ path: "gallery", params: undefined }),
                    page({ path: "videos", params: undefined }),
                    page({ path: "manual", params: undefined }),
                    page({ path: "warranty", params: undefined }),
                    page({ path: "support", params: undefined }),
                    page({ path: "faq", params: undefined }),
                    page({ path: "compatibility", params: undefined }),
                    page({ path: "accessories", params: undefined }),
                    page({ path: "bundles", params: undefined }),
                    page({ path: "alternatives", params: undefined }),
                    page({ path: "history", params: undefined }),

                    // Product variants with deep nesting
                    layout({
                      path: "[variantId]",
                      params: z.string().brand("variantId"),
                      children: [
                        page({ path: "specs", params: undefined }),
                        page({ path: "stock", params: undefined }),
                        page({ path: "pricing", params: undefined }),
                        page({ path: "images", params: undefined }),
                        page({ path: "videos", params: undefined }),
                        page({ path: "360view", params: undefined }),
                        page({ path: "ar", params: undefined }),
                        page({ path: "customization", params: undefined }),
                        page({ path: "personalization", params: undefined }),
                        page({ path: "engraving", params: undefined }),
                        page({ path: "packaging", params: undefined }),
                        page({ path: "shipping", params: undefined }),
                        page({ path: "delivery", params: undefined }),
                        page({ path: "installation", params: undefined }),
                        page({ path: "setup", params: undefined }),

                        // Location-based availability
                        layout({
                          path: "[locationId]",
                          params: z.string().brand("locationId"),
                          children: [
                            page({ path: "availability", params: undefined }),
                            page({ path: "reserve", params: undefined }),
                            page({ path: "pickup", params: undefined }),
                            page({ path: "delivery", params: undefined }),
                            page({ path: "installation", params: undefined }),
                            page({ path: "demo", params: undefined }),
                            page({ path: "trial", params: undefined }),
                            page({ path: "rental", params: undefined }),
                            page({ path: "lease", params: undefined }),
                            page({ path: "financing", params: undefined }),

                            // Store services
                            layout({
                              path: "[serviceId]",
                              params: z.string().brand("serviceId"),
                              children: [
                                page({ path: "book", params: undefined }),
                                page({ path: "schedule", params: undefined }),
                                page({ path: "cancel", params: undefined }),
                                page({ path: "reschedule", params: undefined }),
                                page({ path: "status", params: undefined }),
                                page({ path: "feedback", params: undefined }),

                                // Service appointments
                                layout({
                                  path: "[appointmentId]",
                                  params: z.string().brand("appointmentId"),
                                  children: [
                                    page({
                                      path: "details",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "confirm",
                                      params: undefined,
                                    }),
                                    page({ path: "modify", params: undefined }),
                                    page({ path: "cancel", params: undefined }),
                                    page({
                                      path: "checkin",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "complete",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "invoice",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "receipt",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "warranty",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "followup",
                                      params: undefined,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),

                        // Customization options
                        layout({
                          path: "[customizationId]",
                          params: z.string().brand("customizationId"),
                          children: [
                            page({ path: "options", params: undefined }),
                            page({ path: "preview", params: undefined }),
                            page({ path: "price", params: undefined }),
                            page({ path: "timeline", params: undefined }),
                            page({ path: "approval", params: undefined }),
                            page({ path: "production", params: undefined }),
                            page({ path: "quality", params: undefined }),
                            page({ path: "shipping", params: undefined }),

                            // Custom features
                            layout({
                              path: "[featureId]",
                              params: z.string().brand("featureId"),
                              children: [
                                page({ path: "configure", params: undefined }),
                                page({ path: "validate", params: undefined }),
                                page({ path: "simulate", params: undefined }),
                                page({ path: "test", params: undefined }),
                                page({ path: "optimize", params: undefined }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),

                    // Product reviews system
                    layout({
                      path: "[reviewId]",
                      params: z.string().brand("reviewId"),
                      children: [
                        page({ path: "view", params: undefined }),
                        page({ path: "verify", params: undefined }),
                        page({ path: "helpful", params: undefined }),
                        page({ path: "report", params: undefined }),
                        page({ path: "respond", params: undefined }),
                        page({ path: "photos", params: undefined }),
                        page({ path: "videos", params: undefined }),

                        // Review responses
                        layout({
                          path: "[responseId]",
                          params: z.string().brand("responseId"),
                          children: [
                            page({ path: "view", params: undefined }),
                            page({ path: "edit", params: undefined }),
                            page({ path: "delete", params: undefined }),
                            page({ path: "escalate", params: undefined }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),

                // Brand pages within subcategories
                layout({
                  path: "[brandId]",
                  params: z.string().brand("brandId"),
                  children: [
                    page({ path: "about", params: undefined }),
                    page({ path: "products", params: undefined }),
                    page({ path: "story", params: undefined }),
                    page({ path: "sustainability", params: undefined }),
                    page({ path: "innovation", params: undefined }),
                    page({ path: "awards", params: undefined }),
                    page({ path: "partnerships", params: undefined }),
                    page({ path: "careers", params: undefined }),
                    page({ path: "press", params: undefined }),
                    page({ path: "contact", params: undefined }),

                    // Brand collections
                    layout({
                      path: "[collectionId]",
                      params: z.string().brand("collectionId"),
                      children: [
                        page({ path: "overview", params: undefined }),
                        page({ path: "products", params: undefined }),
                        page({ path: "inspiration", params: undefined }),
                        page({ path: "lookbook", params: undefined }),
                        page({ path: "styling", params: undefined }),
                        page({ path: "campaign", params: undefined }),

                        // Collection seasons
                        layout({
                          path: "[seasonId]",
                          params: z.string().brand("seasonId"),
                          children: [
                            page({ path: "trends", params: undefined }),
                            page({ path: "forecast", params: undefined }),
                            page({ path: "colors", params: undefined }),
                            page({ path: "materials", params: undefined }),
                            page({ path: "sustainability", params: undefined }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Category filters and search
            layout({
              path: "[filterId]",
              params: z.string().brand("filterId"),
              children: [
                page({ path: "apply", params: undefined }),
                page({ path: "save", params: undefined }),
                page({ path: "share", params: undefined }),
                page({ path: "reset", params: undefined }),
                page({ path: "advanced", params: undefined }),

                // Filter combinations
                layout({
                  path: "[combinationId]",
                  params: z.string().brand("combinationId"),
                  children: [
                    page({ path: "results", params: undefined }),
                    page({ path: "refine", params: undefined }),
                    page({ path: "export", params: undefined }),
                    page({ path: "alert", params: undefined }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Blog and content section
        layout({
          path: "[blogId]",
          params: z.string().brand("blogId"),
          children: [
            page({ path: "post", params: undefined }),
            page({ path: "comments", params: undefined }),
            page({ path: "related", params: undefined }),
            page({ path: "author", params: undefined }),
            page({ path: "share", params: undefined }),
            page({ path: "analytics", params: undefined }),
            page({ path: "edit", params: undefined }),
            page({ path: "draft", params: undefined }),
            page({ path: "preview", params: undefined }),
            page({ path: "publish", params: undefined }),
            page({ path: "schedule", params: undefined }),
            page({ path: "archive", params: undefined }),
            page({ path: "seo", params: undefined }),
            page({ path: "tags", params: undefined }),
            page({ path: "categories", params: undefined }),

            // Blog comments with threading
            layout({
              path: "[commentId]",
              params: z.string().brand("commentId"),
              children: [
                page({ path: "replies", params: undefined }),
                page({ path: "report", params: undefined }),
                page({ path: "moderate", params: undefined }),
                page({ path: "approve", params: undefined }),
                page({ path: "spam", params: undefined }),
                page({ path: "delete", params: undefined }),
                page({ path: "edit", params: undefined }),
                page({ path: "pin", params: undefined }),
                page({ path: "highlight", params: undefined }),
                page({ path: "feature", params: undefined }),

                // Nested comment replies
                layout({
                  path: "[replyId]",
                  params: z.string().brand("replyId"),
                  children: [
                    page({ path: "edit", params: undefined }),
                    page({ path: "delete", params: undefined }),
                    page({ path: "report", params: undefined }),
                    page({ path: "approve", params: undefined }),
                    page({ path: "like", params: undefined }),
                    page({ path: "dislike", params: undefined }),
                    page({ path: "flag", params: undefined }),
                    page({ path: "block", params: undefined }),

                    // Comment history and moderation
                    layout({
                      path: "[historyId]",
                      params: z.string().brand("historyId"),
                      children: [
                        page({ path: "version", params: undefined }),
                        page({ path: "restore", params: undefined }),
                        page({ path: "compare", params: undefined }),
                        page({ path: "audit", params: undefined }),
                        page({ path: "log", params: undefined }),

                        // Moderation actions
                        layout({
                          path: "[actionId]",
                          params: z.string().brand("actionId"),
                          children: [
                            page({ path: "execute", params: undefined }),
                            page({ path: "undo", params: undefined }),
                            page({ path: "appeal", params: undefined }),
                            page({ path: "escalate", params: undefined }),
                            page({ path: "review", params: undefined }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Blog series and collections
            layout({
              path: "[seriesId]",
              params: z.string().brand("seriesId"),
              children: [
                page({ path: "overview", params: undefined }),
                page({ path: "posts", params: undefined }),
                page({ path: "order", params: undefined }),
                page({ path: "progress", params: undefined }),
                page({ path: "bookmark", params: undefined }),
                page({ path: "subscribe", params: undefined }),
                page({ path: "download", params: undefined }),
                page({ path: "print", params: undefined }),

                // Series chapters
                layout({
                  path: "[chapterId]",
                  params: z.string().brand("chapterId"),
                  children: [
                    page({ path: "read", params: undefined }),
                    page({ path: "notes", params: undefined }),
                    page({ path: "highlights", params: undefined }),
                    page({ path: "quiz", params: undefined }),
                    page({ path: "discussion", params: undefined }),
                    page({ path: "resources", params: undefined }),

                    // Chapter sections
                    layout({
                      path: "[sectionId]",
                      params: z.string().brand("sectionId"),
                      children: [
                        page({ path: "content", params: undefined }),
                        page({ path: "exercises", params: undefined }),
                        page({ path: "solutions", params: undefined }),
                        page({ path: "feedback", params: undefined }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Event management system
        layout({
          path: "[eventId]",
          params: z.string().brand("eventId"),
          children: [
            page({ path: "details", params: undefined }),
            page({ path: "register", params: undefined }),
            page({ path: "schedule", params: undefined }),
            page({ path: "speakers", params: undefined }),
            page({ path: "venue", params: undefined }),
            page({ path: "tickets", params: undefined }),
            page({ path: "pricing", params: undefined }),
            page({ path: "sponsors", params: undefined }),
            page({ path: "partners", params: undefined }),
            page({ path: "media", params: undefined }),
            page({ path: "press", params: undefined }),
            page({ path: "livestream", params: undefined }),
            page({ path: "recordings", params: undefined }),
            page({ path: "feedback", params: undefined }),
            page({ path: "analytics", params: undefined }),

            // Event sessions
            layout({
              path: "[sessionId]",
              params: z.string().brand("sessionId"),
              children: [
                page({ path: "info", params: undefined }),
                page({ path: "join", params: undefined }),
                page({ path: "materials", params: undefined }),
                page({ path: "transcript", params: undefined }),
                page({ path: "recording", params: undefined }),
                page({ path: "chat", params: undefined }),
                page({ path: "qa", params: undefined }),
                page({ path: "polls", params: undefined }),
                page({ path: "feedback", params: undefined }),
                page({ path: "notes", params: undefined }),
                page({ path: "bookmarks", params: undefined }),
                page({ path: "certificates", params: undefined }),
                page({ path: "credits", params: undefined }),
                page({ path: "networking", params: undefined }),
                page({ path: "followup", params: undefined }),

                // Session presentations
                layout({
                  path: "[presentationId]",
                  params: z.string().brand("presentationId"),
                  children: [
                    page({ path: "slides", params: undefined }),
                    page({ path: "resources", params: undefined }),
                    page({ path: "downloads", params: undefined }),
                    page({ path: "references", params: undefined }),
                    page({ path: "code", params: undefined }),
                    page({ path: "demos", params: undefined }),
                    page({ path: "interactive", params: undefined }),
                    page({ path: "workshop", params: undefined }),
                    page({ path: "handson", params: undefined }),
                    page({ path: "assignments", params: undefined }),
                    page({ path: "projects", params: undefined }),
                    page({ path: "collaboration", params: undefined }),
                    page({ path: "discussion", params: undefined }),
                    page({ path: "feedback", params: undefined }),
                    page({ path: "ratings", params: undefined }),

                    // Presentation resources
                    layout({
                      path: "[resourceId]",
                      params: z.string().brand("resourceId"),
                      children: [
                        page({ path: "preview", params: undefined }),
                        page({ path: "download", params: undefined }),
                        page({ path: "share", params: undefined }),
                        page({ path: "bookmark", params: undefined }),
                        page({ path: "annotate", params: undefined }),
                        page({ path: "translate", params: undefined }),
                        page({ path: "convert", params: undefined }),
                        page({ path: "embed", params: undefined }),
                        page({ path: "api", params: undefined }),
                        page({ path: "integration", params: undefined }),

                        // Resource versions and history
                        layout({
                          path: "[versionId]",
                          params: z.string().brand("versionId"),
                          children: [
                            page({ path: "view", params: undefined }),
                            page({ path: "compare", params: undefined }),
                            page({ path: "restore", params: undefined }),
                            page({ path: "changelog", params: undefined }),
                            page({ path: "diff", params: undefined }),
                            page({ path: "merge", params: undefined }),
                            page({ path: "branch", params: undefined }),

                            // Version metadata and tracking
                            layout({
                              path: "[metadataId]",
                              params: z.string().brand("metadataId"),
                              children: [
                                page({ path: "details", params: undefined }),
                                page({ path: "properties", params: undefined }),
                                page({ path: "tags", params: undefined }),
                                page({
                                  path: "permissions",
                                  params: undefined,
                                }),
                                page({ path: "access", params: undefined }),
                                page({ path: "usage", params: undefined }),
                                page({ path: "analytics", params: undefined }),
                                page({ path: "reports", params: undefined }),
                                page({ path: "export", params: undefined }),
                                page({ path: "backup", params: undefined }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),

                // Session attendees and networking
                layout({
                  path: "[attendeeId]",
                  params: z.string().brand("attendeeId"),
                  children: [
                    page({ path: "profile", params: undefined }),
                    page({ path: "connect", params: undefined }),
                    page({ path: "message", params: undefined }),
                    page({ path: "schedule", params: undefined }),
                    page({ path: "meetings", params: undefined }),
                    page({ path: "interests", params: undefined }),
                    page({ path: "expertise", params: undefined }),
                    page({ path: "recommendations", params: undefined }),

                    // Networking connections
                    layout({
                      path: "[connectionId]",
                      params: z.string().brand("connectionId"),
                      children: [
                        page({ path: "chat", params: undefined }),
                        page({ path: "video", params: undefined }),
                        page({ path: "calendar", params: undefined }),
                        page({ path: "collaboration", params: undefined }),
                        page({ path: "projects", params: undefined }),
                        page({ path: "follow", params: undefined }),

                        // Collaboration spaces
                        layout({
                          path: "[workspaceId]",
                          params: z.string().brand("workspaceId"),
                          children: [
                            page({ path: "dashboard", params: undefined }),
                            page({ path: "files", params: undefined }),
                            page({ path: "discussions", params: undefined }),
                            page({ path: "tasks", params: undefined }),
                            page({ path: "calendar", params: undefined }),
                            page({ path: "video", params: undefined }),
                            page({ path: "whiteboard", params: undefined }),
                            page({ path: "notes", params: undefined }),
                            page({ path: "archive", params: undefined }),
                            page({ path: "settings", params: undefined }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Event exhibitors and sponsors
            layout({
              path: "[exhibitorId]",
              params: z.string().brand("exhibitorId"),
              children: [
                page({ path: "booth", params: undefined }),
                page({ path: "products", params: undefined }),
                page({ path: "demos", params: undefined }),
                page({ path: "presentations", params: undefined }),
                page({ path: "meetings", params: undefined }),
                page({ path: "brochures", params: undefined }),
                page({ path: "contact", params: undefined }),
                page({ path: "leads", params: undefined }),
                page({ path: "analytics", params: undefined }),
                page({ path: "followup", params: undefined }),

                // Exhibitor activities
                layout({
                  path: "[activityId]",
                  params: z.string().brand("activityId"),
                  children: [
                    page({ path: "schedule", params: undefined }),
                    page({ path: "register", params: undefined }),
                    page({ path: "attend", params: undefined }),
                    page({ path: "materials", params: undefined }),
                    page({ path: "feedback", params: undefined }),
                    page({ path: "certificate", params: undefined }),

                    // Activity participants
                    layout({
                      path: "[participantId]",
                      params: z.string().brand("participantId"),
                      children: [
                        page({ path: "progress", params: undefined }),
                        page({ path: "completion", params: undefined }),
                        page({ path: "results", params: undefined }),
                        page({ path: "recognition", params: undefined }),
                        page({ path: "badge", params: undefined }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Learning management system
        layout({
          path: "[courseId]",
          params: z.string().brand("courseId"),
          children: [
            page({ path: "overview", params: undefined }),
            page({ path: "curriculum", params: undefined }),
            page({ path: "prerequisites", params: undefined }),
            page({ path: "enrollment", params: undefined }),
            page({ path: "pricing", params: undefined }),
            page({ path: "instructors", params: undefined }),
            page({ path: "reviews", params: undefined }),
            page({ path: "faq", params: undefined }),
            page({ path: "certificate", params: undefined }),
            page({ path: "community", params: undefined }),
            page({ path: "support", params: undefined }),
            page({ path: "resources", params: undefined }),
            page({ path: "downloads", params: undefined }),
            page({ path: "projects", params: undefined }),
            page({ path: "portfolio", params: undefined }),

            // Course modules
            layout({
              path: "[moduleId]",
              params: z.string().brand("moduleId"),
              children: [
                page({ path: "content", params: undefined }),
                page({ path: "video", params: undefined }),
                page({ path: "transcript", params: undefined }),
                page({ path: "notes", params: undefined }),
                page({ path: "quiz", params: undefined }),
                page({ path: "assignment", params: undefined }),
                page({ path: "discussion", params: undefined }),
                page({ path: "resources", params: undefined }),
                page({ path: "progress", params: undefined }),
                page({ path: "completion", params: undefined }),
                page({ path: "certificate", params: undefined }),
                page({ path: "badge", params: undefined }),

                // Module lessons
                layout({
                  path: "[lessonId]",
                  params: z.string().brand("lessonId"),
                  children: [
                    page({ path: "watch", params: undefined }),
                    page({ path: "read", params: undefined }),
                    page({ path: "practice", params: undefined }),
                    page({ path: "exercise", params: undefined }),
                    page({ path: "solution", params: undefined }),
                    page({ path: "explanation", params: undefined }),
                    page({ path: "tips", params: undefined }),
                    page({ path: "troubleshooting", params: undefined }),
                    page({ path: "examples", params: undefined }),
                    page({ path: "case_studies", params: undefined }),
                    page({ path: "real_world", params: undefined }),
                    page({ path: "best_practices", params: undefined }),
                    page({ path: "common_mistakes", params: undefined }),
                    page({ path: "advanced", params: undefined }),
                    page({ path: "bonus", params: undefined }),

                    // Lesson components
                    layout({
                      path: "[componentId]",
                      params: z.string().brand("componentId"),
                      children: [
                        page({ path: "interactive", params: undefined }),
                        page({ path: "simulation", params: undefined }),
                        page({ path: "lab", params: undefined }),
                        page({ path: "sandbox", params: undefined }),
                        page({ path: "experiment", params: undefined }),
                        page({ path: "test", params: undefined }),
                        page({ path: "validate", params: undefined }),
                        page({ path: "debug", params: undefined }),
                        page({ path: "optimize", params: undefined }),
                        page({ path: "deploy", params: undefined }),

                        // Component results and analytics
                        layout({
                          path: "[resultId]",
                          params: z.string().brand("resultId"),
                          children: [
                            page({ path: "view", params: undefined }),
                            page({ path: "analyze", params: undefined }),
                            page({ path: "compare", params: undefined }),
                            page({ path: "improve", params: undefined }),
                            page({ path: "share", params: undefined }),
                            page({ path: "export", params: undefined }),
                            page({ path: "report", params: undefined }),
                            page({ path: "feedback", params: undefined }),
                            page({ path: "mentor", params: undefined }),
                            page({ path: "peer_review", params: undefined }),
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
        layout({
          path: "[organizationId]",
          params: z.string().brand("organizationId"),
          children: [
            page({ path: "dashboard", params: undefined }),
            page({ path: "overview", params: undefined }),
            page({ path: "analytics", params: undefined }),
            page({ path: "reports", params: undefined }),
            page({ path: "users", params: undefined }),
            page({ path: "teams", params: undefined }),
            page({ path: "departments", params: undefined }),
            page({ path: "roles", params: undefined }),
            page({ path: "permissions", params: undefined }),
            page({ path: "policies", params: undefined }),
            page({ path: "compliance", params: undefined }),
            page({ path: "audit", params: undefined }),
            page({ path: "security", params: undefined }),
            page({ path: "backup", params: undefined }),
            page({ path: "integration", params: undefined }),

            // Organization departments
            layout({
              path: "[departmentId]",
              params: z.string().brand("departmentId"),
              children: [
                page({ path: "overview", params: undefined }),
                page({ path: "members", params: undefined }),
                page({ path: "structure", params: undefined }),
                page({ path: "budget", params: undefined }),
                page({ path: "projects", params: undefined }),
                page({ path: "resources", params: undefined }),
                page({ path: "performance", params: undefined }),
                page({ path: "goals", params: undefined }),
                page({ path: "metrics", params: undefined }),
                page({ path: "reports", params: undefined }),
                page({ path: "meetings", params: undefined }),
                page({ path: "calendar", params: undefined }),
                page({ path: "documents", params: undefined }),
                page({ path: "policies", params: undefined }),
                page({ path: "training", params: undefined }),

                // Department teams
                layout({
                  path: "[teamId]",
                  params: z.string().brand("teamId"),
                  children: [
                    page({ path: "members", params: undefined }),
                    page({ path: "lead", params: undefined }),
                    page({ path: "projects", params: undefined }),
                    page({ path: "tasks", params: undefined }),
                    page({ path: "sprints", params: undefined }),
                    page({ path: "backlog", params: undefined }),
                    page({ path: "kanban", params: undefined }),
                    page({ path: "timeline", params: undefined }),
                    page({ path: "milestones", params: undefined }),
                    page({ path: "deliverables", params: undefined }),
                    page({ path: "retrospectives", params: undefined }),
                    page({ path: "standup", params: undefined }),
                    page({ path: "velocity", params: undefined }),
                    page({ path: "burndown", params: undefined }),
                    page({ path: "capacity", params: undefined }),

                    // Team projects
                    layout({
                      path: "[projectId]",
                      params: z.string().brand("projectId"),
                      children: [
                        page({ path: "overview", params: undefined }),
                        page({ path: "scope", params: undefined }),
                        page({ path: "requirements", params: undefined }),
                        page({ path: "specifications", params: undefined }),
                        page({ path: "design", params: undefined }),
                        page({ path: "architecture", params: undefined }),
                        page({ path: "development", params: undefined }),
                        page({ path: "testing", params: undefined }),
                        page({ path: "deployment", params: undefined }),
                        page({ path: "monitoring", params: undefined }),
                        page({ path: "maintenance", params: undefined }),
                        page({ path: "documentation", params: undefined }),
                        page({ path: "changelog", params: undefined }),
                        page({ path: "releases", params: undefined }),
                        page({ path: "roadmap", params: undefined }),

                        // Project phases
                        layout({
                          path: "[phaseId]",
                          params: z.string().brand("phaseId"),
                          children: [
                            page({ path: "planning", params: undefined }),
                            page({ path: "execution", params: undefined }),
                            page({ path: "monitoring", params: undefined }),
                            page({ path: "review", params: undefined }),
                            page({ path: "closure", params: undefined }),
                            page({ path: "lessons", params: undefined }),
                            page({ path: "handover", params: undefined }),
                            page({ path: "support", params: undefined }),

                            // Phase deliverables
                            layout({
                              path: "[deliverableId]",
                              params: z.string().brand("deliverableId"),
                              children: [
                                page({
                                  path: "requirements",
                                  params: undefined,
                                }),
                                page({ path: "design", params: undefined }),
                                page({
                                  path: "implementation",
                                  params: undefined,
                                }),
                                page({ path: "testing", params: undefined }),
                                page({ path: "review", params: undefined }),
                                page({ path: "approval", params: undefined }),
                                page({ path: "delivery", params: undefined }),
                                page({ path: "acceptance", params: undefined }),
                                page({ path: "feedback", params: undefined }),
                                page({ path: "iterations", params: undefined }),

                                // Deliverable components
                                layout({
                                  path: "[componentId]",
                                  params: z.string().brand("componentId"),
                                  children: [
                                    page({
                                      path: "specification",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "development",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "unit_tests",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "integration",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "performance",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "security",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "documentation",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "deployment",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "monitoring",
                                      params: undefined,
                                    }),
                                    page({
                                      path: "maintenance",
                                      params: undefined,
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
          ],
        }),
        page({ path: "[settings]", params: z.string().brand("settings") }),
      ],
    }),
  ],
});

const router = new Router(routes);

export const res = router.route("/[id]/[user]/[orderId]/[refundId]/documents", {
  id: "1",
  user: "2",
  orderId: "3",
  refundId: "hi",
});

router.route("/[id]/[settings]", {
  id: "1",
  settings: "2",
});

const test = layout({
  path: "",
  params: undefined,
  children: [
    page({
      path: "[id]",
      params: z.string().brand("id"),
      children: [page({ path: "[somepage]" })],
    }),
  ],
});

const router2 = new Router(test);

router2.route("/[id]/[somepage]", {
  somepage: "hi",
  id: "hi",
});
