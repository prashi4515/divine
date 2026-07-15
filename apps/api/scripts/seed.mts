/**
 * P0 catalog seed — reference data only.
 *
 * Seeds: Languages, Works, TranslationSources, Topics, Emotions.
 * Does NOT seed: Chapters, Verses, Translations, Users, junctions.
 *
 * Idempotent: every row is upserted on its natural unique key so
 * `prisma db seed` can be run repeatedly without duplicates.
 *
 * Run:  pnpm --filter @divine/api prisma:seed
 *   or: pnpm --filter @divine/api exec prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    sortOrder: 10,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    sortOrder: 20,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    sortOrder: 30,
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    sortOrder: 40,
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    sortOrder: 50,
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    sortOrder: 60,
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    sortOrder: 70,
  },
] as const;

const works = [
  {
    code: "bg",
    slug: "bhagavad-gita",
    title: "Bhagavad Gita",
    description:
      "The Song of the Lord — 700 verses across 18 chapters of the Mahabharata.",
    sortOrder: 10,
  },
] as const;

const translationSources = [
  {
    key: "original-sanskrit",
    displayName: "Original Sanskrit",
    author: null as string | null,
    license: "Public domain (classical text)",
    isDefault: false,
  },
  {
    key: "public-domain",
    displayName: "Public Domain Translation",
    author: null as string | null,
    license: "Public domain",
    isDefault: true,
  },
] as const;

const topics = [
  { slug: "duty", name: "Duty", sortOrder: 10 },
  { slug: "karma", name: "Karma", sortOrder: 20 },
  { slug: "meditation", name: "Meditation", sortOrder: 30 },
  { slug: "wisdom", name: "Wisdom", sortOrder: 40 },
  { slug: "detachment", name: "Detachment", sortOrder: 50 },
] as const;

const emotions = [
  { slug: "fear", name: "Fear", sortOrder: 10 },
  { slug: "anxiety", name: "Anxiety", sortOrder: 20 },
  { slug: "peace", name: "Peace", sortOrder: 30 },
  { slug: "hope", name: "Hope", sortOrder: 40 },
  { slug: "purpose", name: "Purpose", sortOrder: 50 },
] as const;

async function seedLanguages(): Promise<void> {
  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      create: {
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        sortOrder: lang.sortOrder,
        isPublished: true,
      },
      update: {
        name: lang.name,
        nativeName: lang.nativeName,
        sortOrder: lang.sortOrder,
        isPublished: true,
      },
    });
  }
  console.log(`[seed] languages: ${languages.length} upserted`);
}

async function seedWorks(): Promise<void> {
  for (const work of works) {
    await prisma.work.upsert({
      where: { code: work.code },
      create: {
        code: work.code,
        slug: work.slug,
        title: work.title,
        description: work.description,
        sortOrder: work.sortOrder,
        isPublished: true,
      },
      update: {
        slug: work.slug,
        title: work.title,
        description: work.description,
        sortOrder: work.sortOrder,
        isPublished: true,
      },
    });
  }
  console.log(`[seed] works: ${works.length} upserted`);
}

async function seedTranslationSources(): Promise<void> {
  for (const source of translationSources) {
    await prisma.translationSource.upsert({
      where: { key: source.key },
      create: {
        key: source.key,
        displayName: source.displayName,
        author: source.author,
        license: source.license,
        isDefault: source.isDefault,
        isPublished: true,
      },
      update: {
        displayName: source.displayName,
        author: source.author,
        license: source.license,
        isDefault: source.isDefault,
        isPublished: true,
      },
    });
  }
  console.log(`[seed] translation_sources: ${translationSources.length} upserted`);
}

async function seedTopics(): Promise<void> {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      create: {
        slug: topic.slug,
        name: topic.name,
        sortOrder: topic.sortOrder,
        isPublished: true,
      },
      update: {
        name: topic.name,
        sortOrder: topic.sortOrder,
        isPublished: true,
      },
    });
  }
  console.log(`[seed] topics: ${topics.length} upserted`);
}

async function seedEmotions(): Promise<void> {
  for (const emotion of emotions) {
    await prisma.emotion.upsert({
      where: { slug: emotion.slug },
      create: {
        slug: emotion.slug,
        name: emotion.name,
        sortOrder: emotion.sortOrder,
        isPublished: true,
      },
      update: {
        name: emotion.name,
        sortOrder: emotion.sortOrder,
        isPublished: true,
      },
    });
  }
  console.log(`[seed] emotions: ${emotions.length} upserted`);
}

async function seedAdminUser(): Promise<void> {
  const email = "admin@divine.local";
  const passwordHash = await bcrypt.hash("DivineAdmin123!", 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      displayName: "Divine Admin",
      roles: ["super-admin"],
      status: "active",
      preferredLanguage: "en",
      timeZone: "UTC",
      emailVerifiedAt: new Date(),
    },
    update: {
      displayName: "Divine Admin",
      roles: ["super-admin"],
      status: "active",
    },
  });

  await prisma.authIdentity.upsert({
    where: {
      provider_providerSubject: { provider: "password", providerSubject: email },
    },
    create: {
      userId: user.id,
      provider: "password",
      providerSubject: email,
      passwordHash,
    },
    update: { passwordHash },
  });

  console.log(`[seed] admin user: ${email} (password: DivineAdmin123!)`);
}

async function seedDemoScripture(): Promise<void> {
  const work = await prisma.work.findUnique({ where: { code: "bg" } });
  await prisma.scripture.upsert({
    where: { slug: "bhagavad-gita" },
    create: {
      workId: work?.id,
      name: "Bhagavad Gita",
      slug: "bhagavad-gita",
      shortName: "Gita",
      description:
        "The Song of the Lord — 700 verses across 18 chapters of the Mahabharata.",
      religion: "Hinduism",
      originalLanguage: "sa",
      author: "Vyasa",
      structureLevels: ["Chapter", "Verse"],
      status: work?.isPublished ? "published" : "draft",
      isPublished: work?.isPublished ?? false,
      visibility: work?.isPublished ? "public" : "private",
      defaultLanguage: "en",
      readingDirection: "ltr",
      sortOrder: 10,
    },
    update: {
      workId: work?.id,
      name: "Bhagavad Gita",
      description:
        "The Song of the Lord — 700 verses across 18 chapters of the Mahabharata.",
      religion: "Hinduism",
      originalLanguage: "sa",
      structureLevels: ["Chapter", "Verse"],
    },
  });
  console.log("[seed] scriptures: bhagavad-gita upserted (linked to work bg when present)");
}

async function main(): Promise<void> {
  console.log("[seed] starting catalog + auth seed…");
  await seedLanguages();
  await seedWorks();
  await seedTranslationSources();
  await seedTopics();
  await seedEmotions();
  await seedAdminUser();
  await seedDemoScripture();
  console.log("[seed] done.");
}

main()
  .catch((error: unknown) => {
    console.error("[seed] FAILED:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
