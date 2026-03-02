import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const signUp = mutation({
  args: { name: v.optional(v.string()), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      throw new Error("User already exists");
    }
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
    });
    return userId;
  },
});

export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!user || user.password !== args.password) {
      throw new Error("Invalid credentials");
    }
    return user._id;
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
  },
});

export const updateUser = mutation({
  args: { userId: v.id("users"), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    await ctx.db.patch(args.userId, updates);
  },
});
