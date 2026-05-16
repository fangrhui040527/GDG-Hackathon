export type RelationshipType =
  | "company_mentor"
  | "company_partner"
  | "company_service_provider"
  | "company_programme";

export type RelationshipStatus = "active" | "completed" | "terminated";

export interface Relationship {
  id: string;
  type: RelationshipType;
  programmeId: string;
  programmeName: string;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  targetId: string;
  targetName: string;
  targetType: string;
  status: RelationshipStatus;
  establishedAt: string;
  notes?: string;
}
