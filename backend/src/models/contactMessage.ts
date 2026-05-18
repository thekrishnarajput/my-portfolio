import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  filename: string;       // original file name shown to user
  storedName: string;     // name on disk (unique, collision-safe)
  mimetype: string;
  size: number;           // bytes
  url: string;            // relative URL: /uploads/contact-attachments/<storedName>
}

export interface IReply {
  _id?: string;
  content: string;
  sentAt: Date;
  emailMessageId?: string; // Resend message ID for threading
  sender: 'user' | 'admin';  // Who sent this reply
  attachments: IAttachment[];
}

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments: IAttachment[];   // Files attached to the initial contact message
  read: boolean;
  status: 'pending' | 'replied' | 'closed';
  threadId: string;           // Unique conversation thread identifier
  emailMessageId?: string;    // Resend message ID of last admin email sent (used for In-Reply-To)
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema: Schema = new Schema(
  {
    filename:   { type: String, required: true },
    storedName: { type: String, required: true },
    mimetype:   { type: String, required: true },
    size:       { type: Number, required: true },
    url:        { type: String, required: true },
  },
  { _id: false }
);

const ReplySchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    emailMessageId: {
      type: String,
      index: true, // Allow quick lookup by Resend message ID
    },
    sender: {
      type: String,
      enum: ['user', 'admin'],
      default: 'admin',
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
  },
  { _id: true }
);

const ContactMessageSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    read: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'closed'],
      default: 'pending',
    },
    threadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    emailMessageId: {
      type: String,
      index: true,
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
ContactMessageSchema.index({ read: 1, createdAt: -1 });
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ 'replies.emailMessageId': 1 });

export default mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
