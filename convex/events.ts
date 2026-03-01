import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createEvent = mutation({
  args: {
    hostId: v.id("users"),
    title: v.string(),
    date: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    eventType: v.string(),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      status: "published",
    });
  },
});

export const getEvents = query({
  args: { hostId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostId", args.hostId))
      .collect();
  },
});

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

export const getEventStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const guests = await ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    
    const media = await ctx.db
      .query("mediaUploads")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      totalRSVPs: guests.length,
      attending: guests.filter(g => g.attendanceStatus === "yes").length,
      checkedIn: guests.filter(g => g.checkedIn).length,
      mediaCount: media.length,
    };
  },
});

export const getDashboardStats = query({
  args: { hostId: v.id("users") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostId", args.hostId))
      .collect();
    
    let totalGuests = 0;
    let totalRSVPs = 0;

    for (const event of events) {
      const guests = await ctx.db
        .query("guests")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      
      totalRSVPs += guests.length;
      totalGuests += guests.reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);
    }

    return {
      totalEvents: events.length,
      totalGuests,
      totalRSVPs,
    };
  },
});
