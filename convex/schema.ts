import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(), // For MVP only
  }).index("by_email", ["email"]),

  events: defineTable({
    hostId: v.id("users"),
    title: v.string(),
    date: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    eventType: v.string(),
    templateId: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    status: v.string(),
  }).index("by_host", ["hostId"]),

  guests: defineTable({
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    attendanceStatus: v.string(),
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
    fileType: v.string(),
    status: v.string(),
  }).index("by_event", ["eventId"]),
});
