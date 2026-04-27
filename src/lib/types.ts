export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city?: string | null;
  state?: string | null;
  is_remote: boolean;
  urgency: "low" | "medium" | "high" | "critical";
  required_skills: string[];
  volunteers_needed: number;
  volunteers_accepted: number;
  date_start?: string | null;
  date_end?: string | null;
  hours_per_week?: number | null;
  is_one_time: boolean;
  image_url?: string | null;
  status: string;
  ngo_id?: string;
}

export interface Assignment {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  status: "accepted" | "ongoing" | "completed" | "cancelled";
  hours_contributed: number;
  rating?: number | null;
  feedback?: string | null;
  accepted_at: string;
  completed_at?: string | null;
  opportunity: Opportunity;
}

export interface VolunteerProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string | null;
  role: string;
  bio?: string;
  location?: string;
  phone?: string;
  skills: string[];
  availability: string[];
  causes: string[];
}

export const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  food:        { label: "Food Security",   icon: "🍱", color: "#f97316" },
  education:   { label: "Education",       icon: "📚", color: "#818cf8" },
  environment: { label: "Environment",     icon: "🌿", color: "#34d399" },
  health:      { label: "Healthcare",      icon: "❤️", color: "#f472b6" },
  elderly:     { label: "Elderly Care",    icon: "🧓", color: "#fb923c" },
  animals:     { label: "Animals",         icon: "🐾", color: "#a78bfa" },
  disaster:    { label: "Disaster Relief", icon: "🆘", color: "#ef4444" },
  other:       { label: "Other",           icon: "🤝", color: "#94a3b8" },
};

export const URGENCY_META: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: "Low",      color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  medium:   { label: "Medium",   color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  high:     { label: "High",     color: "#f97316", bg: "rgba(249,115,22,0.15)"  },
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
};

export const SKILL_OPTIONS = [
  "communication", "teaching", "technology", "design", "physical activity",
  "first aid", "empathy", "patience", "animal care", "leadership",
  "fundraising", "cooking", "driving", "photography", "social media",
];

export const AVAILABILITY_OPTIONS = [
  { value: "weekday_mornings",   label: "Weekday Mornings"   },
  { value: "weekday_afternoons", label: "Weekday Afternoons" },
  { value: "weekday_evenings",   label: "Weekday Evenings"   },
  { value: "weekend_mornings",   label: "Weekend Mornings"   },
  { value: "weekend_afternoons", label: "Weekend Afternoons" },
  { value: "weekend_evenings",   label: "Weekend Evenings"   },
];

export const CAUSE_OPTIONS = [
  { value: "food",        label: "Food Security",   icon: "🍱" },
  { value: "education",   label: "Education",       icon: "📚" },
  { value: "environment", label: "Environment",     icon: "🌿" },
  { value: "health",      label: "Healthcare",      icon: "❤️" },
  { value: "elderly",     label: "Elderly Care",    icon: "🧓" },
  { value: "animals",     label: "Animals",         icon: "🐾" },
  { value: "disaster",    label: "Disaster Relief", icon: "🆘" },
];

// ── NGO-specific types ────────────────────────────────────────

export interface CommunityNeed {
  id: string;
  ngo_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city?: string | null;
  state?: string | null;
  urgency: "low" | "medium" | "high" | "critical";
  beneficiaries?: number | null;
  image_urls: string[];
  status: "active" | "addressed" | "archived";
  linked_opportunity_id?: string | null;
  source: "manual" | "csv";
  created_at: string;
}

export interface NGORequest extends Opportunity {
  assignments?: AssignmentWithVolunteer[];
}

export interface AssignmentWithVolunteer {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  status: "accepted" | "ongoing" | "completed" | "cancelled";
  hours_contributed: number;
  accepted_at: string;
  completed_at?: string | null;
  volunteer: VolunteerProfile & { email?: string };
  opportunity?: {
    id: string;
    title: string;
    category: string;
    location: string;
    city?: string | null;
  } | null;
}

export interface AnalyticsData {
  totalNeeds: number;
  totalRequests: number;
  totalVolunteers: number;
  fulfillmentRate: number;         // %
  totalHoursContributed: number;
  engagementTimeline: { month: string; volunteers: number; requests: number }[];
  categoryBreakdown: { name: string; count: number; color: string }[];
  requestStatusBreakdown: { name: string; value: number; color: string }[];
}
