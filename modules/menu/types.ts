
export interface MenuSlot {
  id: string;
  name: string;
  tags: string[];
}

export interface MealConfig {
  id: string;
  name: string;
  slots: MenuSlot[];
}

export type RatingScope = 'all' | 'year' | 'month';

export interface MenuConfigSchema {
  enableImages: boolean;
  enableRating: boolean;
  ratingScope: RatingScope;
  meals: MealConfig[];
}

export interface MenuProfile {
  id: string;
  name: string;
  config: MenuConfigSchema;
}

export interface Dish {
  id: string;
  name: string;
  categoryId: string;
  tags: string[];
  imageUrl?: string;
  description?: string;
}

export type MenuStatus = 'draft' | 'published';

export interface DailyMenu {
  date: string; // YYYY-MM-DD
  assignments: Record<string, string[]>; // MealId -> DishIds[]
  status: MenuStatus;
  lastUpdated: string;
}

export interface DishVoteRecord {
  likes: number;
  dislikes: number;
}

export interface MenuModuleSchema {
  currentConfig: MenuConfigSchema;
  savedProfiles: MenuProfile[];
  currentProfileName: string;
  dishes: Dish[];
  // Replaced WeeklySchedule with DailyMenu for granular status management
  schedules: DailyMenu[]; 
  dishStats: Record<string, Record<string, DishVoteRecord>>;
}
