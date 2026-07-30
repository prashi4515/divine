"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { SearchBar } from "./search-bar";

type SearchHeroProps = {
  initialQuery: string;
  onSubmit: (query: string) => void;
};

/**
 * Prominent search bar for the /search page: SearchBar (handles Enter,
 * autocomplete, ghost completion) sits next to a saffron "Search" button
 * that submits whatever the user has currently typed. Wrapped in a real
 * <form> so both Enter and the button trigger the same handler.
 */
export function SearchHero({ initialQuery, onSubmit }: SearchHeroProps) {
  // Mirror SearchBar's internal `value` at the page level so the Search
  // button can submit the current draft even if it hasn't been "entered" yet.
  const draftRef = React.useRef(initialQuery);

  React.useEffect(() => {
    draftRef.current = initialQuery;
  }, [initialQuery]);

  return (
    <form
      role="search"
      className="mb-8 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draftRef.current.trim());
      }}
    >
      <div className="flex-1">
        <SearchBar
          initialQuery={initialQuery}
          autoFocus={!initialQuery}
          onSubmit={(q) => {
            draftRef.current = q;
            onSubmit(q);
          }}
          onDraftChange={(q) => {
            draftRef.current = q;
          }}
        />
      </div>
      <button
        type="submit"
        className="cta-saffron inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white shadow-sm transition-divine hover:shadow-md sm:h-auto sm:px-7"
      >
        <Search className="size-4" aria-hidden />
        <span>Search</span>
      </button>
    </form>
  );
}
