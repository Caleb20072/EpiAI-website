import { chatCompletionJson, isChatbotAiEnabled } from '@/lib/chatbot/openai';

const MAX_TEXT = 24_000;

async function extractPdfText(bytes: Buffer): Promise<string> {
  try {
    const { extractText } = await import('unpdf');
    const result = await extractText(new Uint8Array(bytes), { mergePages: true });
    const text = Array.isArray(result.text) ? result.text.join('\n') : String(result.text || '');
    if (text.trim()) return text;
  } catch {
    /* fallback below */
  }

  const raw = bytes.toString('latin1');
  const chunks: string[] = [];
  const tj = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tj.exec(raw))) {
    chunks.push(
      match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\'),
    );
  }
  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

export type ParsedExamQuestion = {
  prompt: string;
  type: 'short' | 'long' | 'blank' | 'numeric';
  points: number;
  officialAnswer: string;
  gradingHint: string;
};

export async function parseExamPdfs(examPdf: Buffer, keyPdf?: Buffer | null) {
  const examText = (await extractPdfText(examPdf)).slice(0, MAX_TEXT);
  const keyText = keyPdf ? (await extractPdfText(keyPdf)).slice(0, MAX_TEXT) : '';
  if (!examText.trim()) {
    throw new Error('Impossible de lire le PDF du sujet. Ajoute les questions à la main.');
  }
  if (!isChatbotAiEnabled()) {
    throw new Error('OPENAI_API_KEY manquante pour transformer le PDF. Ajoute les questions à la main.');
  }

  const parsed = await chatCompletionJson<{ questions: ParsedExamQuestion[] }>({
    system:
      "Tu extrais TOUTES les questions / sous-questions / items à trous d'un sujet PDF pour créer des zones de réponse. Le candidat voit le PDF original (cartes, schémas, consignes) : ici tu ne résumes pas et tu n'omets rien. JSON { questions: [{ prompt, type, points, officialAnswer, gradingHint }] }. type = short | long | blank | numeric. Recopie l'énoncé (1.a, 2.b, « d'après la carte »…). officialAnswer uniquement depuis le corrigé, sinon ''. Plusieurs réponses : |. Pas d'invention.",
    messages: [
      {
        role: 'user',
        content: `SUJET:\n${examText}\n\nCORRIGÉ TYPE:\n${keyText || '(absent)'}\n`,
      },
    ],
    temperature: 0,
  });

  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  return questions
    .map((q, i) => ({
      prompt: String(q.prompt || '').trim(),
      type: (['short', 'long', 'blank', 'numeric'].includes(q.type) ? q.type : 'short') as ParsedExamQuestion['type'],
      points: Number.isFinite(Number(q.points)) && Number(q.points) > 0 ? Number(q.points) : 1,
      officialAnswer: String(q.officialAnswer || '').trim(),
      gradingHint: String(q.gradingHint || '').trim(),
      sortOrder: i,
    }))
    .filter((q) => q.prompt.length > 0);
}

export type ParsedInterviewQuestion = {
  prompt: string;
  kind: 'scale' | 'text' | 'pass_fail';
  maxPoints: number;
};

export async function parseInterviewPdf(pdf: Buffer) {
  const text = (await extractPdfText(pdf)).slice(0, MAX_TEXT);
  if (!text.trim()) {
    throw new Error('Impossible de lire le PDF d’entretien.');
  }
  if (!isChatbotAiEnabled()) {
    throw new Error('OPENAI_API_KEY manquante pour transformer le PDF.');
  }
  const parsed = await chatCompletionJson<{ questions: ParsedInterviewQuestion[] }>({
    system:
      "Tu extrais TOUTE la grille d'entretien PDF (chaque critère, sous-question, consigne). L'examinateur voit aussi le PDF original. JSON { questions: [{ prompt, kind, maxPoints }] }. kind = scale | text | pass_fail. Tu ne changes pas le fond et tu n'omets rien.",
    messages: [{ role: 'user', content: text }],
    temperature: 0,
  });
  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  return questions
    .map((q, i) => ({
      prompt: String(q.prompt || '').trim(),
      kind: (['scale', 'text', 'pass_fail'].includes(q.kind) ? q.kind : 'scale') as ParsedInterviewQuestion['kind'],
      maxPoints: Number.isFinite(Number(q.maxPoints)) && Number(q.maxPoints) > 0 ? Number(q.maxPoints) : 5,
      sortOrder: i,
    }))
    .filter((q) => q.prompt.length > 0);
}
