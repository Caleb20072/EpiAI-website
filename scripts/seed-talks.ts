/**
 * Seed des Talks Epi'AI (Talk 001 & Talk 002) + articles blog liés.
 * Usage: npm run db:seed:talks
 * Prod:  npm run db:seed:talks:prod
 */
import { PrismaClient } from '@prisma/client';
import { createEvent, getEventById, updateEvent } from '../src/lib/events/repository';
import { generateBlogFromEvent } from '../src/lib/blog/generate-from-event';
import { isChatbotAiEnabled } from '../src/lib/chatbot/openai';
import { createPost, updatePost } from '../src/lib/blog/repository';
import { prisma } from '../src/lib/prisma';

const TALKS = [
  {
    key: 'talk-001',
    titleFr: 'Talk 001 — Build your AI career',
    matchTitles: ['Build your AI career', 'Talk 001', 'Arnauld Adjovi'],
    data: {
      title: 'Talk 001 — Build your AI career',
      description:
        "Premier Talk Epi'AI avec Arnauld Adjovi (Technical Sales, Data & AI · IBM) : construire une carrière en IA, entre industrie, mentorat et GenAI.",
      content: `Epi'AI Presents — TALK · 001
Thèmes : IA · Carrière · Industrie

Intervenant : Arnauld Adjovi
Rôle : Technical Sales, Data & AI · IBM (Paris)
Profil : Professionnel béninois de l'IA, au cœur des grands enjeux mondiaux.

Parcours & expertise :
• Mentor de l'équipe nationale béninoise aux World AI Olympiads (Beijing) — 30e / 87
• Co-fondateur d'iSHEERO — conseil en gouvernance IA & transformation digitale
• Professeur IA à Epitech · Sèmè City
• Domaines : Machine Learning, NLP, IBM watsonx, GenAI

Événement ouvert à tous — pas de retard.`,
      categoryId: 'conference',
      date: '2026-05-28T17:00:00.000Z',
      location: 'Campus Epitech Bénin',
      isOnline: false,
      capacity: 80,
      imageUrl: '/assets/talks/talk1/talk1-cover.jpeg',
      gallery: [
        '/assets/talks/talk1/talk1-speaker-card.jpeg',
        '/assets/talks/talk1/talk1-gallery-01.jpeg',
        '/assets/talks/talk1/talk1-gallery-02.jpeg',
        '/assets/talks/talk1/talk1-gallery-03.jpeg',
      ],
      videoUrls: [] as string[],
      isPublished: true,
      isFeatured: true,
    },
    blogFallback: {
      titleEn: 'Talk 001 Recap: Building your AI career with Arnauld Adjovi',
      titleFr: 'Talk 001 — Construire sa carrière en IA avec Arnauld Adjovi',
      excerptEn:
        'Epi\'AI kicked off its Talk series with IBM\'s Arnauld Adjovi on careers, GenAI, and real-world AI impact.',
      excerptFr:
        "Epi'AI lance sa série de Talks avec Arnauld Adjovi (IBM) : carrière, GenAI et impact concret de l'IA.",
      contentEn: `## Talk 001 — Build your AI career

On **May 28**, Epi'AI hosted the first talk of its series at Epitech Bénin.

### The speaker

**Arnauld Adjovi** — Technical Sales, Data & AI at **IBM** (Paris) — shared a Beninese perspective on building an AI career at the intersection of industry and education.

His path includes:
- Mentoring Benin's national team at the **World AI Olympiads** (Beijing) — **30th / 87**
- Co-founding **iSHEERO** (AI governance & digital transformation)
- Teaching AI at **Epitech · Sèmè City**
- Hands-on expertise in **ML, NLP, watsonx & GenAI**

### Atmosphere

![Event poster](/assets/talks/talk1/talk1-cover.jpeg)

![Speaker card](/assets/talks/talk1/talk1-speaker-card.jpeg)

![Community moment](/assets/talks/talk1/talk1-gallery-01.jpeg)

Open to everyone, Talk 001 set the tone for Epi'AI's community: ambitious, practical, and rooted in Benin.`,
      contentFr: `## Talk 001 — Build your AI career

Le **28 mai**, Epi'AI a lancé sa série de Talks sur le campus Epitech Bénin.

### L'intervenant

**Arnauld Adjovi** — Technical Sales, Data & AI chez **IBM** (Paris) — a partagé une vision béninoise de la carrière en IA, entre industrie et pédagogie.

Parmi ses engagements :
- Mentor de l'équipe nationale aux **World AI Olympiads** (Beijing) — **30e / 87**
- Co-fondateur d'**iSHEERO** (gouvernance IA & transformation digitale)
- Professeur IA à **Epitech · Sèmè City**
- Expertise **ML, NLP, watsonx & GenAI**

### Ambiance

![Affiche](/assets/talks/talk1/talk1-cover.jpeg)

![Fiche intervenant](/assets/talks/talk1/talk1-speaker-card.jpeg)

![Moment communauté](/assets/talks/talk1/talk1-gallery-01.jpeg)

Ouvert à tous, le Talk 001 pose le ton d'Epi'AI : ambitieux, concret, ancré au Bénin.`,
      category: 'Events',
    },
  },
  {
    key: 'talk-002',
    titleFr: "Talk 002 — L'IA au service du pays",
    matchTitles: ["L'IA au service du pays", 'Talk 002', 'Kevin Degila'],
    data: {
      title: "Talk 002 — L'IA au service du pays",
      description:
        "Deuxième Talk Epi'AI avec Kevin Degila (Head of Data & AI) : IA, innovation publique et carrière — campus Epitech Bénin.",
      content: `Epi'AI Presents — TALK · 002
Thèmes : IA · Innovation publique · Carrière

Intervenant : Kevin Degila
Rôle : Head of Data & AI

Sujet : « L'IA au service du pays. »

Lieu : Mezzanine — Campus Epitech Bénin
Date : Lundi 20 juillet · 19:00
Ouvert à tous — pas de retard.

À propos de Kevin Degila :
• Site : https://kevindegila.com/
• Auteur du livre « Construire un LLM de zéro » — lancement officiel le 21 juillet
• Livre : https://www.llmdezero.com/

Un échange riche entre expertise technique, vision nationale de l'IA, et inspiration pour la communauté étudiante.`,
      categoryId: 'conference',
      date: '2026-07-20T19:00:00.000Z',
      location: 'Mezzanine — Campus Epitech Bénin',
      isOnline: false,
      capacity: 100,
      imageUrl: '/assets/talks/talk2/talk2-cover.jpeg',
      gallery: [
        '/assets/talks/talk2/talk2-gallery-01.jpeg',
        '/assets/talks/talk2/talk2-gallery-02.jpeg',
      ],
      videoUrls: [
        '/assets/talks/talk2/talk2-recap-01.mp4',
        '/assets/talks/talk2/talk2-recap-02.mp4',
      ],
      isPublished: true,
      isFeatured: true,
    },
    blogFallback: {
      titleEn: "Talk 002 Recap: AI serving the country with Kevin Degila",
      titleFr: "Talk 002 — L'IA au service du pays avec Kevin Degila",
      excerptEn:
        'Kevin Degila (Head of Data & AI) joined Epi\'AI for Talk 002 on public innovation, careers, and building LLMs from scratch.',
      excerptFr:
        "Kevin Degila (Head of Data & AI) était l'invité du Talk 002 Epi'AI : innovation publique, carrière, et LLM de zéro.",
      contentEn: `## Talk 002 — AI at the service of the country

On **Monday, July 20 at 19:00**, Epi'AI welcomed **Kevin Degila** (Head of Data & AI) to the Mezzanine at Campus Epitech Bénin.

### Themes

IA · Public innovation · Career

### About Kevin

Kevin recently published his first book, **[Construire un LLM de zéro](https://www.llmdezero.com/)**, with an official launch on **July 21**. More on his work at [kevindegila.com](https://kevindegila.com/).

### In the room

![Talk 002 poster](/assets/talks/talk2/talk2-cover.jpeg)

![On stage](/assets/talks/talk2/talk2-gallery-01.jpeg)

![After the talk](/assets/talks/talk2/talk2-gallery-02.jpeg)

### Videos

- [Recap video 1](/assets/talks/talk2/talk2-recap-01.mp4)
- [Recap video 2](/assets/talks/talk2/talk2-recap-02.mp4)

Talk 002 reinforced Epi'AI's mission: connect students with leaders shaping AI for Benin and beyond.`,
      contentFr: `## Talk 002 — L'IA au service du pays

Le **lundi 20 juillet à 19h**, Epi'AI a reçu **Kevin Degila** (Head of Data & AI) à la Mezzanine du campus Epitech Bénin.

### Thèmes

IA · Innovation publique · Carrière

### À propos de Kevin

Kevin vient de publier son premier livre, **[Construire un LLM de zéro](https://www.llmdezero.com/)**, dont le lancement officiel est le **21 juillet**. Retrouvez-le sur [kevindegila.com](https://kevindegila.com/).

### Dans la salle

![Affiche Talk 002](/assets/talks/talk2/talk2-cover.jpeg)

![Sur scène](/assets/talks/talk2/talk2-gallery-01.jpeg)

![Après le talk](/assets/talks/talk2/talk2-gallery-02.jpeg)

### Vidéos

- [Vidéo récap 1](/assets/talks/talk2/talk2-recap-01.mp4)
- [Vidéo récap 2](/assets/talks/talk2/talk2-recap-02.mp4)

Le Talk 002 confirme la mission d'Epi'AI : connecter les étudiants aux leaders qui façonnent l'IA au Bénin et au-delà.`,
      category: 'Events',
    },
  },
  {
    key: 'ia-etudes',
    titleFr: 'IA & Études',
    matchTitles: ['IA & Études', 'IA et Études', 'IA & Etudes'],
    blogStatus: 'published' as const,
    data: {
      title: 'IA & Études',
      description:
        "Séance Epi'AI × Epitech pour les collégiens, lycéens et bacheliers : utiliser l'IA pour réussir ses études, sans la laisser réfléchir à sa place. Campus Epitech Bénin, mézzanine.",
      content: `Epi'AI × Epitech — IA & Études

Une IA qui muscle. Pas une IA qui remplace.
Apprends à l'utiliser pour réussir, pas pour réfléchir à ta place.

Public : collégiens, lycéens et bacheliers pas encore entrés à l'université.
Lieu : Mézzanine — Campus Epitech Bénin
Date : samedi 29 août 2026 · 9h–12h
Entrée gratuite · places limitées.

Thèmes travaillés en salle :
• Utiliser l'IA pour apprendre sans en devenir dépendant
• Écrire un prompt et relire la réponse
• Faire confiance, ou non, à une réponse produite par une IA
• La différence entre s'en servir pour apprendre et s'en servir pour tricher
• Se tromper fait partie du processus
• Comprendre un cours, réviser et s'entraîner avec l'IA

Séance déjà passée.`,
      categoryId: 'formation',
      date: '2026-08-29T08:00:00.000Z',
      endDate: '2026-08-29T11:00:00.000Z',
      location: 'Mézzanine — Campus Epitech Bénin',
      isOnline: false,
      capacity: 40,
      imageUrl: '/assets/events/ia-etudes/cover.jpeg',
      gallery: [
        '/assets/events/ia-etudes/gallery-01.jpeg',
        '/assets/events/ia-etudes/gallery-02.jpeg',
        '/assets/events/ia-etudes/gallery-03.jpeg',
        '/assets/events/ia-etudes/gallery-04.jpeg',
        '/assets/events/ia-etudes/gallery-05.jpeg',
        '/assets/events/ia-etudes/gallery-06.jpeg',
      ],
      videoUrls: [] as string[],
      isPublished: true,
      isFeatured: true,
    },
    blogFallback: {
      titleEn: 'IA & Studies: using AI to learn, not to skip the work',
      titleFr: 'IA & Études — utiliser l’IA pour apprendre, pas pour éviter le travail',
      excerptEn:
        'On 29 August, Epi’AI and Epitech welcomed secondary-school students for a free session on using AI to study without letting it think for them.',
      excerptFr:
        'Le 29 août, Epi’AI et Epitech ont accueilli collégiens, lycéens et bacheliers pour une séance gratuite : utiliser l’IA pour étudier, sans la laisser penser à leur place.',
      contentEn: `## IA & Studies

On **Saturday 29 August, 9:00–12:00**, Epi'AI and Epitech held **IA & Études** on the mezzanine of Campus Epitech Bénin.

The session was free, with limited seats, and open to secondary-school students and graduates who have not started university yet.

### The line

An AI that trains you. Not an AI that replaces you. Learn to use it to succeed, not to think in your place.

### What the room worked on

- Using AI to learn without becoming dependent on it
- Writing a prompt and checking the answer
- Deciding when an AI answer can be trusted
- The difference between using AI to learn and using it to cheat
- Making mistakes as part of the process
- Understanding a lesson, revising, and practicing with AI

### In the room

![Poster](/assets/events/ia-etudes/cover.jpeg)

![The room](/assets/events/ia-etudes/gallery-01.jpeg)

![Live prompts](/assets/events/ia-etudes/gallery-02.jpeg)

![Discussion](/assets/events/ia-etudes/gallery-03.jpeg)`,
      contentFr: `## IA & Études

Le **samedi 29 août, de 9h à 12h**, Epi'AI et Epitech ont tenu **IA & Études** à la mézzanine du campus Epitech Bénin.

La séance était gratuite, à places limitées, ouverte aux collégiens, lycéens et bacheliers pas encore entrés à l'université.

### La ligne

Une IA qui muscle. Pas une IA qui remplace. Apprendre à l'utiliser pour réussir, pas pour réfléchir à sa place.

### Ce qui a été travaillé

- Utiliser l'IA pour apprendre sans en devenir dépendant
- Écrire un prompt et vérifier la réponse
- Savoir quand faire confiance à une réponse produite par une IA
- La différence entre s'en servir pour apprendre et s'en servir pour tricher
- Se tromper fait partie du processus
- Comprendre un cours, réviser et s'entraîner avec l'IA

### Dans la salle

![Affiche](/assets/events/ia-etudes/cover.jpeg)

![La salle](/assets/events/ia-etudes/gallery-01.jpeg)

![Prompts en direct](/assets/events/ia-etudes/gallery-02.jpeg)

![Échange](/assets/events/ia-etudes/gallery-03.jpeg)`,
      category: 'Events',
    },
  },
] as const;

async function findExistingEvent(matchTitles: readonly string[]) {
  const events = await prisma.event.findMany();
  return (
    events.find((e) =>
      matchTitles.some((m) => e.title.toLowerCase().includes(m.toLowerCase()))
    ) || null
  );
}

export async function seedTalks() {
  const only = process.env.SEED_TALK;
  for (const talk of TALKS) {
    if (only && talk.key !== only) continue;
    const existing = await findExistingEvent(talk.matchTitles);

    let eventId: string;
    if (existing) {
      const updated = await updateEvent(existing.id, talk.data);
      eventId = existing.id;
      console.log(`✓ Event mis à jour : ${talk.data.title} (${eventId})`);
      if (!updated) throw new Error(`Failed to update ${existing.id}`);
    } else {
      const created = await createEvent(talk.data, 'epiai-admin', "Epi'AI");
      eventId = created.id;
      console.log(`✓ Event créé : ${talk.data.title} (${eventId})`);
    }

    const event = await getEventById(eventId);
    if (!event) throw new Error(`Event ${eventId} missing after seed`);

    const linked = await prisma.blogPost.findUnique({
      where: { linkedEventId: eventId },
    });

    if (isChatbotAiEnabled()) {
      try {
        const { post } = await generateBlogFromEvent({
          event,
          createdBy: 'epiai-admin',
          authorName: "Epi'AI",
          forceRegenerate: Boolean(linked),
        });
        console.log(`✓ Blog IA : ${post.slug} (${post.status})`);
        continue;
      } catch (err) {
        console.warn(
          `⚠ Blog IA indisponible pour ${talk.key}, fallback éditorial:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    const fallback = talk.blogFallback;
    const blogStatus = 'blogStatus' in talk ? talk.blogStatus : 'draft';
    if (linked) {
      await updatePost(linked.id, {
        ...fallback,
        imageUrl: talk.data.imageUrl,
        authorName: "Epi'AI",
      });
      console.log(`✓ Blog fallback mis à jour : ${linked.slug}`);
    } else {
      const post = await createPost({
        ...fallback,
        imageUrl: talk.data.imageUrl,
        authorName: "Epi'AI",
        status: blogStatus,
        createdBy: 'epiai-admin',
        linkedEventId: eventId,
      });
      console.log(`✓ Blog fallback créé : ${post.slug}`);
    }
  }
}

async function main() {
  await seedTalks();
}

if (process.argv[1]?.includes('seed-talks')) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
