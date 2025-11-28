

export enum View {
  HOME = 'HOME',
  ARCHIVE = 'ARCHIVE',
  STYLES = 'STYLES',
  CHARACTERS = 'CHARACTERS',
  FINANCE = 'FINANCE',
  RESUME = 'RESUME',
  SETTINGS = 'SETTINGS',
}

export interface ArtStyle {
  id: string;
  name: string;
  description: string;
  features: string[];
  usage: string[];
  avoid: string[];
  colors: string[];
  category: string;
  imageUrl: string;
  fonts: string[];
  artists: string[];
  learnMoreUrl: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  tags: string[];
  folderId: string | null; // null for root
  uploadDate: string;
  thumbnail?: string;
  url?: string; // Added for download capability
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
}

// Updated Types: folderId can be null (Root)
export interface Note {
  id: string;
  folderId: string | null;
  title: string;
  content: string;
  date: string;
}

export interface Task {
  id: string;
  folderId: string | null;
  text: string;
  isCompleted: boolean;
}

export interface LinkItem {
  id: string;
  folderId: string | null;
  title: string;
  url: string;
}

export interface MoodboardImage {
  id: string;
  url: string;
}

export interface Moodboard {
  id: string;
  folderId: string | null;
  title: string;
  images: MoodboardImage[];
}

// New Brief Interfaces
export interface BriefReference {
  id: string;
  name: string;
  type: string;
  url: string; // Base64
}

export interface Brief {
  id: string;
  folderId: string | null;
  title: string;
  client: string;
  startDate: string; // New
  deadline: string; // YYYY/MM/DD
  objective: string;
  targetAudience: string;
  deliverables: string;
  preferences: string; // New: Client Preferences
  references: BriefReference[]; // New: Uploaded files
  tags: string[];
  isPinned: boolean;
  version: number;
  lastModified: number;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  age: number;
  job: string;
  style: string; // e.g., Swiss, Minimal, Qajar
  tone: string; // e.g., Formal, Friendly
  traits: string[];
  bio: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  answer: string;
  sources: GroundingSource[];
  suggestedTools?: { title: string; url: string }[];
}

export interface NewsItem {
  title: string;
  source: string;
  summary: string;
  url: string;
  date: string;
}

// Resume Types
export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  about: string;
  skills: string[];
  experiences: ResumeExperience[];
  education: ResumeEducation[];
}

// Finance Types
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string; // Format: YYYY-MM-DD
  category: string;
}
