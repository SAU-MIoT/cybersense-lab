export interface Announcement {
  id: string;
  title: string;
  content: string;
  publish_date?: string | null;
  created_at: string;
  is_published: boolean;
  images?: ContentImage[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  github_url?: string;
  demo_url?: string;
  status: 'active' | 'done' | 'plan';
  funder?: string;
  date_range?: string;
  progress_pct?: number;
  created_at: string;
  is_published: boolean;
  images?: ContentImage[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  is_published: boolean;
  images?: ContentImage[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise?: string;
  avatar_icon?: string;
  email?: string;
  linkedin_url?: string;
  github_url?: string;
  scholar_url?: string;
  website_url?: string;
  sort_order: number;
  priority: number;
  is_published: boolean;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  pub_type: 'journal' | 'conference';
  pub_year: number;
  pdf_url?: string;
  doi_url?: string;
  created_at: string;
  is_published: boolean;
}

export interface ResearchArea {
  id: string;
  icon: string;
  title: string;
  description?: string;
  sort_order: number;
  is_published: boolean;
}

export interface Award {
  id: string;
  year: number;
  title: string;
  description?: string;
  color_scheme: 'cyan' | 'green' | 'orange' | 'purple';
  sort_order: number;
  is_published: boolean;
}

export interface Partner {
  id: string;
  name: string;
  icon: string;
  url?: string;
  sort_order: number;
  is_published: boolean;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface ContentImage {
  id?: string;
  entity_type: string;
  entity_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_published: boolean;
}

export interface PublicCounts {
  team: number;
  publications: number;
  activeProjects: number;
  partners: number;
}

export interface AdminTableDef {
  id: string;
  label: string;
  icon: string;
  titleField: string;
  fields: AdminFieldDef[];
}

export interface AdminFieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'email' | 'datetime-local' | 'select' | 'checkbox' | 'image-upload' | 'storage-image';
  required?: boolean;
  default?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  virtual?: boolean;
  createOnly?: boolean;
}
