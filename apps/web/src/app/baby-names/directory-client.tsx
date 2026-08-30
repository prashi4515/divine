"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BabyNameRecord } from "@divine/types";

interface DirectoryClientProps {
  initialNames: BabyNameRecord[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function BabyNameDirectoryClient({ initialNames }: DirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  const filteredNames = useMemo(() => {
    return initialNames.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.nameEn.toLowerCase().includes(q);
        const matchesDevanagari = item.nameSaDevanagari.includes(q);
        const matchesIAST = item.nameIAST.toLowerCase().includes(q);
        const matchesMeaning = item.meanings.primaryMeaning.toLowerCase().includes(q);
        const matchesAlt = item.alternateSpellings.some((alt) => alt.toLowerCase().includes(q));

        if (!matchesName && !matchesDevanagari && !matchesIAST && !matchesMeaning && !matchesAlt) {
          return false;
        }
      }

      // 2. A-Z Starting Letter
      if (selectedLetter && item.startingLetter.toUpperCase() !== selectedLetter) {
        return false;
      }

      // 3. Gender Filter
      if (selectedGender !== "all" && item.genderUsage !== selectedGender) {
        return false;
      }

      // 4. Origin Filter
      if (selectedOrigin !== "all") {
        const orig = item.primaryScripture.toLowerCase();
        if (selectedOrigin === "gita" && !orig.includes("gita")) return false;
        if (selectedOrigin === "mahabharata" && !orig.includes("mahabharata")) return false;
        if (selectedOrigin === "ramayana" && !orig.includes("ramayana")) return false;
        if (selectedOrigin === "vedic" && !orig.includes("veda") && !orig.includes("rigveda")) return false;
        if (selectedOrigin === "upanishad" && !orig.includes("upanishad")) return false;
        if (selectedOrigin === "purana" && !orig.includes("purana")) return false;
      }

      // 5. Theme Filter
      if (selectedTheme !== "all" && !item.themes.includes(selectedTheme)) {
        return false;
      }

      return true;
    });
  }, [initialNames, searchQuery, selectedLetter, selectedGender, selectedOrigin, selectedTheme]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLetter(null);
    setSelectedGender("all");
    setSelectedOrigin("all");
    setSelectedTheme("all");
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Control Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Sanskrit spelling (e.g. 'Tanay', 'अर्जुन'), meaning, or variant..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
          />
          <svg
            className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* A-Z Jump Bar */}
        <div className="flex flex-wrap gap-1 items-center justify-center pt-2 pb-1 border-t border-b border-zinc-100 dark:border-zinc-800/80">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedLetter === null
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            }`}
          >
            ALL
          </button>
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter === selectedLetter ? null : letter)}
              className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-md transition-colors ${
                selectedLetter === letter
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Multi-Facet Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Genders</option>
              <option value="boy">Boy Names</option>
              <option value="girl">Girl Names</option>
              <option value="unisex">Unisex Names</option>
            </select>
          </div>

          {/* Scripture Origin Filter */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Scripture Origin</label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Scriptures</option>
              <option value="gita">Bhagavad Gita</option>
              <option value="mahabharata">Mahabharata</option>
              <option value="ramayana">Ramayana</option>
              <option value="vedic">Vedic Literature</option>
              <option value="upanishad">Upanishads</option>
              <option value="purana">Puranas</option>
            </select>
          </div>

          {/* Theme Filter */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Theme / Meaning</label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Themes</option>
              <option value="courage">Courage &amp; Heroism</option>
              <option value="wisdom">Wisdom &amp; Knowledge</option>
              <option value="dharma">Dharma &amp; Righteousness</option>
              <option value="purity">Purity &amp; Light</option>
              <option value="divine">Divine &amp; Spiritual</option>
              <option value="peace">Peace &amp; Harmony</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between pt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredNames.length}</span> verified names
          </div>
          {(searchQuery || selectedLetter || selectedGender !== "all" || selectedOrigin !== "all" || selectedTheme !== "all") && (
            <button
              onClick={resetFilters}
              className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Directory High-Density Table / List View */}
      {filteredNames.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
          <p className="text-base text-zinc-600 dark:text-zinc-400 mb-2">No names match your current filter criteria.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Name &amp; Variants</th>
                  <th className="py-3.5 px-4">Devanagari (IAST)</th>
                  <th className="py-3.5 px-4">Gender</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Primary Scripture</th>
                  <th className="py-3.5 px-4 sm:px-6">Meaning Summary</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {filteredNames.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Name & Alternate Spellings */}
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-900 dark:text-zinc-50">
                      <Link href={`/baby-names/${item.slug}`} className="hover:text-amber-600 font-semibold">
                        {item.nameEn}
                      </Link>
                      {item.alternateSpellings.length > 0 && (
                        <div className="text-xs text-zinc-400 font-normal">
                          {item.alternateSpellings.join(", ")}
                        </div>
                      )}
                    </td>

                    {/* Devanagari & IAST */}
                    <td className="py-3.5 px-4 font-serif">
                      <div className="text-zinc-900 dark:text-zinc-100 font-bold">{item.nameSaDevanagari}</div>
                      <div className="text-xs text-zinc-500 font-sans">{item.nameIAST}</div>
                    </td>

                    {/* Gender Badge */}
                    <td className="py-3.5 px-4 capitalize">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          item.genderUsage === "boy"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : item.genderUsage === "girl"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                        }`}
                      >
                        {item.genderUsage}
                      </span>
                    </td>

                    {/* Primary Scripture */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-zinc-600 dark:text-zinc-400">
                      {item.primaryScripture}
                    </td>

                    {/* Meaning Summary */}
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-zinc-700 dark:text-zinc-300 max-w-xs sm:max-w-md">
                      <p className="line-clamp-2">{item.meanings.primaryMeaning}</p>
                    </td>

                    {/* Details Action Link */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/baby-names/${item.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        View
                        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
