import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';
import { publicDisplayName } from '@/lib/team/sync-from-user';

export type LetterGender = 'm' | 'f';

export interface RecommendationInput {
  firstName: string;
  lastName: string;
  gender: LetterGender;
  memberRole: string;
  focus: string;
  contributions?: string;
  locale?: 'fr' | 'en';
}

const NAVY = rgb(13 / 255, 27 / 255, 74 / 255);
const BLUE = rgb(52 / 255, 121 / 255, 240 / 255);
const INK = rgb(28 / 255, 32 / 255, 44 / 255);
const MUTED = rgb(90 / 255, 96 / 255, 110 / 255);

const SIGNATORY = {
  name: 'Fresnel SATIGNON',
  titleFr: 'Président',
  titleEn: 'President',
};

function agr(gender: LetterGender, m: string, f: string) {
  return gender === 'f' ? f : m;
}

function wrap(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function loadBytes(diskRel: string, publicPath: string) {
  try {
    return await readFile(join(process.cwd(), diskRel));
  } catch {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    const res = await fetch(`${base}${publicPath}`);
    if (!res.ok) throw new Error(`Missing asset ${publicPath}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

function formatDate(locale: 'fr' | 'en') {
  return new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function paragraphs(input: RecommendationInput): string[] {
  const full = publicDisplayName(input.firstName, input.lastName);
  const first = input.firstName.trim() || full;
  const g = input.gender;
  const role = input.memberRole.trim();
  const focus = input.focus.trim() || (input.locale === 'en' ? 'artificial intelligence' : "l'intelligence artificielle");
  const roleBit = role
    ? input.locale === 'en'
      ? ` (${role})`
      : ` (${role})`
    : '';

  if (input.locale === 'en') {
    const they = agr(g, 'he', 'she');
    const their = agr(g, 'his', 'her');
    const them = agr(g, 'him', 'her');
    const extra = input.contributions?.trim();
    return [
      `It is with enthusiasm that I write this letter of recommendation for ${full}${roleBit}, with whom I have had the pleasure of collaborating at Epi'AI, the Artificial Intelligence association of EPITECH Benin. As President of the association, I have been able to observe closely ${their} commitment and exceptional competence in the field.`,
      `${first} has established ${agr(g, 'himself', 'herself')} as an active and committed member of Epi'AI. ${agr(g, 'His', 'Her')} passion for artificial intelligence is evident in every project ${they} takes part in. ${agr(g, 'He', 'She')} has shown a strong spirit of initiative, taking the lead and exceeding expectations on every occasion. This passion, combined with a sense of autonomy, makes ${them} an ideal candidate for any professional opportunity in AI.`,
      `Throughout our collaboration, ${first} has led several AI-related projects with rigor and effectiveness. ${agr(g, 'His', 'Her')} command of technical skills, notably in ${focus}, is impressive. ${agr(g, 'He', 'She')} shows a remarkable team spirit while remaining able to carry a project from start to finish. ${agr(g, 'His', 'Her')} ability to integrate and apply these skills makes ${them} an asset to any organisation.`,
      ...(extra ? [extra] : []),
      `I warmly recommend ${them} for any position or professional opportunity related to artificial intelligence. I am convinced that ${they} will make a valuable and innovative contribution to your team.`,
      `Thank you for the attention you will give to ${their} application. I remain at your disposal for any further information.`,
    ];
  }

  const extra = input.contributions?.trim();
  return [
    `C'est avec enthousiasme que je vous adresse cette lettre de recommandation pour ${full}${roleBit}, avec qui j'ai eu le plaisir de collaborer au sein d'Epi'AI, l'association d'Intelligence Artificielle d'EPITECH Bénin. En tant que Président de l'association, j'ai pu observer de près ${agr(g, 'son', 'son')} engagement et ${agr(g, 'sa', 'sa')} compétence exceptionnelle dans le domaine.`,
    `${first} s'est ${agr(g, 'imposé', 'imposée')} comme un membre actif et engagé d'Epi'AI. Sa passion pour l'intelligence artificielle est évidente dans chaque projet auquel ${agr(g, 'il', 'elle')} participe. ${agr(g, 'Il', 'Elle')} a démontré un fort esprit d'initiative, prenant les devants et surpassant les attentes à chaque occasion. Cette passion, alliée à un sens de l'autonomie, ${agr(g, 'le', 'la')} rend ${agr(g, 'idéal', 'idéale')} pour toute opportunité professionnelle dans le domaine de l'IA.`,
    `Au cours de notre collaboration, ${first} a mené plusieurs projets liés à l'IA avec rigueur et efficacité. Sa maîtrise des compétences techniques, notamment en ${focus}, est impressionnante. ${agr(g, 'Il', 'Elle')} fait preuve d'un remarquable esprit d'équipe, tout en étant capable de porter un projet de bout en bout. Son aptitude à intégrer et appliquer ces compétences fait de ${agr(g, 'lui', 'elle')} un atout pour tout organisme.`,
    ...(extra ? [extra] : []),
    `Je ${agr(g, 'le', 'la')} recommande chaleureusement pour toute position ou opportunité professionnelle en relation avec l'intelligence artificielle. Je suis convaincu qu'${agr(g, 'il', 'elle')} apportera une contribution précieuse et innovante à votre équipe.`,
    `Je vous remercie de l'attention que vous porterez à sa candidature et reste à votre disposition pour toute information complémentaire.`,
  ];
}

export async function buildRecommendationPdf(input: RecommendationInput): Promise<Uint8Array> {
  const locale = input.locale === 'en' ? 'en' : 'fr';
  const [regularBytes, boldBytes, italicBytes, epiAiLogo, epitechLogo] = await Promise.all([
    loadBytes('src/lib/letters/fonts/LiberationSerif-Regular.ttf', '/fonts/letters/LiberationSerif-Regular.ttf'),
    loadBytes('src/lib/letters/fonts/LiberationSerif-Bold.ttf', '/fonts/letters/LiberationSerif-Bold.ttf'),
    loadBytes('src/lib/letters/fonts/LiberationSerif-Italic.ttf', '/fonts/letters/LiberationSerif-Italic.ttf'),
    loadBytes('src/lib/letters/assets/epiai-logo.png', '/assets/epiai-logo.png'),
    loadBytes('src/lib/letters/assets/epitech-logo.png', '/assets/epi_logo.jpg'),
  ]);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  const italic = await doc.embedFont(italicBytes, { subset: true });
  const epiAi = await doc.embedPng(epiAiLogo);
  const epitech = await doc.embedPng(epitechLogo);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 56;

  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: NAVY });
  page.drawImage(epiAi, { x: margin, y: height - 88, width: 64, height: 64 });
  page.drawImage(epitech, { x: width - margin - 64, y: height - 88, width: 64, height: 64 });
  page.drawText("Epi'AI", {
    x: margin + 76,
    y: height - 48,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(locale === 'fr' ? "Association d'Intelligence Artificielle  ·  EPITECH Bénin" : 'Artificial Intelligence Association  ·  EPITECH Benin', {
    x: margin + 76,
    y: height - 68,
    size: 9,
    font: regular,
    color: rgb(0.82, 0.86, 0.95),
  });
  page.drawRectangle({ x: 0, y: height - 100, width, height: 4, color: BLUE });

  let y = height - 132;
  const dateLabel = locale === 'fr' ? `Cotonou, le ${formatDate('fr')}` : `Cotonou, ${formatDate('en')}`;
  page.drawText(dateLabel, {
    x: width - margin - regular.widthOfTextAtSize(dateLabel, 11),
    y,
    size: 11,
    font: italic,
    color: MUTED,
  });

  y -= 36;
  const title = locale === 'fr' ? 'Lettre de recommandation' : 'Letter of recommendation';
  page.drawText(title, { x: margin, y, size: 18, font: bold, color: NAVY });
  y -= 8;
  page.drawRectangle({ x: margin, y, width: bold.widthOfTextAtSize(title, 18), height: 2, color: BLUE });

  y -= 28;
  page.drawText(locale === 'fr' ? 'À qui de droit,' : 'To whom it may concern,', {
    x: margin,
    y,
    size: 12,
    font: italic,
    color: INK,
  });

  const maxWidth = width - margin * 2;
  const size = 11.2;
  const leading = 16.2;

  for (const paragraph of paragraphs({ ...input, locale })) {
    y -= 18;
    for (const line of wrap(paragraph, regular, size, maxWidth)) {
      if (y < 150) break;
      page.drawText(line, { x: margin, y, size, font: regular, color: INK });
      y -= leading;
    }
  }

  y -= 10;
  page.drawText(locale === 'fr' ? 'Sincèrement,' : 'Sincerely,', {
    x: margin,
    y,
    size: 12,
    font: italic,
    color: INK,
  });
  y -= 36;
  page.drawText(SIGNATORY.name, { x: margin, y, size: 12.5, font: bold, color: NAVY });
  y -= 16;
  page.drawText(locale === 'fr' ? SIGNATORY.titleFr : SIGNATORY.titleEn, {
    x: margin,
    y,
    size: 11,
    font: italic,
    color: MUTED,
  });
  y -= 15;
  page.drawText(locale === 'fr' ? "Epi'AI — Association d'Intelligence Artificielle" : "Epi'AI — Artificial Intelligence Association", {
    x: margin,
    y,
    size: 11,
    font: regular,
    color: INK,
  });

  page.drawRectangle({ x: 0, y: 0, width, height: 36, color: NAVY });
  page.drawText(locale === 'fr' ? 'epiai.eu  ·  Cotonou, Bénin' : 'epiai.eu  ·  Cotonou, Benin', {
    x: margin,
    y: 14,
    size: 9,
    font: regular,
    color: rgb(0.85, 0.88, 0.95),
  });

  return doc.save();
}

export function letterFilename(firstName: string, lastName: string, locale: 'fr' | 'en' = 'fr') {
  const full = publicDisplayName(firstName, lastName, locale === 'en' ? 'member' : 'membre').replace(/\s+/g, '_');
  return locale === 'en'
    ? `${full}_Letter_of_recommendation.pdf`
    : `${full}_Lettre_de_recommandation.pdf`;
}
