import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// Force hot reload

export const createEvent = mutation({
  args: {
    hostId: v.id("users"),
    title: v.string(),
    date: v.string(),
    endDate: v.optional(v.string()),
    location: v.string(),
    description: v.optional(v.string()),
    eventType: v.string(),
    templateId: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    typographyPreset: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let coverImageUrl: string | undefined;
    if (args.coverImageStorageId) {
      coverImageUrl = await ctx.storage.getUrl(args.coverImageStorageId) ?? undefined;
    }
    return await ctx.db.insert("events", {
      hostId: args.hostId,
      title: args.title,
      date: args.date,
      endDate: args.endDate,
      location: args.location,
      description: args.description,
      eventType: args.eventType,
      templateId: args.templateId,
      themeColor: args.themeColor,
      typographyPreset: args.typographyPreset,
      coverImageUrl,
      coverImageStorageId: args.coverImageStorageId,
      status: args.status ?? "draft",
      moderationMode: "auto-approve",
      uploadEnabled: true,
      maxUploadSizeMb: 50,
      maxUploadsPerGuest: 20,
    });
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    endDate: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    eventType: v.optional(v.string()),
    templateId: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    typographyPreset: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    moderationMode: v.optional(v.string()),
    uploadEnabled: v.optional(v.boolean()),
    maxUploadSizeMb: v.optional(v.number()),
    maxUploadsPerGuest: v.optional(v.number()),
    hostId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { eventId, coverImageStorageId, hostId, ...updates } = args;
    const patchData: Record<string, any> = {};

    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== hostId) throw new Error("Unauthorized: You must be the event host to update it.");

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patchData[key] = value;
    }

    if (coverImageStorageId) {
      const url = await ctx.storage.getUrl(coverImageStorageId);
      patchData.coverImageUrl = url;
      patchData.coverImageStorageId = coverImageStorageId;
    }

    await ctx.db.patch(eventId, patchData);
  },
});

export const updateEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.string(), // draft | published | live | ended
    hostId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== args.hostId) throw new Error("Unauthorized");

    await ctx.db.patch(args.eventId, { status: args.status });
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== args.hostId) throw new Error("Unauthorized");

    // Cascade: delete all guests
    const guests = await ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    for (const guest of guests) {
      await ctx.db.delete(guest._id);
    }

    // Cascade: delete all media
    const media = await ctx.db
      .query("mediaUploads")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
    for (const item of media) {
      if (item.storageId) {
        await ctx.storage.delete(item.storageId);
      }
      await ctx.db.delete(item._id);
    }

    // Delete event cover image from storage
    if (event.coverImageStorageId) {
      await ctx.storage.delete(event.coverImageStorageId);
    }

    await ctx.db.delete(args.eventId);
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
  args: { eventId: v.id("events"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== args.hostId) throw new Error("Unauthorized");

    const guests = await ctx.db
      .query("guests")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const media = await ctx.db
      .query("mediaUploads")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const yes = guests.filter(g => g.attendanceStatus === "yes");
    const no = guests.filter(g => g.attendanceStatus === "no");
    const maybe = guests.filter(g => g.attendanceStatus === "maybe");
    const checkedIn = guests.filter(g => g.checkedIn);
    const plusOnes = guests.reduce((acc, g) => acc + (g.plusOnes || 0), 0);
    const pendingMedia = media.filter(m => m.status === "pending").length;
    const featuredMedia = media.filter(m => m.status === "featured").length;

    return {
      totalRSVPs: guests.length,
      rsvpRate: guests.length === 0 ? 0 : Math.round((yes.length / guests.length) * 100),
      checkedIn: checkedIn.length,
      mediaCount: media.length,
      pendingMedia,
      featuredMedia,
      plusOnes,
      noShowRate: yes.length === 0 ? 0 : Math.round(((yes.length - checkedIn.length) / yes.length) * 100),
      attending: yes.length,
      declined: no.length,
      maybe: maybe.length,
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
    let totalCheckedIn = 0;

    for (const event of events) {
      const guests = await ctx.db
        .query("guests")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      totalRSVPs += guests.length;
      totalGuests += guests.reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);
      totalCheckedIn += guests.filter(g => g.checkedIn).length;
    }

    return {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === "published" || e.status === "live").length,
      totalGuests,
      totalRSVPs,
      totalCheckedIn,
    };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
