# Univers Atlas — Caméra accompagnant l'astre et luminosité renforcée

**Date :** 2026-07-22  
**Repository :** `univers-atlas`

## Objectif

Après la sélection d'un astre, la caméra doit continuer d'accompagner sa
position simulée une fois le travelling terminé. La scène doit aussi rendre
tous les astres plus lisibles, sans écraser les textures ni surexposer le
Soleil.

## Expérience utilisateur

- La sélection conserve le travelling existant de 450 ms et sa distance de
  focalisation calculée selon le rayon de l'astre.
- À la fin de ce travelling, le point visé et la caméra gardent le même décalage
  par rapport à l'astre ; ils sont mis à jour à chaque image selon sa position
  orbitale courante. L'astre reste donc au centre de la vue pendant son
  déplacement.
- Un geste manuel sur les contrôles, ou l'application d'une vue `3D`, `Top` ou
  `Side`, annule ce suivi et restitue immédiatement le contrôle à l'utilisateur.
- L'éclairage ambiant et les sources de lumière de la scène sont relevés, avec
  une émission modérée pour les planètes et lunes. Les valeurs restent plus
  discrètes que celles du Soleil afin de préserver le contraste des textures.

## Architecture

1. `SelectedBodyFocus` conserve une transition initiale puis mémorise le
   décalage caméra/cible obtenu. Après la transition, il applique ce même
   décalage à la position vivante de l'astre à chaque frame.
2. Les signaux existants de manipulation (`focusRevision`) et de préréglage
   (`viewRevision`) restent la source unique d'annulation du suivi.
3. `AtlasScene` adapte les intensités des lumières de scène et
   `CelestialBodyMesh` ajuste l'émission par type d'astre. Aucune donnée
   astronomique, texture ou géométrie ne change.

## Vérification

- Un test de scène confirme qu'après le travelling la cible et la caméra se
  déplacent ensemble avec l'astre en mouvement.
- Les tests existants confirment que geste manuel et préréglage interrompent
  toujours le contrôle automatique.
- Les tests de rendu vérifient les valeurs d'intensité attendues ; lint, suite
  Vitest complète, build et test end-to-end sont exécutés avant le push.

## Hors périmètre

- Aucun changement de vitesse ou de modèle orbital.
- Aucun éclairage téléchargé, texture externe ou dépendance supplémentaire.
