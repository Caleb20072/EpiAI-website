import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // Ex: "Président", "Vice-Président", "Chef Pôle Tech"
  title: { type: String }, // Ex: "Co-Lead", "Lead"
  section: {
    type: String,
    required: true,
    enum: ['executive', 'pole', 'mentor'],
  },
  poleKey: { type: String }, // Ex: "pole_tech", "pole_events" - pour regrouper
  description: { type: String },
  photoUrl: { type: String },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
  },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

TeamMemberSchema.index({ section: 1, displayOrder: 1 });
TeamMemberSchema.index({ isActive: 1 });
TeamMemberSchema.index({ poleKey: 1 });

export const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
