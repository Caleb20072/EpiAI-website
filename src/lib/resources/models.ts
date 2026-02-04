import mongoose from 'mongoose';

// Schema pour Resource
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['pdf', 'code', 'video', 'article', 'course', 'dataset'],
    required: true,
  },
  url: { type: String, required: true },
  fileUrl: { type: String },
  fileSize: { type: Number },
  fileType: { type: String },
  thumbnailUrl: { type: String },
  categoryId: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  author: { type: String },
  duration: { type: String },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  createdBy: { type: String, required: true },
}, {
  timestamps: true,
});

// Index pour la recherche
ResourceSchema.index({ title: 'text', description: 'text' });
ResourceSchema.index({ categoryId: 1, createdAt: -1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ isFeatured: 1, isPublished: 1 });
ResourceSchema.index({ viewCount: -1 });
ResourceSchema.index({ downloadCount: -1 });

export const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
