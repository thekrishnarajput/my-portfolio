import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  visitorId: string; // Unique identifier (cookie-based or IP-based)
  ipAddress?: string;
  userAgent?: string;
  lastVisit: Date;
  visitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema: Schema = new Schema(
  {
    visitorId: {
      type: String,
      required: [true, 'Visitor ID is required'],
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    visitCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VisitorSchema.index({ visitorId: 1 });
VisitorSchema.index({ lastVisit: -1 });

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
