export type SubscriptionPlan = {
  id: string;
  name: string;
  pricePerMonth: number;
  billingLabel: string;
  highlight?: boolean;
  /** Stripe Payment Link URL for checkout */
  checkoutUrl?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type ModelGender = "female" | "male";

export type Model = {
  id: string;
  stageName: string;
  bio?: string;
  avatarUrl?: string;
  galleryUrls?: string[];
  active: boolean;
  /** Used to separate models into Female / Male on the models page. */
  gender?: ModelGender;
};

export type Video = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  /** Optional preview/trailer URL used on the store purchase page. */
  previewUrl?: string;
  publishedAt: string;
  categories: string[];
  models: string[];
  isTrending?: boolean;
  hidden?: boolean;
};

export type UserRole = "user" | "admin" | "affiliate";

export type User = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  subscriptionPlanId?: string;
};

