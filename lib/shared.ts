export type District =
  | "Green District"
  | "Growing District"
  | "Golden District"
  | "Gate District";

export type ProjectType = "residential" | "school" | "commercial";
export type ProjectStatus = "planned" | "in progress" | "completed";
export type UserRole = "resident" | "developer" | "admin";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Project = {
  id: string;
  name: string;
  district: District;
  type: ProjectType;
  status: ProjectStatus;
  developerId: string;
  developerName: string;
  description: string;
  coordinates: Coordinates;
};

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export type Complaint = {
  id: string;
  projectId: string;
  text: string;
};

export const DISTRICTS: District[] = [
  "Green District",
  "Growing District",
  "Golden District",
  "Gate District",
];

export const DEVELOPERS: User[] = [
  { id: "dev-1", name: "Alatau Build", role: "developer" },
  { id: "dev-2", name: "Skyline Nova", role: "developer" },
];

export const USERS: User[] = [
  { id: "resident-1", name: "Aruzhan", role: "resident" },
  ...DEVELOPERS,
  { id: "admin-1", name: "City Admin", role: "admin" },
];
