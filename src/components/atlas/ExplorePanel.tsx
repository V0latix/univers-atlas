"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { getBodyById, solarSystem } from "@/data/solar-system";
import { searchBodies } from "@/domain/search";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyCard } from "./CelestialBodyCard";

export function ExplorePanel() {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);
  const selectedId = useAtlasStore((state) => state.selectedId);
  const selectAndOpenProfile = useAtlasStore(
    (state) => state.selectAndOpenProfile,
  );
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
    <aside className="explore-panel" aria-label="Explore the Solar System">
      <p>Celestial index</p>
      <h2>Explore worlds</h2>
      <label htmlFor="body-search">Search celestial bodies</label>
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
        {selectedBody ? `${selectedBody.name} selected` : ""}
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
                onSelect={selectAndOpenProfile}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="catalog-empty" role="status">
          <strong>No celestial bodies found</strong>
          <span>Try another name or classification.</span>
        </div>
      )}
    </aside>
  );
}
