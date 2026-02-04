import mongoose from 'mongoose';

// Schema pour Event
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  categoryId: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  onlineLink: { type: String },
  capacity: { type: Number, required: true, min: 1 },
  registeredCount: { type: Number, default: 0 },
  imageUrl: { type: String },
  gallery: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
}, {
  timestamps: true,
});

// Index pour la recherche
EventSchema.index({ title: 'text', description: 'text', content: 'text' });
EventSchema.index({ date: 1, isPublished: 1 });
EventSchema.index({ categoryId: 1, date: -1 });
EventSchema.index({ isPublished: 1, isFeatured: 1 });

// Schema pour Registration
const RegistrationSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: {
    type: String,
    enum: ['registered', 'cancelled', 'attended'],
    default: 'registered',
  },
  registeredAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Index uniques pour éviter les doublons
RegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, status: 1 });

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
export const Registration = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
