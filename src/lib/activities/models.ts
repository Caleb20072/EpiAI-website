import mongoose from 'mongoose';

// Schema pour Activity (Intranet)
const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  onlineLink: { type: String },
  registrationDeadline: { type: Date, required: true }, // 24h avant par défaut
  isMandatory: { type: Boolean, default: true }, // Obligatoire pour tous les membres
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  linkedEventId: { type: String }, // Event miroir côté Events
}, {
  timestamps: true,
});

ActivitySchema.index({ date: 1, isActive: 1 });
ActivitySchema.index({ linkedEventId: 1 });
ActivitySchema.index({ registrationDeadline: 1 });
ActivitySchema.index({ title: 'text', description: 'text' });

// Schema pour ActivityRegistration (inscription aux activités)
const ActivityRegistrationSchema = new mongoose.Schema({
  activityId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
  registeredBy: { type: String }, // null = auto-inscription, sinon = admin qui a forcé
  isForcedRegistration: { type: Boolean, default: false },
}, {
  timestamps: true,
});

ActivityRegistrationSchema.index({ activityId: 1, userId: 1 }, { unique: true });
ActivityRegistrationSchema.index({ activityId: 1 });

// Schema pour Attendance (présence/absence)
const AttendanceSchema = new mongoose.Schema({
  activityId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  isPresent: { type: Boolean, required: true },
  wasRegistered: { type: Boolean, required: true }, // Était inscrit ou non
  markedBy: { type: String, required: true }, // Admin qui a marqué
  markedByName: { type: String, required: true },
  markedAt: { type: Date, default: Date.now },
  notes: { type: String }, // Notes optionnelles
}, {
  timestamps: true,
});

AttendanceSchema.index({ activityId: 1, userId: 1 }, { unique: true });
AttendanceSchema.index({ userId: 1, isPresent: 1 });
AttendanceSchema.index({ activityId: 1, isPresent: 1 });

export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
export const ActivityRegistration = mongoose.models.ActivityRegistration || mongoose.model('ActivityRegistration', ActivityRegistrationSchema);
export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
