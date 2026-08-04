import "server-only";
import type { GenealogyModule, Person } from "@/lib/genealogy/types";
import {
  getGenealogyModuleFromKnowledge,
  getGenealogyModulesForPerson,
  getGenealogyModulesFromKnowledge,
  getGenealogyPersonFromKnowledge,
  getGenealogyPeopleByLegacyIds,
  getPeopleForGenealogyModule,
  getEncyclopediaHrefForGenealogyId,
  listGenealogyPersonIds,
} from "@/lib/knowledge/adapters/genealogy";
/**
 * Genealogy store — prefers the shared Knowledge Graph adapter.
 * Falls back only if knowledge content is unavailable.
 */

export async function getGenealogyModules(): Promise<readonly GenealogyModule[]> {
  return getGenealogyModulesFromKnowledge();
}

export async function getGenealogyModule(
  slug: string,
): Promise<GenealogyModule | undefined> {
  return getGenealogyModuleFromKnowledge(slug);
}

export async function getGenealogyPerson(
  id: string,
): Promise<Person | undefined> {
  return getGenealogyPersonFromKnowledge(id);
}

/** Prefer listGenealogyPersonIds() for params; this expands full Person graphs. */
export async function getAllGenealogyPeople(): Promise<readonly Person[]> {
  const modules = await getGenealogyModulesFromKnowledge();
  const byId = new Map<string, Person>();
  await Promise.all(
    modules.map(async (mod) => {
      const people = await getPeopleForGenealogyModule(mod.slug);
      for (const p of people) byId.set(p.id, p);
    }),
  );
  return [...byId.values()];
}

export async function listAllGenealogyPersonIds(): Promise<readonly string[]> {
  return listGenealogyPersonIds();
}

export async function getGenealogyPeopleByIds(
  ids: readonly string[],
): Promise<readonly Person[]> {
  return getGenealogyPeopleByLegacyIds(ids);
}

export async function getPeopleForModule(
  slug: string,
): Promise<readonly Person[]> {
  return getPeopleForGenealogyModule(slug);
}

export async function getModulesForPerson(
  id: string,
): Promise<GenealogyModule[]> {
  return getGenealogyModulesForPerson(id);
}

export async function getEncyclopediaHrefForPerson(
  id: string,
): Promise<string | undefined> {
  return getEncyclopediaHrefForGenealogyId(id);
}
