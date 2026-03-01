import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const rsvp = mutation({
  args: {
    eventId: v.id("events"),
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    attendanceStatus: v.string(),
    plusOnes: v.number(),
    mealPreference: v.optional(v.string()),
    message: v.optional(v.string()),
    qrToken: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("guests", {
      ...args,
      checkedIn: false,
    });
  },
});

export const getGuest = query({
  args: { guestId: v.id("guests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.guestId);
  },
});

export const getGuests = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const checkIn = mutation({
  args: { guestId: v.id("guests"), checkedIn: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.guestId, {
      checkedIn: args.checkedIn,
      checkedInAt: args.checkedIn ? new Date().toISOString() : undefined,
    });
  },
});

export const verifyGuest = query({
  args: { eventId: v.id("events"), qrToken: v.string() },
  handler: async (ctx, args) => {
    const guest = await ctx.db
      .query("guests")
      .withIndex("by_qr", (q) => q.eq("qrToken", args.qrToken))
      .first();
    
    if (!guest || guest.eventId !== args.eventId) {
      throw new Error("Invalid QR Token or guest not found.");
    }
    if (!guest.checkedIn) {
      throw new Error("You must be checked in to upload media.");
    }
    return guest;
  },
});
