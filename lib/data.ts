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

let projects: Project[] = [
  {
    id: "p-1",
    name: "Green Villas",
    district: "Green District",
    type: "residential",
    status: "in progress",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description: "Low-density family housing with park access.",
    coordinates: { lat: 43.2608, lng: 76.8901 },
  },
  {
    id: "p-2",
    name: "Growth Hub Complex",
    district: "Growing District",
    type: "residential",
    status: "planned",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description: "High-rise residential complex near new transport line.",
    coordinates: { lat: 43.2388, lng: 76.9402 },
  },
  {
    id: "p-3",
    name: "Golden Mall Quarter",
    district: "Golden District",
    type: "commercial",
    status: "completed",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description: "Retail and mixed-use center for local businesses.",
    coordinates: { lat: 43.2472, lng: 76.9039 },
  },
  {
    id: "p-4",
    name: "Gate Logistics Center",
    district: "Gate District",
    type: "commercial",
    status: "in progress",
    developerId: "dev-2",
    developerName: "Skyline Nova",
    description: "Commercial and logistics-focused construction zone.",
    coordinates: { lat: 43.2178, lng: 76.9774 },
  },
  {
    id: "p-5",
    name: "Green Valley School",
    district: "Green District",
    type: "school",
    status: "planned",
    developerId: "dev-1",
    developerName: "Alatau Build",
    description: "Public school with sports and arts classrooms.",
    coordinates: { lat: 43.2701, lng: 76.9154 },
  },
];

let complaints: Complaint[] = [
  {
    id: "c-1",
    projectId: "p-2",
    text: "Please improve noise management near nearby homes.",
  },
];

const nextId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function getProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function createProject(
  input: Omit<Project, "id" | "developerName">,
): Project {
  const dev = DEVELOPERS.find((developer) => developer.id === input.developerId);
  const project: Project = {
    ...input,
    id: nextId("p"),
    developerName: dev?.name ?? "Unknown Developer",
  };
  projects = [project, ...projects];
  return project;
}

export function updateProject(
  id: string,
  changes: Partial<Omit<Project, "id">>,
): Project | null {
  const existing = getProjectById(id);
  if (!existing) return null;

  const nextDeveloperId = changes.developerId ?? existing.developerId;
  const nextDeveloperName =
    DEVELOPERS.find((developer) => developer.id === nextDeveloperId)?.name ??
    existing.developerName;

  const updated: Project = {
    ...existing,
    ...changes,
    developerId: nextDeveloperId,
    developerName: nextDeveloperName,
  };

  projects = projects.map((project) => (project.id === id ? updated : project));
  return updated;
}

export function deleteProject(id: string): boolean {
  const before = projects.length;
  projects = projects.filter((project) => project.id !== id);
  complaints = complaints.filter((complaint) => complaint.projectId !== id);
  return before !== projects.length;
}

export function getComplaints(projectId?: string): Complaint[] {
  if (!projectId) return complaints;
  return complaints.filter((complaint) => complaint.projectId === projectId);
}

export function addComplaint(projectId: string, text: string): Complaint {
  const complaint: Complaint = {
    id: nextId("c"),
    projectId,
    text,
  };
  complaints = [complaint, ...complaints];
  return complaint;
}
