import mongoose from 'mongoose';

// Schema pour Thread
const ThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  categoryId: { type: String, required: true },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  replyCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Schema pour Reply
const ReplySchema = new mongoose.Schema({
  threadId: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  isEdited: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Index pour la recherche
ThreadSchema.index({ title: 'text', content: 'text' });
ThreadSchema.index({ categoryId: 1, createdAt: -1 });
ThreadSchema.index({ tags: 1 });
ReplySchema.index({ threadId: 1, createdAt: -1 });

export const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
export const Reply = mongoose.models.Reply || mongoose.model('Reply', ReplySchema);
