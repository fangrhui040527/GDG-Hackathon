import type { ActorType } from "./actor";

export type MatchTier = "Excellent" | "Strong" | "Good" | "Fair";

export interface MatchResult {
  id: string;
  actorId: string;
  actorType: ActorType;
  actorName: string;
  profileSummary: string;
  matchScore: number;
  matchTier: MatchTier;
  aiExplanation: string;
  availabilityLabel: string;
  isAvailable: boolean;
  tags: string[];
}

export interface MatchResultsGroup {
  companies: MatchResult[];
  mentors: MatchResult[];
  partners: MatchResult[];
  serviceProviders: MatchResult[];
}

export interface ShortlistItem {
  id: string;
  programmeId: string;
  matchResultId: string;
  actorId: string;
  actorType: ActorType;
  actorName: string;
  matchScore: number;
  addedAt: string;
  addedBy: string;
  isAdminSelected: boolean;
}
