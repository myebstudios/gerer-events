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
  args: { eventId: v.id("events"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== args.hostId) throw new Error("Unauthorized");

    return await ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const updateGuest = mutation({
  args: {
    guestId: v.id("guests"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    attendanceStatus: v.optional(v.string()),
    plusOnes: v.optional(v.number()),
    mealPreference: v.optional(v.string()),
    hostId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const guest = await ctx.db.get(args.guestId);
    if (!guest) throw new Error("Guest not found");

    const event = await ctx.db.get(guest.eventId);
    if (!event || event.hostId !== args.hostId) throw new Error("Unauthorized");

    const { guestId, hostId, ...updates } = args;
    const patchData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patchData[key] = value;
    }
    await ctx.db.patch(guestId, patchData);
  },
});

export const deleteGuest = mutation({
  args: { guestId: v.id("guests"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const guest = await ctx.db.get(args.guestId);
    if (!guest) throw new Error("Guest not found");

    const event = await ctx.db.get(guest.eventId);
    if (!event || event.hostId !== args.hostId) throw new Error("Unauthorized");

    await ctx.db.delete(args.guestId);
  },
});

export const checkIn = mutation({
  args: { guestId: v.id("guests"), checkedIn: v.boolean(), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const guest = await ctx.db.get(args.guestId);
    if (!guest) throw new Error("Guest not found");

    const event = await ctx.db.get(guest.eventId);
    if (!event || event.hostId !== args.hostId) throw new Error("Unauthorized");

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

// For CSV export on the frontend
export const getGuestsForExport = query({
  args: { eventId: v.id("events"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== args.hostId) throw new Error("Unauthorized");

    const guests = await ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return guests.map((g) => ({
      name: g.fullName,
      email: g.email ?? "",
      phone: g.phone ?? "",
      status: g.attendanceStatus,
      plusOnes: g.plusOnes,
      mealPreference: g.mealPreference ?? "",
      checkedIn: g.checkedIn ? "Yes" : "No",
      checkedInAt: g.checkedInAt ?? "",
      message: g.message ?? "",
    }));
  },
});
