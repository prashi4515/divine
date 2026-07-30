import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  genealogyModuleCollectionSchema,
  personCollectionSchema,
  type GenealogyModule,
  type Person,
} from "@/lib/genealogy/types";

/**
 * Genealogy content loader.
 *
 * Reads the JSON collections in `content/genealogy/`, validates them with Zod
 * once per process and memoises the result. Runs only on the server.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content", "genealogy");

type Store = {
  people: readonly Person[];
  peopleById: ReadonlyMap<string, Person>;
  modules: readonly GenealogyModule[];
  modulesBySlug: ReadonlyMap<string, GenealogyModule>;
};

let cache: Promise<Store> | null = null;

async function loadStore(): Promise<Store> {
  const [peopleRaw, modulesRaw] = await Promise.all([
    fs.readFile(path.join(CONTENT_ROOT, "people.json"), "utf8"),
    fs.readFile(path.join(CONTENT_ROOT, "modules.json"), "utf8"),
  ]);

  const parsedPeople = personCollectionSchema.parse(JSON.parse(peopleRaw));
  const parsedModules = genealogyModuleCollectionSchema.parse(
    JSON.parse(modulesRaw),
  );

  const peopleById = new Map<string, Person>();
  for (const raw of parsedPeople.people) {
    const person: Person = {
      ...raw,
      slug: raw.slug ?? raw.id,
      aliases: raw.aliases ?? [],
      relationships: raw.relationships ?? [],
      variantTraditions: raw.variantTraditions ?? [],
      scriptureSources: raw.scriptureSources ?? [],
      relatedStories: raw.relatedStories ?? [],
      relatedVerses: raw.relatedVerses ?? [],
    };
    if (peopleById.has(person.id)) {
      throw new Error(
        `[genealogy] duplicate person id "${person.id}" in people.json`,
      );
    }
    peopleById.set(person.id, person);
  }

  for (const person of peopleById.values()) {
    for (const rel of person.relationships) {
      if (!peopleById.has(rel.personId)) {
        throw new Error(
          `[genealogy] "${person.id}" references unknown person "${rel.personId}"`,
        );
      }
      if (!rel.sources?.length) {
        throw new Error(
          `[genealogy] "${person.id}" → "${rel.personId}" missing scripture citation`,
        );
      }
    }
  }

  const people = [...peopleById.values()];

  const modulesBySlug = new Map<string, GenealogyModule>();
  for (const mod of parsedModules.modules) {
    if (modulesBySlug.has(mod.slug)) {
      throw new Error(`[genealogy] duplicate module slug "${mod.slug}"`);
    }
    for (const pid of mod.personIds) {
      if (!peopleById.has(pid)) {
        throw new Error(
          `[genealogy] module "${mod.slug}" references unknown person "${pid}"`,
        );
      }
    }
    if (mod.rootPersonId && !peopleById.has(mod.rootPersonId)) {
      throw new Error(
        `[genealogy] module "${mod.slug}" has unknown rootPersonId "${mod.rootPersonId}"`,
      );
    }
    modulesBySlug.set(mod.slug, mod);
  }

  const modules = [...parsedModules.modules].sort((a, b) => a.order - b.order);

  return {
    people,
    peopleById,
    modules,
    modulesBySlug,
  };
}

function getStore(): Promise<Store> {
  if (!cache) cache = loadStore();
  return cache;
}

export async function getGenealogyModules(): Promise<readonly GenealogyModule[]> {
  const store = await getStore();
  return store.modules;
}

export async function getGenealogyModule(
  slug: string,
): Promise<GenealogyModule | undefined> {
  const store = await getStore();
  return store.modulesBySlug.get(slug);
}

export async function getGenealogyPerson(id: string): Promise<Person | undefined> {
  const store = await getStore();
  return store.peopleById.get(id);
}

export async function getAllGenealogyPeople(): Promise<readonly Person[]> {
  const store = await getStore();
  return store.people;
}

/**
 * All people belonging to a module (in stable declaration order).
 * Silently drops any missing IDs, though the loader validates them at boot.
 */
export async function getPeopleForModule(
  slug: string,
): Promise<readonly Person[]> {
  const store = await getStore();
  const mod = store.modulesBySlug.get(slug);
  if (!mod) return [];
  return mod.personIds
    .map((id) => store.peopleById.get(id))
    .filter((p): p is Person => Boolean(p));
}

/**
 * Human-readable list of every module a person appears in — used on the
 * SEO person page for internal linking.
 */
export async function getModulesForPerson(id: string): Promise<GenealogyModule[]> {
  const store = await getStore();
  return store.modules.filter((mod) => mod.personIds.includes(id));
}
