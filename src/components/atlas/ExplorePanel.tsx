"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { getBodyById, solarSystem } from "@/data/solar-system";
import { searchBodies } from "@/domain/search";
import { useAtlasStore } from "@/store/atlas-store";

import { CelestialBodyCard } from "./CelestialBodyCard";

export function ExplorePanel() {
  const [query, setQuery] = useState("");
  const selectedId = useAtlasStore((state) => state.selectedId);
  const selectBody = useAtlasStore((state) => state.selectBody);
  const results = searchBodies(query, solarSystem);
  const selectedBody = getBodyById(selectedId);

  return (
    <aside className="explore-panel" aria-label="Explore the Solar System">
      <p>Celestial index</p>
      <h2>Explore worlds</h2>
      <label htmlFor="body-search">Search celestial bodies</label>
      <div>
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
        <ul className="body-list">
          {results.map((body) => (
            <li key={body.id}>
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
          <strong>No celestial bodies found</strong>
          <span>Try another name or classification.</span>
        </div>
      )}
    </aside>
  );
}
