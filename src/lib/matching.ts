// ============================================================
// CivicSync — Volunteer ↔ Opportunity Matching Engine
// Scores opportunities [0–100] for a given volunteer profile.
// Higher = better match. Used for personalized home feed.
// ============================================================

export interface OpportunityForMatch {
  id: string;
  city?: string | null;
  state?: string | null;
  isRemote: boolean;
  urgency: string;
  requiredSkills: string[];
  volunteersNeeded: number;
  volunteersAccepted: number;
  dateStart?: Date | string | null;
  createdAt?: Date | string;
  [key: string]: unknown;
}

export interface VolunteerProfileForMatch {
  location?: string | null;
  skills?: string[];
  causes?: string[];
}

// Punjab cities — treated as "nearby" for Amritsar-based volunteers
const PUNJAB_CITIES = new Set([
  "amritsar", "ludhiana", "jalandhar", "patiala", "bathinda",
  "mohali", "pathankot", "hoshiarpur", "gurdaspur", "firozpur",
  "chandigarh", "nawanshahr", "moga", "kapurthala", "sangrur",
  "ropar", "fatehgarh sahib", "tarn taran",
]);

// ── Score components ──────────────────────────────────────────

/**
 * Location score [0–35]
 * Amritsar match:   35 pts
 * Same city match:  30 pts
 * Punjab city:      20 pts
 * Same state:       10 pts
 * Remote:           15 pts
 * Different state:   0 pts
 */
function locationScore(
  opp: OpportunityForMatch,
  volunteerLocation: string
): number {
  if (opp.isRemote) return 15;

  const volCity = extractCity(volunteerLocation).toLowerCase();
  const oppCity = (opp.city || "").toLowerCase();
  const oppState = (opp.state || "").toLowerCase();

  if (!oppCity) return 5; // unknown location — small default

  // Exact city match
  if (volCity && oppCity === volCity) {
    return volCity === "amritsar" ? 35 : 30;
  }

  // Both in Punjab
  if (oppState.includes("punjab") && PUNJAB_CITIES.has(oppCity)) return 20;

  // Same state (non-Punjab)
  if (volunteerLocation.toLowerCase().includes(oppState) && oppState) return 10;

  return 0;
}

/**
 * Skill match score [0–30]
 * (matching skills / required skills) × 30
 * If no skills required → 15 pts (accessible to all)
 */
function skillScore(
  opp: OpportunityForMatch,
  volunteerSkills: string[]
): number {
  if (!opp.requiredSkills || opp.requiredSkills.length === 0) return 15;
  if (!volunteerSkills || volunteerSkills.length === 0) return 0;

  const volSkillSet = new Set(volunteerSkills.map((s) => s.toLowerCase()));
  const matches = opp.requiredSkills.filter((s) =>
    volSkillSet.has(s.toLowerCase())
  ).length;

  return Math.round((matches / opp.requiredSkills.length) * 30);
}

/**
 * Urgency score [0–20]
 * critical → 20, high → 15, medium → 10, low → 5
 */
function urgencyScore(urgency: string): number {
  const map: Record<string, number> = {
    critical: 20,
    high: 15,
    medium: 10,
    low: 5,
  };
  return map[urgency] || 5;
}

/**
 * Availability score [0–15]
 * Spots still open = higher priority
 */
function availabilityScore(opp: OpportunityForMatch): number {
  const spotsLeft = opp.volunteersNeeded - opp.volunteersAccepted;
  if (spotsLeft <= 0) return 0;
  const fillPct = opp.volunteersAccepted / opp.volunteersNeeded;
  // Nearly full → high priority (boost), lots of space → lower urgency
  if (fillPct >= 0.8) return 15; // almost full — help now!
  if (fillPct >= 0.5) return 10;
  if (fillPct >= 0.2) return 7;
  return 5;
}

// ── Helpers ───────────────────────────────────────────────────

function extractCity(location: string): string {
  // "Amritsar, Punjab" → "Amritsar"
  return (location || "").split(",")[0].trim();
}

// ── Main scoring function ─────────────────────────────────────

export function scoreOpportunity(
  opp: OpportunityForMatch,
  volunteer: VolunteerProfileForMatch
): number {
  const loc  = locationScore(opp, volunteer.location || "Amritsar, Punjab");
  const skill = skillScore(opp, volunteer.skills || []);
  const urg  = urgencyScore(opp.urgency);
  const avail = availabilityScore(opp);

  return Math.min(100, loc + skill + urg + avail);
}

// ── Sort opportunities by score ───────────────────────────────

export function rankOpportunities<T extends OpportunityForMatch>(
  opportunities: T[],
  volunteer: VolunteerProfileForMatch
): (T & { matchScore: number })[] {
  return opportunities
    .map((opp) => ({ ...opp, matchScore: scoreOpportunity(opp, volunteer) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

// ── Score label (for UI display) ─────────────────────────────

export function matchLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Excellent Match",  color: "#34d399" };
  if (score >= 55) return { label: "Good Match",       color: "#86efac" };
  if (score >= 35) return { label: "Decent Match",     color: "#f59e0b" };
  return             { label: "Low Match",             color: "#94a3b8" };
}
