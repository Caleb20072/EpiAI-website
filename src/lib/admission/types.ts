export const PIPELINE_STAGES = [
  'received',
  'test_invited',
  'test_scheduled',
  'test_live',
  'test_submitted',
  'test_reviewed',
  'interview_invited',
  'interview_scheduled',
  'interview_reviewed',
  'admitted',
  'rejected',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type ExamQuestionType = 'short' | 'long' | 'blank' | 'numeric';

export const INTEGRITY_EVENT_TYPES = [
  'fullscreen_exit',
  'fullscreen_enter',
  'tab_hidden',
  'tab_visible',
  'window_blur',
  'window_focus',
  'copy',
  'paste',
  'cut',
  'context_menu',
  'print',
  'shortcut',
  'heartbeat',
] as const;

export type IntegrityEventType = (typeof INTEGRITY_EVENT_TYPES)[number];
