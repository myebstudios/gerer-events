import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    password: v.string(),
  }).index("by_email", ["email"]),

  events: defineTable({
    hostId: v.id("users"),
    title: v.string(),
    date: v.string(),
    endDate: v.optional(v.string()),
    location: v.string(),
    description: v.optional(v.string()),
    eventType: v.string(),
    templateId: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    // Lifecycle: draft | published | live | ended
    status: v.string(),
    // Branding
    typographyPreset: v.optional(v.string()),
    // Settings
    moderationMode: v.optional(v.string()), // auto-approve | review
    maxUploadSizeMb: v.optional(v.number()),
    maxUploadsPerGuest: v.optional(v.number()),
    uploadEnabled: v.optional(v.boolean()),
  }).index("by_host", ["hostId"]),

  guests: defineTable({
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    attendanceStatus: v.string(), // yes | no | maybe
    plusOnes: v.number(),
    mealPreference: v.optional(v.string()),
    message: v.optional(v.string()),
    qrToken: v.string(),
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.string()),
  }).index("by_event", ["eventId"]).index("by_qr", ["qrToken"]),

  mediaUploads: defineTable({
    eventId: v.id("events"),
    guestId: v.id("guests"),
    fileUrl: v.string(),
    storageId: v.optional(v.id("_storage")),
    fileType: v.string(),
    // Moderation: approved | pending | rejected | featured | hidden
    status: v.string(),
    uploadedAt: v.optional(v.string()),
    moderatedAt: v.optional(v.string()),
    moderatedBy: v.optional(v.id("users")),
  }).index("by_event", ["eventId"]).index("by_status", ["eventId", "status"]),
});
