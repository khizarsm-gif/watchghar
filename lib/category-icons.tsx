import {
  Watch, Gem, Crown, Smartphone, Link2, Sparkles, Sun, Shield, Star, Gift,
  Heart, Clock, Timer, Compass, Dumbbell, Briefcase, type LucideIcon,
} from "lucide-react";

/**
 * Icons an admin can pick for a category. Keys are stored in the
 * `categories.icon` column. Keeping an explicit list (instead of importing
 * every lucide icon) keeps the page bundles small.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Watch, Gem, Crown, Smartphone, Link2, Sparkles, Sun, Shield, Star, Gift,
  Heart, Clock, Timer, Compass, Dumbbell, Briefcase,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? Watch;
}
