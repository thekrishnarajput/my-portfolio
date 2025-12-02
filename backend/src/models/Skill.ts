import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other';
  proficiency: number; // 0-100
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot exceed 50 characters']
    },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'other'],
      required: [true, 'Skill category is required']
    },
    proficiency: {
      type: Number,
      required: [true, 'Proficiency level is required'],
      min: [0, 'Proficiency must be at least 0'],
      max: [100, 'Proficiency cannot exceed 100']
    },
    icon: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
SkillSchema.index({ category: 1, order: 1 });

export default mongoose.model<ISkill>('Skill', SkillSchema);

