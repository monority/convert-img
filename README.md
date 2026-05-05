# Convert images tool

<p align="center">
  <img src="./logo-convert.png" />
</p>

## Features
- Convert images in the `images/` folder
- Optimize and export converted images to the `optimized/` folder
- Support for modern formats (WebP, AVIF)
- **Parallel processing** with configurable concurrency limit
- **Smart cache**: avoids re-conversion if source file hasn't changed
- **Detailed statistics** (duration, file size savings, image count)
- **Flexible CLI options** for custom conversions
- Supported source formats: JPG, JPEG, PNG, TIFF, BMP, WebP, GIF

## Usage

1. Place your images to convert in the `images/` folder.
   - You can organize images in subfolders (e.g., `images/vacations/`, `images/projects/`).
   - The folder structure will be preserved in the `optimized/` output folder.

2. Run the conversion:

   ```bash
   ci [prefix] [options]
   ```

   - `[prefix]` (optional): base name for generated files (default: folder name).
     For example, to generate files named `vacations-1.webp`, `vacations-2.avif`, etc.:

   ```bash
   npm run ci vacations
   ```

### CLI Options

**Shortcuts (very short):**
- `-w N` : WebP quality (alias for `--webp-quality`)
- `-a N` : AVIF quality (alias for `--avif-quality`)
- `-W N` : Max width (alias for `--width`)
- `-n`   : Disable WebP (alias for `--no-webp`)
- `-A`   : Disable AVIF (alias for `--no-avif`)
- `-c N` : Parallel workers (alias for `--concurrency`)
- `-h`   : Show help (alias for `--help`)

**Long options:**
- `--webp-quality <0-100>` : WebP quality (default: 82)
- `--avif-quality <0-100>` : AVIF quality (default: 50)
- `--width <pixels>` : Maximum resize width (default: 2000)
- `--no-webp` : Disable WebP generation
- `--no-avif` : Disable AVIF generation
- `--concurrency <number>` : Number of parallel workers (default: 4)
- `--help` : Show this help

**Quick command:** `npm run ci` (or just `ci` after adding to PATH)

### Examples

```bash
# Show interactive menu
npm run ci

# Show help
npm run ci -- --help

# Conversion with custom WebP quality using shortcut
npm run ci -- -w 90

# Disable AVIF, set width to 1500px using shortcuts
npm run ci -- -n -W 1500

# 8 parallel workers
npm run ci -- -c 8

# Combination: prefix + options
npm run ci -- projet -w 85 -a 60 -W 1920

# Full custom configuration via interactive menu (option 2)
npm run ci
# then choose option 2 and follow prompts
```

3. Optimized images will be generated in the `optimized/` folder, preserving the original folder structure.

## Prerequisites
- Node.js installed on your machine
- Install dependencies via `npm install` (see `package.json`)

## Project Structure
- `convert-images.mjs` : Main conversion script
- `images/` : Source folder for images to convert (create subfolders as needed)
- `optimized/` : Output folder for optimized images (subfolder structure is preserved)

## Interactive Menu

Running `npm run ci` without arguments displays an interactive menu:

1. **Convert with default settings** - Uses built-in defaults (WebP + AVIF, q=82/50, width=2000, 4 workers)
2. **Configure conversion** - Step-by-step prompts for all settings (prefix, qualities, width, workers, enable/disable formats)
3. **Help** - Shows CLI help
4. **Quit** - Exit the program

Use **↑ ↓** arrow keys to navigate, **Enter** to select.

## License
This project is open source.

