"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Library,
  ScrollText,
  Swords,
} from "lucide-react";
import { useUiLanguage } from "@/lib/i18n/use-messages";
import { localizeEntityTitle } from "@/lib/reading/shloka-script";
import type {
  WeaponResolvedLinks,
  KnowledgeWeapon,
} from "@/lib/weapons/store";
import {
  weaponCategoryLabel,
  weaponFocusLabel,
  weaponHref,
  isKnowledgeWeapon,
} from "@/lib/weapons/helpers";
import { entityHref } from "@/lib/knowledge/search";
import { eventHref, eventTypeLabel, genealogyPersonHref } from "@/lib/events/helpers";
import { formatCitation } from "@/lib/knowledge/types";
import type { KnowledgeEntity } from "@/lib/knowledge/types";
import { isCharacterEntity } from "@/lib/encyclopedia/character-kinds";
import { LazyEntityGraph } from "@/features/encyclopedia/lazy-entity-graph";
import {
  displayEnglishName,
  toModernEnglish,
} from "@/lib/text/modern-english";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2
        id={id}
        className="text-saffron text-[10px] font-medium uppercase tracking-[0.18em]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function EntityChips({
  title,
  id,
  entities,
  extraHref,
  hrefFor,
}: {
  title: string;
  id: string;
  entities: KnowledgeEntity[];
  hrefFor?: (e: KnowledgeEntity) => string;
  extraHref?: (e: KnowledgeEntity) => { href: string; label: string } | null;
}) {
  const lang = useUiLanguage();
  if (entities.length === 0) return null;
  return (
    <Section id={id} title={title}>
      <ul className="flex flex-wrap gap-2">
        {entities.map((e) => {
          const extra = extraHref?.(e);
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-1.5">
              <Link
                href={hrefFor?.(e) ?? entityHref(e)}
                className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                prefetch
              >
                {localizeEntityTitle(displayEnglishName(e), lang)}
                <Library className="text-muted-foreground h-3 w-3" aria-hidden />
              </Link>
              {extra ? (
                <Link
                  href={extra.href}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
                  prefetch
                >
                  {extra.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function PhraseList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="text-foreground/90 list-disc space-y-2 pl-5 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item}>{toModernEnglish(item)}</li>
      ))}
    </ul>
  );
}

export function WeaponPageBody({
  weapon,
  links,
}: {
  weapon: KnowledgeWeapon;
  links: WeaponResolvedLinks;
}) {
  const graphNeighbors = links.relatedEdges.slice(0, 24).map((r) => ({
    entity: r.other,
    relation: r.relation,
  }));

  return (
    <div className="page-gutter mx-auto max-w-4xl space-y-10 pb-16 pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {weaponCategoryLabel(links.category)}
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {toModernEnglish(weaponFocusLabel(links.focus))}
        </span>
        <span className="border-border/70 rounded-full border px-2.5 py-0.5 text-[11px]">
          {toModernEnglish(links.overview.primaryScripture)}
        </span>
        {weapon.aliases?.slice(0, 4).map((a) => (
          <span
            key={a}
            className="border-border/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px]"
          >
            {toModernEnglish(a)}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={entityHref(weapon)}
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          prefetch
        >
          Encyclopedia
        </Link>
        <Link
          href="/timeline"
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          prefetch
        >
          Timeline
        </Link>
        <Link
          href="/events"
          className="border-border bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-divine"
          prefetch
        >
          Events
        </Link>
      </div>

      {weapon.slug === "panchajanya" ? (
        <>
          <Section id="what-is-panchajanya" title="What is Panchajanya?">
            <p className="text-foreground/90 text-base leading-relaxed">
              Panchajanya (also written as <em>Pancajanya</em> or <em>Pāñcajanya</em>) is the sacred conch shell (<em>shankh</em> or <em>Panchajanya shankh</em>) of Lord Krishna (Hrishikesha). In ancient Indian epic tradition and Vedic literature, the conch shell represents the divine sound (<em>nāda-brahman</em>) that awakens righteousness, proclaims cosmic order, and strikes terror into the forces of unrighteousness (<em>adharma</em>). As Lord Krishna&apos;s personal conch, Panchajanya is one of the most revered sacred objects in the Mahābhārata and Bhagavad Gītā.
            </p>
          </Section>

          <Section id="panchajanya-gita-1-15" title="Panchajanya in Bhagavad Gita 1.15">
            <div className="space-y-3 text-foreground/90 text-base leading-relaxed">
              <p>
                Panchajanya makes its most famous appearance at the opening of the Kurukshetra war in Chapter 1, Verse 15 of the Bhagavad Gita. Standing upon their grand chariot yoked with white horses, Lord Krishna and Arjuna sounded their conches to announce the battle for dharma:
              </p>
              <blockquote className="border-saffron/40 bg-card/60 rounded-r-lg border-l-4 p-4 font-serif text-sm italic">
                “पाञ्चजन्यं हृषीकेशो देवदत्तं धनञ्जयः |<br />
                पौण्ड्रं दध्मौ महाशङ्खं भीमकर्मा वृकोदरः ||”
                <span className="text-muted-foreground mt-2 block not-italic text-xs font-sans">
                  “Hrishikesha (Krishna) blew His conch, Panchajanya; Dhananjaya (Arjuna) blew Devadatta; and Bhima, the doer of fearsome deeds, blew his great conch Paundra.” — Bhagavad Gita 1.15
                </span>
              </blockquote>
              <p>
                The reverberation of Panchajanya alongside the Pandava hero conches echoed through sky and earth, shattering the confidence of Dhritarashtra&apos;s sons.
              </p>
              <div className="pt-1">
                <Link
                  href="/verse/1/15"
                  className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-divine"
                  prefetch
                >
                  <BookOpen className="h-3.5 w-3.5 text-saffron" aria-hidden />
                  Panchajanya in Bhagavad Gita 1.15
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </Link>
              </div>
            </div>
          </Section>

          <Section id="meaning-of-panchajanya" title="Meaning of Panchajanya">
            <p className="text-foreground/90 text-base leading-relaxed">
              The name <em>Pāñcajanya</em> (पाञ्चजन्य) carries a profound dual scriptural meaning. First, it literally signifies “originating from or belonging to Panchajana” (<em>Pāñcajana</em>)—the ocean demon who dwelt inside a giant conch shell at Prabhasa. Second, etymologically it relates to the <em>Pañca-Jana</em> (the five classes of beings: devas, pitris, gandharvas, nagas, and humans), symbolizing a divine sound that resonates through all five realms of creation.
            </p>
          </Section>

          <Section id="origin-story" title="Origin & Story of Panchajanya">
            <p className="text-foreground/90 text-base leading-relaxed">
              According to Purāṇic traditions (including the <em>Śrīmad Bhāgavata Purāṇa</em> Canto 10 and <em>Vishnu Purana</em>), when Krishna and Balarama completed their studies at the ashram of Guru Sandipani in Avanti, they offered to pay <em>guru-dakshiṇā</em>. Sandipani Muni asked for the restoration of his young son, who had drowned in the sea at Prabhasa. Krishna descended into the ocean depths, defeated the sea demon Panchajana who lived inside a gigantic conch shell, rescued his guru&apos;s son, and claimed the demon&apos;s shell as his personal shankh—naming it <em>Panchajanya</em> in memory of the encounter.
            </p>
          </Section>

          <Section id="significance" title="Significance of Panchajanya">
            <p className="text-foreground/90 text-base leading-relaxed">
              In Sanatana iconography, Panchajanya is one of the four principal emblems held in Lord Vishnu&apos;s four arms (<em>Chaturbhuja</em>: Shankha, Chakra, Gada, Padma). As a sacred weapon and battle horn, Panchajanya symbolizes divine sovereignty, cosmic order, and the awakening call of truth. Its sound inspires spiritual courage in seekers while dispelling the darkness of <em>adharma</em>.
            </p>
          </Section>

          <Section id="other-conches" title="Other Conches Mentioned in Bhagavad Gita Chapter 1">
            <p className="text-foreground/90 mb-3 text-base leading-relaxed">
              Bhagavad Gita Chapter 1 (verses 1.15 to 1.18) explicitly names the individual conches sounded by the principal leaders on the battlefield:
            </p>
            <ul className="text-foreground/90 grid gap-2.5 sm:grid-cols-2 text-sm">
              <li className="border-border/60 bg-card/40 rounded-lg border p-3">
                <strong className="text-foreground">Panchajanya</strong> (<em>Pāñcajanya</em>) — Blown by Lord Krishna (Hrishikesha)
              </li>
              <li className="border-border/60 bg-card/40 rounded-lg border p-3">
                <strong className="text-foreground">Devadatta</strong> (<em>Devadatta</em>) — Blown by Arjuna (Dhananjaya)
              </li>
              <li className="border-border/60 bg-card/40 rounded-lg border p-3">
                <strong className="text-foreground">Paundra</strong> (<em>Pauṇḍra</em>) — Blown by Bhima (Vrikodara)
              </li>
              <li className="border-border/60 bg-card/40 rounded-lg border p-3">
                <strong className="text-foreground">Anantavijaya</strong> (<em>Anantavijaya</em>) — Blown by King Yudhishthira
              </li>
              <li className="border-border/60 bg-card/40 rounded-lg border p-3">
                <strong className="text-foreground">Sughosha</strong> (<em>Sughoṣa</em>) — Blown by Nakula
              </li>
              <li className="border-border/60 bg-card/40 rounded-lg border p-3">
                <strong className="text-foreground">Manipushpaka</strong> (<em>Maṇipuṣpaka</em>) — Blown by Sahadeva
              </li>
            </ul>
          </Section>
        </>
      ) : (
        <Section id="description" title="Description">
          <p className="text-foreground/90 text-base leading-relaxed">
            {toModernEnglish(links.overview.description)}
          </p>
        </Section>
      )}

      <EntityChips
        id="owners"
        title="Owners"
        entities={links.owners}
        extraHref={(e) => {
          const g = genealogyPersonHref(e);
          return g ? { href: g, label: "Genealogy" } : null;
        }}
      />

      {links.origin.length > 0 ? (
        <Section id="origin" title="Origin">
          <ul className="space-y-2">
            {links.origin.map(({ entity, note }) => (
              <li key={entity.id}>
                <Link
                  href={entityHref(entity)}
                  className="border-border/70 bg-card hover:border-saffron/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-divine"
                  prefetch
                >
                  {displayEnglishName(entity)}
                  <Library className="text-muted-foreground h-3 w-3" aria-hidden />
                </Link>
                {note ? (
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    {toModernEnglish(note.replace(/^origin\s*[—–-]\s*/i, ""))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {links.powers.length > 0 ? (
        <Section id="powers" title="Powers">
          <PhraseList items={links.powers} />
        </Section>
      ) : null}

      {links.overview.sources.length > 0 ? (
        <Section id="scriptural-references" title="Scriptural references">
          <ul className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {links.overview.sources.map((s, i) => (
              <li key={`${s.work}-${i}`} className="inline-flex items-center gap-1">
                <ScrollText className="h-3 w-3 opacity-70" aria-hidden />
                {toModernEnglish(formatCitation(s))}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {links.notableUses.length > 0 ? (
        <Section id="notable-uses" title="Notable uses">
          <PhraseList items={links.notableUses} />
        </Section>
      ) : null}

      {(links.counters.length > 0 || links.counterWeapons.length > 0) ? (
        <Section id="counters" title="Counters">
          <PhraseList items={links.counters} />
          {links.counterWeapons.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {links.counterWeapons.map((w) => (
                <li key={w.id}>
                  <Link
                    href={isKnowledgeWeapon(w) ? weaponHref(w) : entityHref(w)}
                    className="border-border/70 bg-card hover:border-saffron/40 inline-flex rounded-full border px-3 py-1.5 text-sm transition-divine"
                    prefetch
                  >
                    {displayEnglishName(w)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : null}

      {links.battles.length > 0 ? (
        <Section id="battles" title="Related battles">
          <ul className="space-y-2">
            {links.battles.map((b) => (
              <li key={b.id}>
                <Link
                  href={eventHref(b)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
                  prefetch
                >
                  <span className="flex items-center gap-2">
                    <Swords className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                    {displayEnglishName(b)}
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      {eventTypeLabel(b.event.eventType)}
                    </span>
                  </span>
                  <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <EntityChips
        id="related-characters"
        title="Related characters"
        entities={links.characters}
        extraHref={(e) => {
          if (!isCharacterEntity(e)) return null;
          const g = genealogyPersonHref(e);
          return g ? { href: g, label: "Genealogy" } : null;
        }}
      />

      {links.events.length > 0 ? (
        <Section id="events" title="Related events">
          <ul className="space-y-1.5">
            {links.events.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={eventHref(ev)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex w-full items-start justify-between rounded-lg border px-3 py-2.5 transition-divine"
                  prefetch
                >
                  <span>
                    <span className="text-sm font-medium">
                      {displayEnglishName(ev)}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-[11px]">
                      {eventTypeLabel(ev.event.eventType)}
                    </span>
                  </span>
                  <ArrowUpRight className="text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <EntityChips id="scriptures" title="Scriptures" entities={links.scriptures} />

      {links.verses.length > 0 ? (
        <Section id="verses" title="Related verses">
          <ul className="space-y-1.5">
            {links.verses.map((v) => (
              <li key={v.id}>
                <Link
                  href={v.href ?? entityHref(v.entity ?? weapon)}
                  className="border-border/70 bg-card hover:border-saffron/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-divine"
                  prefetch
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                    {toModernEnglish(v.label)}
                  </span>
                  <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {graphNeighbors.length > 0 ? (
        <Section id="kg-graph" title="Knowledge graph">
          <LazyEntityGraph root={weapon} neighbors={graphNeighbors} />
        </Section>
      ) : null}
    </div>
  );
}
