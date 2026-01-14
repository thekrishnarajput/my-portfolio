// Homepage configuration types matching backend model
export interface HeroConfig {
  enabled: boolean;
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  primaryButton?: {
    text: string;
    href: string;
    target?: '_self' | '_blank';
  };
  secondaryButton?: {
    text: string;
    href: string;
    target?: '_self' | '_blank';
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
  showScrollIndicator?: boolean;
}

export interface AboutConfig {
  enabled: boolean;
  title: string;
  subtitle?: string;
  description: string;
  professionalSummary?: {
    title: string;
    content: string;
  };
  features?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
  experience?: {
    title: string;
    content: string;
  };
  education?: {
    title: string;
    content: string;
  };
}

export interface ProjectsConfig {
  enabled: boolean;
  title: string;
  subtitle?: string;
  description: string;
}

export interface SkillsConfig {
  enabled: boolean;
  title: string;
  subtitle?: string;
  description: string;
}

export interface ContactConfig {
  enabled: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  email?: string;
  linkedinUrl?: string;
  showLinkedInFollowers?: boolean;
}

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface BrandingConfig {
  logo?: string; // Base64 data URL or URL
  favicon?: string; // Base64 data URL or URL
}

export interface HomepageSections {
  hero: HeroConfig;
  about: AboutConfig;
  projects: ProjectsConfig;
  skills: SkillsConfig;
  contact: ContactConfig;
}

export interface IHomepageConfig {
  _id: string;
  version: string;
  sections: HomepageSections;
  seo?: SEOConfig;
  branding?: BrandingConfig;
  order: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
