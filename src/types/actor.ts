export type ActorType = "company" | "mentor" | "partner" | "service_provider";

export type ActorStatus = "active" | "inactive" | "pending";

export interface Company {
  id: string;
  name: string;
  type: "company";
  industry: string;
  country: string;
  stage: string;
  description: string;
  logo?: string;
  website?: string;
  foundedYear: number;
  teamSize: number;
  status: ActorStatus;
  registeredAt: string;
}

export interface Mentor {
  id: string;
  name: string;
  type: "mentor";
  expertise: string[];
  country: string;
  bio: string;
  avatar?: string;
  linkedIn?: string;
  availability: "available" | "limited" | "unavailable";
  currentMenteeCount: number;
  maxMenteeCapacity: number;
  status: ActorStatus;
  registeredAt: string;
}

export interface Partner {
  id: string;
  name: string;
  type: "partner";
  focusArea: string[];
  country: string;
  description: string;
  logo?: string;
  website?: string;
  partnershipType: string;
  status: ActorStatus;
  registeredAt: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: "service_provider";
  services: string[];
  country: string;
  description: string;
  logo?: string;
  website?: string;
  capacity: "high" | "medium" | "low";
  status: ActorStatus;
  registeredAt: string;
}

export type Actor = Company | Mentor | Partner | ServiceProvider;

export interface ActorTableRow {
  id: string;
  name: string;
  type: ActorType;
  category: string;
  country: string;
  status: ActorStatus;
  registeredAt: string;
}
