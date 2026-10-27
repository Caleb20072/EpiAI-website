import { chatCompletionJson, isChatbotAiEnabled } from '@/lib/chatbot/openai';
import { COMMISSIONS } from '@/lib/team/commissions';
import { teamRoleLabel } from '@/lib/team/role-labels';

const FOCUS_EN: Record<string, string> = {
  "l'intelligence artificielle": 'artificial intelligence',
  'intelligence artificielle': 'artificial intelligence',
  ia: 'artificial intelligence',
  'artificial intelligence': 'artificial intelligence',
  'data science': 'data science',
  'machine learning': 'machine learning',
  'apprentissage automatique': 'machine learning',
  'vision par ordinateur': 'computer vision',
  'computer vision': 'computer vision',
};

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksFrench(value: string) {
  if (!value.trim()) return false;
  if (/[àâäéèêëïîôùûüçœ]/i.test(value)) return true;
  return /\b(le|la|les|un|une|des|du|de|et|en|dans|pour|avec|projet|membre|commission|association|responsable|formation)\b/i.test(
    value,
  );
}

export function lexiconRoleToEnglish(role: string): string {
  const trimmed = role.trim();
  if (!trimmed) return '';
  const labelled = teamRoleLabel(trimmed, 'en');
  if (labelled !== trimmed) return labelled;

  let result = trimmed;
  for (const commission of COMMISSIONS) {
    const fr = new RegExp(commission.nameFr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
    result = result.replace(fr, commission.nameEn);
    result = result.replace(new RegExp(`commission[\\s_]+${commission.key.replace('commission_', '')}`, 'ig'), commission.nameEn);
  }
  result = result.replace(/\bcommission\b/gi, 'commission');
  result = result.replace(/\bmembre\b/gi, 'Member');
  return result;
}

export function lexiconFocusToEnglish(focus: string): string {
  const trimmed = focus.trim();
  if (!trimmed) return '';
  const mapped = FOCUS_EN[fold(trimmed)];
  return mapped || trimmed;
}

async function translateWithAi(input: {
  memberRole: string;
  focus: string;
  contributions: string;
  gender: 'm' | 'f';
}): Promise<{ memberRole: string; focus: string; contributions: string } | null> {
  if (!isChatbotAiEnabled()) return null;
  try {
    return await chatCompletionJson({
      temperature: 0,
      system: `You translate member details into professional English for an official Epi'AI / EPITECH recommendation letter.
Return JSON only: {"memberRole":"","focus":"","contributions":""}.
Rules:
- Do not translate personal names. Keep Epi'AI, EPITECH, Benin, Cotonou.
- memberRole: a short English title (e.g. "Head of Communications", "Member of the AI projects commission").
- focus: a concise field name that can follow "notably in …".
- contributions: one formal English paragraph in the third person (${input.gender === 'f' ? 'she/her' : 'he/him'}). If empty, return "".
- If the source is already English, keep the meaning with only light polish.`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            memberRole: input.memberRole,
            focus: input.focus,
            contributions: input.contributions,
          }),
        },
      ],
    });
  } catch {
    return null;
  }
}

export async function fieldsForLetterLocale(input: {
  memberRole: string;
  focus: string;
  contributions: string;
  gender: 'm' | 'f';
  locale: 'fr' | 'en';
}): Promise<{ memberRole: string; focus: string; contributions: string }> {
  const memberRole = input.memberRole.trim();
  const focus = input.focus.trim();
  const contributions = input.contributions.trim();

  if (input.locale !== 'en') {
    return { memberRole, focus, contributions };
  }

  const lexiconRole = lexiconRoleToEnglish(memberRole);
  const lexiconFocus = lexiconFocusToEnglish(focus);
  const needsAi = looksFrench(memberRole) || looksFrench(focus) || looksFrench(contributions);

  if (needsAi) {
    const translated = await translateWithAi({
      memberRole,
      focus,
      contributions,
      gender: input.gender,
    });
    if (translated) {
      return {
        memberRole: translated.memberRole?.trim() || lexiconRole || memberRole,
        focus: translated.focus?.trim() || lexiconFocus || focus,
        contributions: translated.contributions?.trim() || contributions,
      };
    }
  }

  return {
    memberRole: lexiconRole || memberRole,
    focus: lexiconFocus || focus,
    contributions,
  };
}
