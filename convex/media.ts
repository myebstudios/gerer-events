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

    await ctx.db.insert("mediaUploads", {
      eventId: args.eventId,
      guestId: args.guestId,
      fileUrl,
      fileType: args.fileType,
      status: "approved",
    });
  },
});

export const getMedia = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaUploads")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});
