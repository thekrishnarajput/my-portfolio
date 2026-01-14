import mongoose, { Document, Schema } from 'mongoose';

export interface ITechStack extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const TechStackSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tech stack name is required'],
            trim: true,
            unique: true,
            lowercase: true, // Store in lowercase for case-insensitive uniqueness
            maxlength: [50, 'Tech stack name cannot exceed 50 characters'],
            index: true, // Index for faster search queries
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient search queries
TechStackSchema.index({ name: 'text' });

// Pre-save hook to ensure lowercase storage for case-insensitive uniqueness
TechStackSchema.pre('save', function (next) {
    const doc = this as { name?: string; isModified: (path: string) => boolean };
    if (doc.isModified('name') && doc.name) {
        doc.name = doc.name.toLowerCase().trim();
    }
    next();
});

export default mongoose.model<ITechStack>('TechStack', TechStackSchema);
