"use client";

import { useState } from "react";

import { getBodyById, solarSystem } from "@/data/solar-system";
import { searchBodies } from "@/domain/search";
import { useAtlasStore } from "@/store/atlas-store";

export function ExplorePanel() {
  const [query, setQuery] = useState("");
  const selectedId = useAtlasStore((state) => state.selectedId);
  const selectBody = useAtlasStore((state) => state.selectBody);
  const results = searchBodies(query, solarSystem);
  const selectedBody = getBodyById(selectedId);

  return (
    <aside aria-label="Explore the Solar System">
      <label htmlFor="body-search">Search celestial bodies</label>
      <input
        id="body-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p aria-live="polite">
        {selectedBody ? `${selectedBody.name} selected` : ""}
      </p>
      <ul>
        {results.map((body) => (
          <li key={body.id}>
            <button type="button" onClick={() => selectBody(body.id)}>
              {body.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
