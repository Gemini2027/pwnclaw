import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ATTACK_CATEGORIES, type AttackCategory } from "./attacks"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryName(category: string): string {
  const cat = ATTACK_CATEGORIES[category as AttackCategory];
  return cat ? cat.name : category.replace("_", " ");
}

export function getTimeAgo(dateString: string): string {
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
