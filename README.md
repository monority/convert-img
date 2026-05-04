# Convert Images Script

Ce projet contient un script Node.js pour convertir et optimiser des images.

## Fonctionnalités
- Conversion d'images dans le dossier `images/`
- Optimisation et export des images converties dans le dossier `optimized/`
- Prise en charge des formats modernes (WebP, AVIF)
- **Traitement parallèle** avec limite de concurrence configurable
- **Cache intelligent** : évite les re-conversions si le fichier source n'a pas changé
- **Rapport de statistiques** détaillé (temps, gain de taille, nombre d'images)
- **Options CLI flexibles** pour personnaliser la conversion
- Formats source supportés : JPG, JPEG, PNG, TIFF, BMP, WebP, GIF


## Utilisation

1. Place tes images à convertir dans le dossier `images/`.
  - Tu peux organiser tes images dans des sous-dossiers (ex : `images/vacances/`, `images/projets/`).
  - La structure des dossiers sera conservée dans le dossier `optimized/` lors de la conversion.

2. Exécute le script avec la commande suivante :

   ```bash
   node convert-images.mjs [prefix] [options]
   ```

   - `[prefix]` (optionnel) : permet de choisir le nom de base des images générées (par défaut : nom du dossier).
     Par exemple, pour générer des fichiers nommés `vacances-1.webp`, `vacances-2.avif`, etc. :

   ```bash
   node convert-images.mjs vacances
   ```

### Options CLI

- `--webp-quality <0-100>` : Qualité WebP (défaut : 82)
- `--avif-quality <0-100>` : Qualité AVIF (défaut : 50)
- `--width <pixels>` : Largeur maximale de redimensionnement (défaut : 2000)
- `--no-webp` : Désactiver la génération WebP
- `--no-avif` : Désactiver la génération AVIF
- `--concurrency <nombre>` : Nombre de workers parallèles (défaut : 4)

### Exemples

```bash
# Conversion avec préfixe personnalisé
node convert-images.mjs vacances

# Conversion avec qualité WebP personnalisée
node convert-images.mjs --webp-quality 90

# Conversion sans AVIF, avec largeur 1500px
node convert-images.mjs --no-avif --width 1500

# Conversion avec 8 workers parallèles
node convert-images.mjs --concurrency 8

# Combinaison d'options
node convert-images.mjs projet --webp-quality 85 --avif-quality 60 --width 1920
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
