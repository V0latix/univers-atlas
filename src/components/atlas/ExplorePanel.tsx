"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { getBodyById, solarSystem } from "@/data/solar-system";
import { searchBodies } from "@/domain/search";
import { getAtlasCopy } from "@/i18n/atlas-copy";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyCard } from "./CelestialBodyCard";

export function ExplorePanel() {
  const [query, setQuery] = useState("");
  const [isMobileOpen, setMobileOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const selectedId = useAtlasStore((state) => state.selectedId);
  const selectAndOpenProfile = useAtlasStore(
    (state) => state.selectAndOpenProfile,
  );
  const locale = useAtlasStore((state) => state.locale);
  const copy = getAtlasCopy(locale);
  const results = searchBodies(query, solarSystem);
  const selectedBody = getBodyById(selectedId);

  useEffect(
    () =>
      useAtlasStore.subscribe((state, previousState) => {
        if (state.selectedId === previousState.selectedId) return;

        setQuery((currentQuery) =>
          searchBodies(currentQuery, solarSystem).some(
            (body) => body.id === state.selectedId,
          )
            ? currentQuery
            : "",
        );
      }),
    [],
  );

  const revealSelectedCard = useCallback(() => {
    const list = listRef.current;
    const selectedItem = selectedItemRef.current;
    if (!list || !selectedItem) return;

    const listRect = list.getBoundingClientRect();
    const selectedRect = selectedItem.getBoundingClientRect();
    const left =
      selectedRect.left < listRect.left || selectedRect.right > listRect.right
        ? selectedRect.left - listRect.left
        : 0;
    const top =
      selectedRect.top < listRect.top || selectedRect.bottom > listRect.bottom
        ? selectedRect.top - listRect.top
        : 0;

    if (left || top) {
      list.scrollBy({ left, top });
    }
  }, []);

  const selectBody = useCallback(
    (id: string) => {
      setMobileOpen(false);
      selectAndOpenProfile(id);
    },
    [selectAndOpenProfile],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    revealSelectedCard();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(revealSelectedCard);
    observer.observe(list);

    return () => observer.disconnect();
  }, [query, revealSelectedCard, selectedId]);

  return (
    <aside
      className="explore-panel"
      aria-label={copy.exploreAriaLabel}
      data-mobile-open={isMobileOpen}
    >
      <button
        type="button"
        className="explore-panel__mobile-trigger"
        aria-expanded={isMobileOpen}
        aria-controls="explore-panel-content"
        onClick={() => setMobileOpen((isOpen) => !isOpen)}
      >
        <span>
          <span>{copy.openExplorer}</span>
          <strong>{selectedBody?.name}</strong>
        </span>
        {isMobileOpen ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
      </button>
      <div id="explore-panel-content" className="explore-panel__content">
        <p>{copy.celestialIndex}</p>
        <h2>{copy.exploreWorlds}</h2>
        <label htmlFor="body-search">{copy.searchBodies}</label>
        <div className="search-field">
          <Search aria-hidden="true" size={16} />
          <input
            id="body-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p aria-live="polite">
          {selectedBody ? copy.selected(selectedBody.name) : ""}
        </p>
        {results.length > 0 ? (
          <ul ref={listRef} className="body-list">
            {results.map((body) => (
              <li
                key={body.id}
                ref={body.id === selectedId ? selectedItemRef : undefined}
              >
                <CelestialBodyCard
                  body={body}
                  selected={body.id === selectedId}
                  onSelect={selectBody}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="catalog-empty" role="status">
            <strong>{copy.noBodies}</strong>
            <span>{copy.noBodiesHint}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
