import mongoose, { Schema, Document } from 'mongoose';
import type { IMembershipApplication } from './types';

const MembershipApplicationSchema = new Schema<IMembershipApplication>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      required: true,
      trim: true,
    },
    motivations: {
      type: String,
      required: true,
    },
    requestedRole: {
      type: String, // Pour les invites en masse
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche
MembershipApplicationSchema.index({ status: 1, createdAt: -1 });
MembershipApplicationSchema.index({ email: 1 });

export const MembershipApplication =
  mongoose.models.MembershipApplication ||
  mongoose.model<IMembershipApplication>('MembershipApplication', MembershipApplicationSchema);
