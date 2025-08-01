import * as z from "zod";
import { layout, page, Router, type GetRouteSchema } from "./src/routing.js";
import { parseAsString } from "nuqs";

const routes = layout({
  path: "",

  children: [
    layout({
      path: "[id]",

      params: z.string().brand("id"),
      children: [
        page({ path: "somepage" }),
        page({ path: "about" }),
        page({ path: "contact" }),
        page({ path: "products" }),
        page({ path: "services" }),
        page({ path: "team" }),
        page({ path: "careers" }),
        page({ path: "faq" }),
        page({ path: "privacy" }),
        page({ path: "terms" }),
        page({ path: "support" }),
        page({ path: "documentation" }),
        page({ path: "api" }),
        page({ path: "changelog" }),
        page({ path: "status" }),
        page({ path: "blog" }),
        page({ path: "news" }),
        page({ path: "press" }),
        page({ path: "investors" }),
        page({ path: "legal" }),

        // User management section
        layout({
          path: "[user]",
          params: z.string().brand("user"),
          children: [
            page({ path: "user" }),
            page({ path: "profile" }),
            page({ path: "settings" }),
            page({ path: "orders" }),
            page({ path: "wishlist" }),
            page({ path: "reviews" }),
            page({ path: "notifications" }),
            page({ path: "subscriptions" }),
            page({ path: "billing" }),
            page({ path: "security" }),
            page({ path: "preferences" }),
            page({ path: "activity" }),
            page({ path: "followers" }),
            page({ path: "following" }),
            page({ path: "achievements" }),

            // Orders nested deeply
            layout({
              path: "[orderId]",
              params: z.string().brand("orderId"),
              children: [
                page({ path: "details" }),
                page({ path: "tracking" }),
                page({ path: "invoice" }),
                page({ path: "return" }),
                page({ path: "exchange" }),
                page({ path: "cancel" }),
                page({ path: "modify" }),
                page({ path: "shipping" }),
                page({ path: "payment" }),
                page({ path: "history" }),

                // Refunds with complex nesting
                layout({
                  path: "[refundId]",
                  params: z.string().brand("refundId"),
                  children: [
                    page({ path: "status" }),
                    page({ path: "documents" }),
                    page({ path: "timeline" }),
                    page({ path: "communication" }),
                    page({ path: "dispute" }),

                    // Documents with deep nesting
                    layout({
                      path: "[documentId]",
                      params: z.string().brand("documentId"),
                      children: [
                        page({ path: "view" }),
                        page({ path: "download" }),
                        page({ path: "share" }),
                        page({ path: "edit" }),
                        page({ path: "versions" }),
                        page({ path: "comments" }),
                        page({ path: "annotations" }),

                        // Versions with even deeper nesting
                        layout({
                          path: "[versionId]",
                          params: z.string().brand("versionId"),
                          children: [
                            page({ path: "compare" }),
                            page({ path: "restore" }),
                            page({ path: "diff" }),
                            page({ path: "metadata" }),

                            // Approval workflow
                            layout({
                              path: "[approvalId]",
                              params: z.string().brand("approvalId"),
                              children: [
                                page({ path: "request" }),
                                page({ path: "approve" }),
                                page({ path: "reject" }),
                                page({ path: "delegate" }),

                                // Approval history
                                layout({
                                  path: "[historyId]",
                                  params: z.string().brand("historyId"),
                                  children: [
                                    page({ path: "entry" }),
                                    page({ path: "audit" }),
                                    page({ path: "export" }),
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
                    page({ path: "details" }),
                    page({ path: "warranty" }),
                    page({ path: "manual" }),
                    page({ path: "support" }),
                    page({ path: "accessories" }),

                    // Item tracking
                    layout({
                      path: "[trackingId]",
                      params: z.string().brand("trackingId"),
                      children: [
                        page({ path: "location" }),
                        page({ path: "updates" }),
                        page({ path: "delivery" }),
                        page({ path: "signature" }),
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
                page({ path: "profile" }),
                page({ path: "posts" }),
                page({ path: "photos" }),
                page({ path: "videos" }),
                page({ path: "friends" }),
                page({ path: "groups" }),
                page({ path: "events" }),
                page({ path: "messages" }),

                // Posts with deep nesting
                layout({
                  path: "[postId]",
                  params: z.string().brand("postId"),
                  children: [
                    page({ path: "view" }),
                    page({ path: "edit" }),
                    page({ path: "comments" }),
                    page({ path: "likes" }),
                    page({ path: "shares" }),
                    page({ path: "analytics" }),

                    // Comments system
                    layout({
                      path: "[commentId]",
                      params: z.string().brand("commentId"),
                      children: [
                        page({ path: "reply" }),
                        page({ path: "edit" }),
                        page({ path: "delete" }),
                        page({ path: "report" }),
                        page({ path: "reactions" }),

                        // Nested replies
                        layout({
                          path: "[replyId]",
                          params: z.string().brand("replyId"),
                          children: [
                            page({ path: "view" }),
                            page({ path: "edit" }),
                            page({ path: "delete" }),
                            page({ path: "report" }),

                            // Reply threads
                            layout({
                              path: "[threadId]",
                              params: z.string().brand("threadId"),
                              children: [
                                page({ path: "continue" }),
                                page({ path: "collapse" }),
                                page({ path: "moderate" }),
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
            page({ path: "list" }),
            page({ path: "featured" }),
            page({ path: "new" }),
            page({ path: "sale" }),
            page({ path: "bestsellers" }),
            page({ path: "trending" }),
            page({ path: "recommended" }),
            page({ path: "clearance" }),
            page({ path: "premium" }),
            page({ path: "exclusive" }),
            page({ path: "seasonal" }),
            page({ path: "limited" }),
            page({ path: "bundles" }),
            page({ path: "gifts" }),
            page({ path: "compare" }),

            // Subcategories with massive nesting
            layout({
              path: "[subcategory]",
              params: z.string().brand("subcategory"),
              children: [
                page({ path: "items" }),
                page({ path: "popular" }),
                page({ path: "trending" }),
                page({ path: "recommended" }),
                page({ path: "reviews" }),
                page({ path: "guides" }),
                page({ path: "tutorials" }),
                page({ path: "comparisons" }),
                page({ path: "specifications" }),
                page({ path: "compatibility" }),
                page({ path: "accessories" }),
                page({ path: "warranty" }),
                page({ path: "support" }),
                page({ path: "documentation" }),
                page({ path: "downloads" }),

                // Individual items with complex structure
                layout({
                  path: "[itemId]",
                  params: z.string().brand("itemId"),
                  children: [
                    page({ path: "details" }),
                    page({ path: "reviews" }),
                    page({ path: "related" }),
                    page({ path: "specifications" }),
                    page({ path: "gallery" }),
                    page({ path: "videos" }),
                    page({ path: "manual" }),
                    page({ path: "warranty" }),
                    page({ path: "support" }),
                    page({ path: "faq" }),
                    page({ path: "compatibility" }),
                    page({ path: "accessories" }),
                    page({ path: "bundles" }),
                    page({ path: "alternatives" }),
                    page({ path: "history" }),

                    // Product variants with deep nesting
                    layout({
                      path: "[variantId]",
                      params: z.string().brand("variantId"),
                      children: [
                        page({ path: "specs" }),
                        page({ path: "stock" }),
                        page({ path: "pricing" }),
                        page({ path: "images" }),
                        page({ path: "videos" }),
                        page({ path: "360view" }),
                        page({ path: "ar" }),
                        page({ path: "customization" }),
                        page({ path: "personalization" }),
                        page({ path: "engraving" }),
                        page({ path: "packaging" }),
                        page({ path: "shipping" }),
                        page({ path: "delivery" }),
                        page({ path: "installation" }),
                        page({ path: "setup" }),

                        // Location-based availability
                        layout({
                          path: "[locationId]",
                          params: z.string().brand("locationId"),
                          children: [
                            page({ path: "availability" }),
                            page({ path: "reserve" }),
                            page({ path: "pickup" }),
                            page({ path: "delivery" }),
                            page({ path: "installation" }),
                            page({ path: "demo" }),
                            page({ path: "trial" }),
                            page({ path: "rental" }),
                            page({ path: "lease" }),
                            page({ path: "financing" }),

                            // Store services
                            layout({
                              path: "[serviceId]",
                              params: z.string().brand("serviceId"),
                              children: [
                                page({ path: "book" }),
                                page({ path: "schedule" }),
                                page({ path: "cancel" }),
                                page({ path: "reschedule" }),
                                page({ path: "status" }),
                                page({ path: "feedback" }),

                                // Service appointments
                                layout({
                                  path: "[appointmentId]",
                                  params: z.string().brand("appointmentId"),
                                  children: [
                                    page({
                                      path: "details",
                                    }),
                                    page({
                                      path: "confirm",
                                    }),
                                    page({ path: "modify" }),
                                    page({ path: "cancel" }),
                                    page({
                                      path: "checkin",
                                    }),
                                    page({
                                      path: "complete",
                                    }),
                                    page({
                                      path: "invoice",
                                    }),
                                    page({
                                      path: "receipt",
                                    }),
                                    page({
                                      path: "warranty",
                                    }),
                                    page({
                                      path: "followup",
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
                            page({ path: "options" }),
                            page({ path: "preview" }),
                            page({ path: "price" }),
                            page({ path: "timeline" }),
                            page({ path: "approval" }),
                            page({ path: "production" }),
                            page({ path: "quality" }),
                            page({ path: "shipping" }),

                            // Custom features
                            layout({
                              path: "[featureId]",
                              params: z.string().brand("featureId"),
                              children: [
                                page({ path: "configure" }),
                                page({ path: "validate" }),
                                page({ path: "simulate" }),
                                page({ path: "test" }),
                                page({ path: "optimize" }),
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
                        page({ path: "view" }),
                        page({ path: "verify" }),
                        page({ path: "helpful" }),
                        page({ path: "report" }),
                        page({ path: "respond" }),
                        page({ path: "photos" }),
                        page({ path: "videos" }),

                        // Review responses
                        layout({
                          path: "[responseId]",
                          params: z.string().brand("responseId"),
                          children: [
                            page({ path: "view" }),
                            page({ path: "edit" }),
                            page({ path: "delete" }),
                            page({ path: "escalate" }),
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
                    page({ path: "about" }),
                    page({ path: "products" }),
                    page({ path: "story" }),
                    page({ path: "sustainability" }),
                    page({ path: "innovation" }),
                    page({ path: "awards" }),
                    page({ path: "partnerships" }),
                    page({ path: "careers" }),
                    page({ path: "press" }),
                    page({ path: "contact" }),

                    // Brand collections
                    layout({
                      path: "[collectionId]",
                      params: z.string().brand("collectionId"),
                      children: [
                        page({ path: "overview" }),
                        page({ path: "products" }),
                        page({ path: "inspiration" }),
                        page({ path: "lookbook" }),
                        page({ path: "styling" }),
                        page({ path: "campaign" }),

                        // Collection seasons
                        layout({
                          path: "[seasonId]",
                          params: z.string().brand("seasonId"),
                          children: [
                            page({ path: "trends" }),
                            page({ path: "forecast" }),
                            page({ path: "colors" }),
                            page({ path: "materials" }),
                            page({ path: "sustainability" }),
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
                page({ path: "apply" }),
                page({ path: "save" }),
                page({ path: "share" }),
                page({ path: "reset" }),
                page({ path: "advanced" }),

                // Filter combinations
                layout({
                  path: "[combinationId]",
                  params: z.string().brand("combinationId"),
                  children: [
                    page({ path: "results" }),
                    page({ path: "refine" }),
                    page({ path: "export" }),
                    page({ path: "alert" }),
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
            page({ path: "post" }),
            page({ path: "comments" }),
            page({ path: "related" }),
            page({ path: "author" }),
            page({ path: "share" }),
            page({ path: "analytics" }),
            page({ path: "edit" }),
            page({ path: "draft" }),
            page({ path: "preview" }),
            page({ path: "publish" }),
            page({ path: "schedule" }),
            page({ path: "archive" }),
            page({ path: "seo" }),
            page({ path: "tags" }),
            page({ path: "categories" }),

            // Blog comments with threading
            layout({
              path: "[commentId]",
              params: z.string().brand("commentId"),
              children: [
                page({ path: "replies" }),
                page({ path: "report" }),
                page({ path: "moderate" }),
                page({ path: "approve" }),
                page({ path: "spam" }),
                page({ path: "delete" }),
                page({ path: "edit" }),
                page({ path: "pin" }),
                page({ path: "highlight" }),
                page({ path: "feature" }),

                // Nested comment replies
                layout({
                  path: "[replyId]",
                  params: z.string().brand("replyId"),
                  children: [
                    page({ path: "edit" }),
                    page({ path: "delete" }),
                    page({ path: "report" }),
                    page({ path: "approve" }),
                    page({ path: "like" }),
                    page({ path: "dislike" }),
                    page({ path: "flag" }),
                    page({ path: "block" }),

                    // Comment history and moderation
                    layout({
                      path: "[historyId]",
                      params: z.string().brand("historyId"),
                      children: [
                        page({ path: "version" }),
                        page({ path: "restore" }),
                        page({ path: "compare" }),
                        page({ path: "audit" }),
                        page({ path: "log" }),

                        // Moderation actions
                        layout({
                          path: "[actionId]",
                          params: z.string().brand("actionId"),
                          children: [
                            page({ path: "execute" }),
                            page({ path: "undo" }),
                            page({ path: "appeal" }),
                            page({ path: "escalate" }),
                            page({ path: "review" }),
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
                page({ path: "overview" }),
                page({ path: "posts" }),
                page({ path: "order" }),
                page({ path: "progress" }),
                page({ path: "bookmark" }),
                page({ path: "subscribe" }),
                page({ path: "download" }),
                page({ path: "print" }),

                // Series chapters
                layout({
                  path: "[chapterId]",
                  params: z.string().brand("chapterId"),
                  children: [
                    page({ path: "read" }),
                    page({ path: "notes" }),
                    page({ path: "highlights" }),
                    page({ path: "quiz" }),
                    page({ path: "discussion" }),
                    page({ path: "resources" }),

                    // Chapter sections
                    layout({
                      path: "[sectionId]",
                      params: z.string().brand("sectionId"),
                      children: [
                        page({ path: "content" }),
                        page({ path: "exercises" }),
                        page({ path: "solutions" }),
                        page({ path: "feedback" }),
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
            page({ path: "details" }),
            page({ path: "register" }),
            page({ path: "schedule" }),
            page({ path: "speakers" }),
            page({ path: "venue" }),
            page({ path: "tickets" }),
            page({ path: "pricing" }),
            page({ path: "sponsors" }),
            page({ path: "partners" }),
            page({ path: "media" }),
            page({ path: "press" }),
            page({ path: "livestream" }),
            page({ path: "recordings" }),
            page({ path: "feedback" }),
            page({ path: "analytics" }),

            // Event sessions
            layout({
              path: "[sessionId]",
              params: z.string().brand("sessionId"),
              children: [
                page({ path: "info" }),
                page({ path: "join" }),
                page({ path: "materials" }),
                page({ path: "transcript" }),
                page({ path: "recording" }),
                page({ path: "chat" }),
                page({ path: "qa" }),
                page({ path: "polls" }),
                page({ path: "feedback" }),
                page({ path: "notes" }),
                page({ path: "bookmarks" }),
                page({ path: "certificates" }),
                page({ path: "credits" }),
                page({ path: "networking" }),
                page({ path: "followup" }),

                // Session presentations
                layout({
                  path: "[presentationId]",
                  params: z.string().brand("presentationId"),
                  children: [
                    page({ path: "slides" }),
                    page({ path: "resources" }),
                    page({ path: "downloads" }),
                    page({ path: "references" }),
                    page({ path: "code" }),
                    page({ path: "demos" }),
                    page({ path: "interactive" }),
                    page({ path: "workshop" }),
                    page({ path: "handson" }),
                    page({ path: "assignments" }),
                    page({ path: "projects" }),
                    page({ path: "collaboration" }),
                    page({ path: "discussion" }),
                    page({ path: "feedback" }),
                    page({ path: "ratings" }),

                    // Presentation resources
                    layout({
                      path: "[resourceId]",
                      params: z.string().brand("resourceId"),
                      children: [
                        page({ path: "preview" }),
                        page({ path: "download" }),
                        page({ path: "share" }),
                        page({ path: "bookmark" }),
                        page({ path: "annotate" }),
                        page({ path: "translate" }),
                        page({ path: "convert" }),
                        page({ path: "embed" }),
                        page({ path: "api" }),
                        page({ path: "integration" }),

                        // Resource versions and history
                        layout({
                          path: "[versionId]",
                          params: z.string().brand("versionId"),
                          children: [
                            page({ path: "view" }),
                            page({ path: "compare" }),
                            page({ path: "restore" }),
                            page({ path: "changelog" }),
                            page({ path: "diff" }),
                            page({ path: "merge" }),
                            page({ path: "branch" }),

                            // Version metadata and tracking
                            layout({
                              path: "[metadataId]",
                              params: z.string().brand("metadataId"),
                              children: [
                                page({ path: "details" }),
                                page({ path: "properties" }),
                                page({ path: "tags" }),
                                page({
                                  path: "permissions",
                                }),
                                page({ path: "access" }),
                                page({ path: "usage" }),
                                page({ path: "analytics" }),
                                page({ path: "reports" }),
                                page({ path: "export" }),
                                page({ path: "backup" }),
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
                    page({ path: "profile" }),
                    page({ path: "connect" }),
                    page({ path: "message" }),
                    page({ path: "schedule" }),
                    page({ path: "meetings" }),
                    page({ path: "interests" }),
                    page({ path: "expertise" }),
                    page({ path: "recommendations" }),

                    // Networking connections
                    layout({
                      path: "[connectionId]",
                      params: z.string().brand("connectionId"),
                      children: [
                        page({ path: "chat" }),
                        page({ path: "video" }),
                        page({ path: "calendar" }),
                        page({ path: "collaboration" }),
                        page({ path: "projects" }),
                        page({ path: "follow" }),

                        // Collaboration spaces
                        layout({
                          path: "[workspaceId]",
                          params: z.string().brand("workspaceId"),
                          children: [
                            page({ path: "dashboard" }),
                            page({ path: "files" }),
                            page({ path: "discussions" }),
                            page({ path: "tasks" }),
                            page({ path: "calendar" }),
                            page({ path: "video" }),
                            page({ path: "whiteboard" }),
                            page({ path: "notes" }),
                            page({ path: "archive" }),
                            page({ path: "settings" }),
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
                page({ path: "booth" }),
                page({ path: "products" }),
                page({ path: "demos" }),
                page({ path: "presentations" }),
                page({ path: "meetings" }),
                page({ path: "brochures" }),
                page({ path: "contact" }),
                page({ path: "leads" }),
                page({ path: "analytics" }),
                page({ path: "followup" }),

                // Exhibitor activities
                layout({
                  path: "[activityId]",
                  params: z.string().brand("activityId"),
                  children: [
                    page({ path: "schedule" }),
                    page({ path: "register" }),
                    page({ path: "attend" }),
                    page({ path: "materials" }),
                    page({ path: "feedback" }),
                    page({ path: "certificate" }),

                    // Activity participants
                    layout({
                      path: "[participantId]",
                      params: z.string().brand("participantId"),
                      children: [
                        page({ path: "progress" }),
                        page({ path: "completion" }),
                        page({ path: "results" }),
                        page({ path: "recognition" }),
                        page({ path: "badge" }),
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
            page({ path: "overview" }),
            page({ path: "curriculum" }),
            page({ path: "prerequisites" }),
            page({ path: "enrollment" }),
            page({ path: "pricing" }),
            page({ path: "instructors" }),
            page({ path: "reviews" }),
            page({ path: "faq" }),
            page({ path: "certificate" }),
            page({ path: "community" }),
            page({ path: "support" }),
            page({ path: "resources" }),
            page({ path: "downloads" }),
            page({ path: "projects" }),
            page({ path: "portfolio" }),

            // Course modules
            layout({
              path: "[moduleId]",
              params: z.string().brand("moduleId"),
              children: [
                page({ path: "content" }),
                page({ path: "video" }),
                page({ path: "transcript" }),
                page({ path: "notes" }),
                page({ path: "quiz" }),
                page({ path: "assignment" }),
                page({ path: "discussion" }),
                page({ path: "resources" }),
                page({ path: "progress" }),
                page({ path: "completion" }),
                page({ path: "certificate" }),
                page({ path: "badge" }),

                // Module lessons
                layout({
                  path: "[lessonId]",
                  params: z.string().brand("lessonId"),
                  children: [
                    page({ path: "watch" }),
                    page({ path: "read" }),
                    page({ path: "practice" }),
                    page({ path: "exercise" }),
                    page({ path: "solution" }),
                    page({ path: "explanation" }),
                    page({ path: "tips" }),
                    page({ path: "troubleshooting" }),
                    page({ path: "examples" }),
                    page({ path: "case_studies" }),
                    page({ path: "real_world" }),
                    page({ path: "best_practices" }),
                    page({ path: "common_mistakes" }),
                    page({ path: "advanced" }),
                    page({ path: "bonus" }),

                    // Lesson components
                    layout({
                      path: "[componentId]",
                      params: z.string().brand("componentId"),
                      children: [
                        page({ path: "interactive" }),
                        page({ path: "simulation" }),
                        page({ path: "lab" }),
                        page({ path: "sandbox" }),
                        page({ path: "experiment" }),
                        page({ path: "test" }),
                        page({ path: "validate" }),
                        page({ path: "debug" }),
                        page({ path: "optimize" }),
                        page({ path: "deploy" }),

                        // Component results and analytics
                        layout({
                          path: "[resultId]",
                          params: z.string().brand("resultId"),
                          children: [
                            page({ path: "view" }),
                            page({ path: "analyze" }),
                            page({ path: "compare" }),
                            page({ path: "improve" }),
                            page({ path: "share" }),
                            page({ path: "export" }),
                            page({ path: "report" }),
                            page({ path: "feedback" }),
                            page({ path: "mentor" }),
                            page({ path: "peer_review" }),
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
            page({ path: "dashboard" }),
            page({ path: "overview" }),
            page({ path: "analytics" }),
            page({ path: "reports" }),
            page({ path: "users" }),
            page({ path: "teams" }),
            page({ path: "departments" }),
            page({ path: "roles" }),
            page({ path: "permissions" }),
            page({ path: "policies" }),
            page({ path: "compliance" }),
            page({ path: "audit" }),
            page({ path: "security" }),
            page({ path: "backup" }),
            page({ path: "integration" }),

            // Organization departments
            layout({
              path: "[departmentId]",
              params: z.string().brand("departmentId"),
              children: [
                page({ path: "overview" }),
                page({ path: "members" }),
                page({ path: "structure" }),
                page({ path: "budget" }),
                page({ path: "projects" }),
                page({ path: "resources" }),
                page({ path: "performance" }),
                page({ path: "goals" }),
                page({ path: "metrics" }),
                page({ path: "reports" }),
                page({ path: "meetings" }),
                page({ path: "calendar" }),
                page({ path: "documents" }),
                page({ path: "policies" }),
                page({ path: "training" }),

                // Department teams
                layout({
                  path: "[teamId]",
                  params: z.string().brand("teamId"),
                  children: [
                    page({ path: "members" }),
                    page({ path: "lead" }),
                    page({ path: "projects" }),
                    page({ path: "tasks" }),
                    page({ path: "sprints" }),
                    page({ path: "backlog" }),
                    page({ path: "kanban" }),
                    page({ path: "timeline" }),
                    page({ path: "milestones" }),
                    page({ path: "deliverables" }),
                    page({ path: "retrospectives" }),
                    page({ path: "standup" }),
                    page({ path: "velocity" }),
                    page({ path: "burndown" }),
                    page({ path: "capacity" }),

                    // Team projects
                    layout({
                      path: "[projectId]",
                      params: z.string().brand("projectId"),
                      children: [
                        page({ path: "overview" }),
                        page({ path: "scope" }),
                        page({ path: "requirements" }),
                        page({ path: "specifications" }),
                        page({ path: "design" }),
                        page({ path: "architecture" }),
                        page({ path: "development" }),
                        page({ path: "testing" }),
                        page({ path: "deployment" }),
                        page({ path: "monitoring" }),
                        page({ path: "maintenance" }),
                        page({ path: "documentation" }),
                        page({ path: "changelog" }),
                        page({ path: "releases" }),
                        page({ path: "roadmap" }),

                        // Project phases
                        layout({
                          path: "[phaseId]",
                          params: z.string().brand("phaseId"),
                          children: [
                            page({ path: "planning" }),
                            page({ path: "execution" }),
                            page({ path: "monitoring" }),
                            page({ path: "review" }),
                            page({ path: "closure" }),
                            page({ path: "lessons" }),
                            page({ path: "handover" }),
                            page({ path: "support" }),

                            // Phase deliverables
                            layout({
                              path: "[deliverableId]",
                              params: z.string().brand("deliverableId"),
                              children: [
                                page({
                                  path: "requirements",
                                }),
                                page({ path: "design" }),
                                page({
                                  path: "implementation",
                                }),
                                page({ path: "testing" }),
                                page({ path: "review" }),
                                page({ path: "approval" }),
                                page({ path: "delivery" }),
                                page({ path: "acceptance" }),
                                page({ path: "feedback" }),
                                page({ path: "iterations" }),

                                // Deliverable components
                                layout({
                                  path: "[componentId]",
                                  params: z.string().brand("componentId"),
                                  children: [
                                    page({
                                      path: "specification",
                                    }),
                                    page({
                                      path: "development",
                                    }),
                                    page({
                                      path: "unit_tests",
                                    }),
                                    page({
                                      path: "integration",
                                    }),
                                    page({
                                      path: "performance",
                                    }),
                                    page({
                                      path: "security",
                                    }),
                                    page({
                                      path: "documentation",
                                    }),
                                    page({
                                      path: "deployment",
                                    }),
                                    page({
                                      path: "monitoring",
                                    }),
                                    page({
                                      path: "maintenance",
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

export const res = router.route(
  "/[id]/[user]/[orderId]/[refundId]/documents",
  {
    id: "1",
    user: "2",
    orderId: "3",
    refundId: "hi",
  },
  {}
);

const test = layout({
  path: "",
  query: {
    page: {},
    layout: {
      layoutParam: parseAsString,
    },
  },
  children: [
    page({
      path: "[id]",
      params: z.string().brand("id"),
      query: {
        page: {
          type: z.string().brand("page"),
        },
        layout: {
          layout: z.string().brand("layout"),
        },
      },
      children: [page({ path: "[somepage]" })],
    }),
  ],
});

const router2 = new Router(test);

router2.route(
  "/[id]/[somepage]",
  {
    somepage: "hi",
    id: "hi",
  },
  {}
);

const someRouter = layout({
  path: "",

  children: [
    page({
      path: "[id]",
      params: z.string().brand("id"),
      query: {
        page: {
          type: z.string().brand("page"),
        },
        layout: {
          layout: z.string().brand("layout"),
        },
      },
    }),
  ],
});
