import mongoose, { Document, Schema } from 'mongoose';

// Section configuration interfaces
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

export interface IHomepageConfig extends Document {
  version: string;
  sections: HomepageSections;
  seo?: SEOConfig;
  branding?: BrandingConfig;
  order: string[]; // Array of section IDs in display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomepageConfigSchema: Schema = new Schema(
  {
    version: {
      type: String,
      required: [true, 'Version is required'],
      default: '1.0.0',
    },
    sections: {
      hero: {
        enabled: { type: Boolean, default: true },
        badge: { type: String, trim: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, required: true, trim: true },
        primaryButton: {
          text: { type: String, trim: true },
          href: { type: String, trim: true },
        },
        secondaryButton: {
          text: { type: String, trim: true },
          href: { type: String, trim: true },
        },
        socialLinks: {
          github: { type: String, trim: true },
          linkedin: { type: String, trim: true },
          email: { type: String, trim: true },
        },
        showScrollIndicator: { type: Boolean, default: true },
      },
      about: {
        enabled: { type: Boolean, default: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, required: true, trim: true },
        professionalSummary: {
          title: { type: String, trim: true },
          content: { type: String, trim: true },
        },
        features: [
          {
            icon: { type: String, trim: true },
            title: { type: String, trim: true },
            description: { type: String, trim: true },
          },
        ],
        experience: {
          title: { type: String, trim: true },
          content: { type: String, trim: true },
        },
        education: {
          title: { type: String, trim: true },
          content: { type: String, trim: true },
        },
      },
      projects: {
        enabled: { type: Boolean, default: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, required: true, trim: true },
      },
      skills: {
        enabled: { type: Boolean, default: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, required: true, trim: true },
      },
      contact: {
        enabled: { type: Boolean, default: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, trim: true },
        email: { type: String, trim: true },
        linkedinUrl: { type: String, trim: true },
        showLinkedInFollowers: { type: Boolean, default: true },
      },
    },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
      ogImage: { type: String, trim: true },
    },
    branding: {
      logo: { type: String, trim: true },
      favicon: { type: String, trim: true },
    },
    order: {
      type: [String],
      default: ['hero', 'about', 'projects', 'skills', 'contact'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one section must be specified in order',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active configuration exists
HomepageConfigSchema.index({ isActive: 1 }, { unique: true, sparse: true });

export default mongoose.model<IHomepageConfig>('HomepageConfig', HomepageConfigSchema);
