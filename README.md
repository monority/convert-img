# Convert Images Script

Ce projet contient un script Node.js pour convertir et optimiser des images.

## Fonctionnalités
- Conversion d'images dans le dossier `images/`
- Optimisation et export des images converties dans le dossier `optimized/`
- Prise en charge des formats modernes (ex : AVIF)


## Utilisation

1. Place tes images à convertir dans le dossier `images/`.
  - Tu peux organiser tes images dans des sous-dossiers (ex : `images/vacances/`, `images/projets/`).
  - La structure des dossiers sera conservée dans le dossier `optimized/` lors de la conversion.
2. Exécute le script avec la commande suivante :

   ```bash
   node convert-images.mjs [prefix]
   ```

   - `[prefix]` (optionnel) : permet de choisir le nom de base des images générées (par défaut : `image`).
     Par exemple, pour générer des fichiers nommés `vacances-1.webp`, `vacances-2.avif`, etc. :

   ```bash
   node convert-images.mjs vacances
   ```

3. Les images optimisées seront générées dans le dossier `optimized/`, en respectant la structure des dossiers d'origine.

## Prérequis
- Node.js installé sur ta machine
- Dépendances installées via `npm install` (voir `package.json`)


## Structure du projet
- `convert-images.mjs` : script principal de conversion
- `images/` : dossier source des images à convertir (tu peux créer des sous-dossiers)
- `optimized/` : dossier de sortie des images optimisées (la structure des sous-dossiers est conservée)

## Licence
Ce projet est open source.
