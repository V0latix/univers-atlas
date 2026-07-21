# Univers Atlas — Navigation focalisée et astres réalistes

**Date :** 2026-07-21  
**Repository :** `univers-atlas`  
**Scope :** navigation de la scène, rendu local des astres et panneau de profil.

## Objectif

L’atlas doit permettre une exploration directe du système solaire : la molette
zoome, le clic gauche effectue un panorama, le clic droit fait orbiter la
caméra. La plage de zoom est élargie afin d’observer les petits astres. Quand
un astre est sélectionné, la caméra réalise un court travelling fluide vers
lui, sans reprendre le contrôle après ce mouvement.

Chaque astre gagne un rendu local plus reconnaissable. Les textures restent
procédurales et générées dans le navigateur ; aucun média distant, nouvelle
dépendance ou téléchargement n’est ajouté. Le profil affiché à droite inclut
un grand portrait de l’astre, tandis que son en-tête reste entièrement opaque
et fixé en haut de la carte pendant le défilement.

## Expérience utilisateur

### Navigation et focalisation

- Les contrôles conservent le panorama au clic gauche, l’orbite au clic droit,
  le zoom à la molette et les gestes tactiles équivalents.
- La distance minimale de la caméra est réduite de `8` à `1.5` unités ; la
  distance maximale passe à `220` unités. Les limites empêchent néanmoins la
  caméra de traverser le centre de la scène ou de perdre le système solaire.
- Une sélection depuis le catalogue ou la scène lance une transition de caméra
  de 450 ms vers l’astre. Le point visé rejoint la position simulée de l’astre
  et la distance finale est dérivée de son rayon puis bornée : les petites lunes
  deviennent observables sans que le Soleil remplisse excessivement l’écran.
- La transition est annulée dès qu’un geste de caméra démarre. Elle est omise
  lorsque `prefers-reduced-motion` est actif ; la cible est alors mise à jour
  immédiatement.
- Les boutons `3D`, `Top` et `Side` gardent leur rôle de préréglage et restent
  disponibles après une focalisation.

### Rendu des astres

- Un générateur de texture sur `canvas` produit, de manière déterministe, des
  cartes de couleur et de relief légères pour chaque famille : roche et cratères
  pour les corps telluriques/lunes, continents et nuages pour la Terre, bandes
  et tempête pour Jupiter/Saturne, teintes nuageuses pour Vénus/Titan, halo et
  granulation pour le Soleil.
- Les matériaux utilisent ces textures locales, un éclairage cohérent et les
  halos/atmosphères existants. Les données scientifiques, les tailles de mise
  en scène et les orbites restent inchangées.
- Saturne est rendue par trois couches : anneaux arrière, globe, anneaux avant.
  Les deux demi-anneaux emploient une transparence et plusieurs bandes glacées.
  La partie antérieure reste visiblement devant le globe.

### Profil à droite

- Le haut du profil devient un en-tête compact « portrait » : grande vignette
  de l’astre, type, nom et fermeture. Le portrait réutilise les paramètres de
  présentation (couleur, bandes, anneaux) plutôt qu’une image distante.
- L’en-tête est `sticky` jusqu’aux bords intérieurs de la carte, avec un fond
  opaque et une ombre basse. Le texte défilant ne peut donc plus devenir visible
  derrière le titre ou le portrait.
- Le contenu scientifique et l’accessibilité existante (dialogue non modal,
  Échap, retour du focus) sont conservés. Sur tablette et mobile, la carte reste
  dans le flux avec un en-tête non superposé.

## Architecture

1. `SceneCanvas` possède les contrôles et transmet leur référence ainsi que le
   signal de début d’interaction à `AtlasScene`.
2. `AtlasScene` conserve le calcul de positions. Un contrôleur de focalisation
   isolé observe une sélection et anime position/cible sur une courte durée ;
   il s’arrête à la première manipulation manuelle.
3. Un module de présentation produit les textures `CanvasTexture` et les
   paramètres associés. `CelestialBodyMesh` reste le propriétaire du mesh et
   monte les géométries d’anneaux arrière et avant uniquement pour Saturne.
4. Un composant de portrait partagé rend la vignette du profil à partir des
   mêmes métadonnées de présentation. `ProfilePanel` conserve les données et
   la logique d’accessibilité, tandis que CSS gère son entête collant opaque.

## Erreurs, accessibilité et performances

- La génération de texture est mémoïsée par corps et libère les textures lors
  du démontage. Les canvases n’atteignent pas le DOM visible.
- Un clic de mesh conserve `stopPropagation`; il ne déclenche pas un panorama.
- Le profil ne masque aucun contrôle clavier, et un mouvement manuel interrompt
  la focalisation au lieu de lutter contre l’utilisateur.
- Les matériaux possèdent une couleur de secours pour les environnements WebGL
  où une texture ne pourrait pas être créée. Le fallback WebGL de l’application
  reste inchangé.

## Vérification

- Tests de contrôles : mapping des boutons souris, limites de zoom élargies et
  annulation du focus après le début d’un geste.
- Tests de focalisation : distance finale bornée, transition active après une
  sélection et mise à jour immédiate en mouvement réduit.
- Tests de présentation : les types de texture attendus sont associés aux
  corps, Saturne rend deux demi-anneaux et la partie avant est ordonnée après
  le globe.
- Tests de profil : portrait présent, en-tête identifié et contenu toujours
  accessible après défilement.
- Vérification finale : lint, Vitest, Playwright, build et inspection desktop
  et mobile de la navigation, du profil, des petits astres et de Saturne.

## Hors périmètre

- Textures photographiques, téléchargées ou hébergées par un tiers.
- Simulation physique, échelle réelle, inclinaisons orbitales ou nouveaux
  astres/données scientifiques.
- Localisation et changement de déploiement.
