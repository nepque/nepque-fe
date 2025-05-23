import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema - Updated to support Firebase Authentication and points system
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  isAdmin: boolean("is_admin").default(false),
  isBanned: boolean("is_banned").default(false),
  points: integer("points").default(10), // Start with 10 points on signup
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow(),
  preferredCategories: jsonb("preferred_categories").$type<number[]>(),
  preferredStores: jsonb("preferred_stores").$type<number[]>(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  // Daily streak fields
  currentStreak: integer("current_streak").default(0),
  lastCheckIn: timestamp("last_check_in"),
  // Spin wheel tracker
  lastSpin: timestamp("last_spin"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  firebaseUid: true,
  email: true,
  displayName: true,
  photoURL: true,
  isAdmin: true,
  preferredCategories: true,
  preferredStores: true,
  hasCompletedOnboarding: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User preferences schema for easier updates
export const userPreferencesSchema = z.object({
  preferredCategories: z.array(z.number()).optional(),
  preferredStores: z.array(z.number()).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(), // Font awesome icon name
  color: text("color").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  icon: true,
  color: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Stores schema
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo").notNull(),
  website: text("website").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  slug: true,
  logo: true,
  website: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
});

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Coupons schema
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  terms: text("terms"),
  usedCount: integer("used_count").default(0),
});

export const insertCouponSchema = createInsertSchema(coupons).pick({
  title: true,
  description: true,
  code: true,
  storeId: true,
  categoryId: true,
  expiresAt: true,
  featured: true,
  verified: true,
  terms: true,
  usedCount: true,
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// Extended type for frontend use with related data
export type CouponWithRelations = Coupon & {
  store: Store;
  category: Category;
};

// User-submitted coupons schema
export const userSubmittedCoupons = pgTable("user_submitted_coupons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  terms: text("terms"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
});

export const insertUserSubmittedCouponSchema = createInsertSchema(userSubmittedCoupons).pick({
  userId: true,
  title: true,
  description: true,
  code: true,
  storeId: true,
  categoryId: true,
  expiresAt: true,
  terms: true,
});

export type InsertUserSubmittedCoupon = z.infer<typeof insertUserSubmittedCouponSchema>;
export type UserSubmittedCoupon = typeof userSubmittedCoupons.$inferSelect;

// Extended type for frontend use with related data
export type UserSubmittedCouponWithRelations = UserSubmittedCoupon & {
  store: Store;
  category: Category;
  user: User;
};

// Withdrawal requests schema
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // "esewa", "khalti", "bank_transfer"
  accountDetails: text("account_details").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).pick({
  userId: true,
  amount: true,
  method: true,
  accountDetails: true,
});

export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

// Extended type for frontend use with related data
export type WithdrawalRequestWithUser = WithdrawalRequest & {
  user: User;
};

// Check-in history schema
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  checkedInAt: timestamp("checked_in_at").defaultNow(),
  streakDay: integer("streak_day").notNull(), // Which day in the streak (1-7)
  pointsEarned: integer("points_earned").notNull(), // How many points earned for this check-in
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  userId: true,
  streakDay: true,
  pointsEarned: true,
});

export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;

// Points Log schema
export const pointsLog = pgTable("points_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").notNull(), // Positive or negative delta
  action: text("action").notNull(), // e.g., 'daily_checkin', 'coupon_approved', 'withdrawal'
  description: text("description").notNull(), // Human-readable reason
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPointsLogSchema = createInsertSchema(pointsLog).pick({
  userId: true,
  points: true,
  action: true,
  description: true,
});

export type InsertPointsLog = z.infer<typeof insertPointsLogSchema>;
export type PointsLog = typeof pointsLog.$inferSelect;

// Banner Ads schema
export const bannerAds = pgTable("banner_ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(), // e.g., 'spin-page', 'homepage', 'earn-page'
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBannerAdSchema = createInsertSchema(bannerAds).pick({
  title: true,
  description: true,
  location: true,
  imageUrl: true,
  linkUrl: true,
  isActive: true,
});

export type InsertBannerAd = z.infer<typeof insertBannerAdSchema>;
export type BannerAd = typeof bannerAds.$inferSelect;

// Site settings schema - for storing verification codes and other site-wide settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).pick({
  key: true,
  value: true,
  description: true,
});

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// Social media links schema
export const socialMediaLinks = pgTable("social_media_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // e.g., 'facebook', 'twitter', 'instagram', 'pinterest'
  url: text("url").notNull(),
  icon: text("icon").notNull(), // Icon name from Lucide React
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSocialMediaLinkSchema = createInsertSchema(socialMediaLinks).pick({
  platform: true,
  url: true,
  icon: true,
  isActive: true,
});

export type InsertSocialMediaLink = z.infer<typeof insertSocialMediaLinkSchema>;
export type SocialMediaLink = typeof socialMediaLinks.$inferSelect;

// Content pages schema - for managing static pages like About Us, FAQ, etc.
export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // URL slug, e.g., "about-us", "faq", etc.
  title: text("title").notNull(),
  content: text("content").notNull(), // HTML content
  isPublished: boolean("is_published").default(true),
  noIndex: boolean("no_index").default(false), // SEO noindex control
  metaTitle: text("meta_title"), // SEO title
  metaDescription: text("meta_description"), // SEO description
  metaKeywords: text("meta_keywords"), // SEO keywords
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentPageSchema = createInsertSchema(contentPages).pick({
  slug: true,
  title: true,
  content: true,
  isPublished: true,
  noIndex: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
});

export type InsertContentPage = z.infer<typeof insertContentPageSchema>;
export type ContentPage = typeof contentPages.$inferSelect;

// Newsletter subscribers schema
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribed: boolean("subscribed").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
  subscribed: true,
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
