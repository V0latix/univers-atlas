"use client";

import { getBodyById } from "@/data/solar-system";
import { useAtlasStore } from "@/store/atlas-store";

export function FocusCard() {
  const selectedId = useAtlasStore((state) => state.selectedId);
  const setProfileOpen = useAtlasStore((state) => state.setProfileOpen);
  const isProfileOpen = useAtlasStore((state) => state.isProfileOpen);
  const selectedBody = getBodyById(selectedId);

  if (!selectedBody) return null;

  return (
    <section
      aria-label={`${selectedBody.name} focus`}
      aria-hidden={isProfileOpen}
      hidden={isProfileOpen}
    >
      <p>{selectedBody.kind}</p>
      <h2>{selectedBody.name}</h2>
      <p>{selectedBody.summary}</p>
      <button
        id={`profile-trigger-${selectedBody.id}`}
        type="button"
        disabled={isProfileOpen}
        onClick={() => setProfileOpen(true)}
      >
        Open {selectedBody.name} profile
      </button>
    </section>
  );
}
