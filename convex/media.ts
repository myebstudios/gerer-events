import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveMedia = mutation({
  args: {
    eventId: v.id("events"),
    guestId: v.id("guests"),
    storageId: v.id("_storage"),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) throw new Error("Failed to get file URL");

    // Check event moderation mode
    const event = await ctx.db.get(args.eventId);
    const moderationMode = event?.moderationMode ?? "auto-approve";
    const status = moderationMode === "review" ? "pending" : "approved";

    await ctx.db.insert("mediaUploads", {
      eventId: args.eventId,
      guestId: args.guestId,
      fileUrl,
      storageId: args.storageId,
      fileType: args.fileType,
      status,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const getMedia = query({
  args: { eventId: v.id("events"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.hostId !== args.hostId) throw new Error("Unauthorized");

    return await ctx.db
      .query("mediaUploads")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getMediaByStatus = query({
  args: { eventId: v.id("events"), status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaUploads")
      .withIndex("by_status", (q) => q.eq("eventId", args.eventId).eq("status", args.status))
      .collect();
  },
});

export const moderateMedia = mutation({
  args: {
    mediaId: v.id("mediaUploads"),
    status: v.string(), // approved | rejected | featured | hidden
    moderatedBy: v.optional(v.id("users")), // acts as hostId
  },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) throw new Error("Media not found");

    const event = await ctx.db.get(media.eventId);
    if (!event) throw new Error("Event not found");

    if (!args.moderatedBy || event.hostId !== args.moderatedBy) throw new Error("Unauthorized");

    await ctx.db.patch(args.mediaId, {
      status: args.status,
      moderatedAt: new Date().toISOString(),
      moderatedBy: args.moderatedBy,
    });
  },
});

export const deleteMedia = mutation({
  args: { mediaId: v.id("mediaUploads"), hostId: v.id("users") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) throw new Error("Media not found");

    const event = await ctx.db.get(media.eventId);
    if (!event || event.hostId !== args.hostId) throw new Error("Unauthorized");

    if (media.storageId) {
      await ctx.storage.delete(media.storageId);
    }
    await ctx.db.delete(args.mediaId);
  },
});
