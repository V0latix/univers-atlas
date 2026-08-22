import type { BodyKind, ViewMode } from "@/domain/types";

export const supportedLocales = ["fr", "en"] as const;

export type AtlasLocale = (typeof supportedLocales)[number];

type AtlasCopy = {
  language: string;
  languages: Record<AtlasLocale, string>;
  interactiveGuide: string;
  liveSimulation: string;
  trackedBodies: (count: number) => string;
  exploreAriaLabel: string;
  celestialIndex: string;
  exploreWorlds: string;
  searchBodies: string;
  selected: (name: string) => string;
  noBodies: string;
  noBodiesHint: string;
  bodyKinds: Record<BodyKind, string>;
  solarSystemStar: string;
  orbitDays: (value: string) => string;
  openExplorer: string;
  closeExplorer: string;
  viewControls: string;
  viewNames: Record<ViewMode, string>;
  pauseSimulation: string;
  resumeSimulation: string;
  simulationSpeed: string;
  resetCamera: string;
  sceneFilters: string;
  orbitPaths: string;
  daysPerSecond: (count: number) => string;
  profile: (name: string) => string;
  openProfile: (name: string) => string;
  closeProfile: string;
  classification: string;
  parentBody: string;
  atmosphere: string;
  composition: string;
  rotation: string;
  radius: string;
  orbitalPeriod: string;
  diameter: string;
  surfaceGravity: string;
  orbitalVelocity: string;
  distanceFromSun: string;
  systemRole: string;
  catalogueCoverage: string;
  notableFacts: string;
  missions: string;
  source: string;
  unavailable: string;
  centralStar: string;
  primaryPlanet: string;
  moonOf: (parent: string) => string;
  earthYears: (value: string) => string;
  notableAndMissions: (facts: number, missions: number) => string;
  illustration: (name: string) => string;
  rings: (name: string) => string;
  sceneAriaLabel: string;
  sceneHelpLabel: string;
  sceneHelp: string;
  webglUnavailable: string;
  webglFallback: string;
};

export const atlasCopy: Record<AtlasLocale, AtlasCopy> = {
  fr: {
    language: "Langue",
    languages: { fr: "FR", en: "EN" },
    interactiveGuide: "Guide planétaire interactif",
    liveSimulation: "Simulation en direct",
    trackedBodies: (count) => `${count} astres suivis`,
    exploreAriaLabel: "Explorer le Système solaire",
    celestialIndex: "Index céleste",
    exploreWorlds: "Explorer les mondes",
    searchBodies: "Rechercher un astre",
    selected: (name) => `Astre sélectionné : ${name}`,
    noBodies: "Aucun astre trouvé",
    noBodiesHint: "Essaie un autre nom ou une autre classification.",
    bodyKinds: { star: "Étoile", planet: "Planète", moon: "Lune" },
    solarSystemStar: "Étoile du Système solaire",
    orbitDays: (value) => `Orbite de ${value} jours`,
    openExplorer: "Explorer les astres",
    closeExplorer: "Fermer l’explorateur",
    viewControls: "Contrôles de la vue",
    viewNames: { "3d": "Vue 3D", top: "Vue de dessus", side: "Vue latérale" },
    pauseSimulation: "Mettre la simulation en pause",
    resumeSimulation: "Reprendre la simulation",
    simulationSpeed: "Vitesse de la simulation",
    resetCamera: "Réinitialiser la caméra",
    sceneFilters: "Filtres de la scène",
    orbitPaths: "Orbites",
    daysPerSecond: (count) => `${count} jours par seconde`,
    profile: (name) => `Profil de ${name}`,
    openProfile: (name) => `Ouvrir le profil de ${name}`,
    closeProfile: "Fermer le profil",
    classification: "Classification",
    parentBody: "Astre parent",
    atmosphere: "Atmosphère",
    composition: "Composition",
    rotation: "Rotation",
    radius: "Rayon",
    orbitalPeriod: "Période orbitale",
    diameter: "Diamètre",
    surfaceGravity: "Gravité de surface",
    orbitalVelocity: "Vitesse orbitale",
    distanceFromSun: "Distance au Soleil",
    systemRole: "Rôle dans le système",
    catalogueCoverage: "Contenu du catalogue",
    notableFacts: "Faits remarquables",
    missions: "Missions",
    source: "Source",
    unavailable: "Donnée indisponible",
    centralStar: "Étoile centrale",
    primaryPlanet: "Planète principale",
    moonOf: (parent) => `Lune de ${parent}`,
    earthYears: (value) => `${value} années terrestres`,
    notableAndMissions: (facts, missions) => `${facts} faits remarquables · ${missions} missions`,
    illustration: (name) => `Illustration de ${name}`,
    rings: (name) => `Anneaux de ${name}`,
    sceneAriaLabel: "Scène interactive du Système solaire",
    sceneHelpLabel: "Aide des contrôles de la scène",
    sceneHelp: "Caméra : clic droit pour orbiter · molette ou pincement pour zoomer · clic gauche pour déplacer la vue",
    webglUnavailable: "La vue 3D n’est pas disponible dans ce navigateur.",
    webglFallback: "Tu peux tout de même rechercher l’atlas et explorer la fiche de chaque astre.",
  },
  en: {
    language: "Language",
    languages: { fr: "FR", en: "EN" },
    interactiveGuide: "Interactive planetary guide",
    liveSimulation: "Live simulation",
    trackedBodies: (count) => `${count} tracked bodies`,
    exploreAriaLabel: "Explore the Solar System",
    celestialIndex: "Celestial index",
    exploreWorlds: "Explore worlds",
    searchBodies: "Search celestial bodies",
    selected: (name) => `${name} selected`,
    noBodies: "No celestial bodies found",
    noBodiesHint: "Try another name or classification.",
    bodyKinds: { star: "Star", planet: "Planet", moon: "Moon" },
    solarSystemStar: "Solar System star",
    orbitDays: (value) => `${value}-day orbit`,
    openExplorer: "Explore celestial bodies",
    closeExplorer: "Close explorer",
    viewControls: "View controls",
    viewNames: { "3d": "3D view", top: "Top view", side: "Side view" },
    pauseSimulation: "Pause simulation",
    resumeSimulation: "Resume simulation",
    simulationSpeed: "Simulation speed",
    resetCamera: "Reset camera",
    sceneFilters: "Scene filters",
    orbitPaths: "Orbits",
    daysPerSecond: (count) => `${count} days per second`,
    profile: (name) => `${name} profile`,
    openProfile: (name) => `Open ${name} profile`,
    closeProfile: "Close profile",
    classification: "Classification",
    parentBody: "Parent body",
    atmosphere: "Atmosphere",
    composition: "Composition",
    rotation: "Rotation",
    radius: "Radius",
    orbitalPeriod: "Orbital period",
    diameter: "Diameter",
    surfaceGravity: "Surface gravity",
    orbitalVelocity: "Orbital velocity",
    distanceFromSun: "Distance from the Sun",
    systemRole: "System role",
    catalogueCoverage: "Catalogue coverage",
    notableFacts: "Notable facts",
    missions: "Missions",
    source: "Source",
    unavailable: "Data unavailable",
    centralStar: "Central star",
    primaryPlanet: "Primary planet",
    moonOf: (parent) => `Moon of ${parent}`,
    earthYears: (value) => `${value} Earth years`,
    notableAndMissions: (facts, missions) => `${facts} notable facts · ${missions} missions`,
    illustration: (name) => `${name} illustration`,
    rings: (name) => `${name} rings`,
    sceneAriaLabel: "Interactive Solar System scene",
    sceneHelpLabel: "Scene controls help",
    sceneHelp: "Camera: right-drag to orbit · scroll or pinch to zoom · left-drag to pan",
    webglUnavailable: "3D view is unavailable in this browser.",
    webglFallback: "You can still search the atlas and explore every celestial body’s profile.",
  },
};

export const getAtlasCopy = (locale: AtlasLocale) => atlasCopy[locale];
