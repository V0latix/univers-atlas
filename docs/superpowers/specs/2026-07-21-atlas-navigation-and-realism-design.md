# Univers Atlas — Navigation libre et profils directs

**Date :** 2026-07-21  
**Repository :** `univers-atlas`  
**Scope :** interaction de scène, fidélité visuelle des astres et panneau de profil.

## Objectif

L’exploration doit fonctionner comme une carte spatiale usuelle : la caméra se
déplace librement par glisser-déposer et zoome à la molette. Sélectionner un
astre, dans la scène comme dans le catalogue, doit ouvrir immédiatement son
profil détaillé à droite. Lorsque l’utilisateur sélectionne ensuite un autre
astre, le même panneau reste ouvert et affiche les nouvelles données.

La vue doit également distinguer correctement les corps à anneaux, conserver
des orbites circulaires dans la projection de dessus, et mieux détacher les
astres du fond sombre.

## Expérience utilisateur

### Sélection et profil

- La sélection dans le catalogue ou dans la scène exécute une seule action :
  sélectionner l’identifiant et ouvrir le panneau de profil.
- Le profil se place à droite sur grand écran. Il remplace la carte compacte
  `FocusCard`, qui est retirée de cette expérience.
- Si le panneau est déjà ouvert, une nouvelle sélection remplace son contenu
  sans le fermer ni déplacer le focus.
- Le bouton de fermeture reste accessible. Après fermeture, une nouvelle
  sélection rouvre le profil ; le panneau ne se rouvre pas de lui-même sans
  sélection explicite.
- Sur mobile, le profil conserve sa disposition en flux existante, mais le
  même comportement automatique est appliqué.

### Navigation de scène

- La scène utilise des contrôles orbitaux avec zoom à la molette et panorama
  par glisser-déposer ; les gestes tactiles équivalents restent disponibles.
- Les préréglages de vue `top`, `side` et `3d` déterminent une orientation et
  une distance de départ. Après leur application, l’utilisateur garde la main
  sur la caméra.
- La sélection continue à être possible sans que le geste de déplacement ne
  soit interprété comme un clic.
- La caméra est bornée à des distances minimales et maximales appropriées à la
  scène, afin d’éviter de traverser les astres ou de quitter le système.
- `prefers-reduced-motion` ne désactive pas les contrôles manuels ; il évite
  uniquement les transitions automatiques non nécessaires.

### Géométrie et lisibilité

- Les orbites planétaires et leurs positions utilisent un même plan circulaire
  dans l’espace. La vue `top` ne compresse plus un axe, donc les trajectoires y
  apparaissent rondes.
- Les miniatures de catalogue ne montrent un anneau que pour Saturne et les
  éventuels corps explicitement configurés comme annelés. Les autres miniatures
  utilisent une surface et une silhouette propres à leur type.
- Les meshes 3D ajoutent des caractéristiques procédurales légères : bandes
  atmosphériques pour les géantes gazeuses, variation rocheuse pour les
  planètes telluriques et les lunes, halo solaire, et anneaux pour Saturne.
  Aucun média externe ni nouvelle dépendance n’est requis.
- Le fond, l’éclairage ambiant et les matériaux sont réglés pour produire une
  séparation visuelle plus forte entre les astres, les trajectoires et le fond,
  sans perdre les détails des surfaces claires.

## Architecture

1. Le store expose une action de sélection destinée aux interactions utilisateur
   qui met à jour `selectedId` et `isProfileOpen` simultanément. Les réinitiali-
   sations et la fermeture restent des actions séparées.
2. `CelestialBodyMesh` et `CelestialBodyCard` appellent cette action. Les vues
   qui n’ont besoin que de lire la sélection restent inchangées.
3. `ProfilePanel` reste l’unique propriétaire du rendu détaillé et lit les
   données de l’astre sélectionné. Il est monté quand `isProfileOpen` est vrai,
   puis se met naturellement à jour lorsque `selectedId` change.
4. `SceneCanvas` installe les contrôles de caméra. `AtlasScene` conserve le
   calcul du temps et des positions ; il ne force plus la caméra à chaque frame.
   Un composant dédié synchronise uniquement les préréglages de vue.
5. Un attribut de présentation des anneaux est ajouté aux données de l’astre
   lorsque nécessaire, afin que les meshes et miniatures partagent la même
   source de vérité.
6. Les fonctions de position et de tracé d’orbite utilisent une constante de
   plan commune égale à une (sans écrasement) pour garantir la circularité en
   vue du dessus.

## Données affichées dans le profil

Le profil conserve le résumé, la classification, le parent, l’atmosphère, la
composition, la température, la rotation, la période orbitale, le diamètre, la
gravité, la vitesse orbitale et la distance au Soleil. Il est enrichi avec des
valeurs calculées à partir des données existantes, lorsque elles sont définies :

- rayon (dérivé du diamètre) ;
- distance au Soleil en unités astronomiques ;
- durée orbitale en années terrestres ;
- catégorie dynamique (astre central, planète principale ou satellite de son
  parent) ;
- nombre de faits et de missions documentés.

Les valeurs indisponibles utilisent le libellé existant « Data unavailable ».

## Erreurs, accessibilité et limites

- Le profil conserve son rôle de dialogue non modal, son libellé, son bouton de
  fermeture, la touche Échap et la restitution du focus lors d’une fermeture.
- Un changement de sélection alors que le panneau est ouvert ne vole pas le
  focus au contrôle actuellement utilisé.
- Les clics sur les meshes empêchent toujours leur propagation afin de ne pas
  interférer avec les interactions de caméra.
- Les contrôles de caméra sont configurés sans inertie non sollicitée ; les
  limites de zoom empêchent les états visuellement incohérents.
- Le fallback WebGL reste inchangé et exploitable.

## Vérification

- Tests unitaires du store : sélectionner un astre ouvre le profil et une
  seconde sélection met à jour l’identifiant sans fermer le profil.
- Tests de composants : le profil s’ouvre après sélection depuis une carte et
  affiche les champs enrichis ; Échap et fermeture restent accessibles.
- Tests de domaine : les coordonnées et sommets d’orbite restent circulaires
  dans le plan `x/z`.
- Tests de scène : les contrôles de caméra sont présents et les préréglages de
  vue sont appliqués sans reprendre le contrôle après un geste utilisateur.
- Validation finale : lint, tests unitaires, build et contrôle visuel desktop
  et mobile de l’ouverture du profil, du zoom, du panorama, du contraste et de
  Saturne annelée.

## Hors périmètre

- Textures photographiques, téléchargées ou hébergées par un tiers.
- Modification de la précision scientifique ou ajout de nouveaux astres.
- Simulation n-corps, inclinaisons orbitales réelles et échelles physiques.
- Changement de langue ou de déploiement.
