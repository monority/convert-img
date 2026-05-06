<div align="center">

<img src="./logo-convert.svg" width="120" style="margin-bottom: 16px" />

# Convert images tool

*A high-performance CLI tool for batch image conversion and optimization with modern format support.*

</div>

---

## Features

- Convert images from the `images/` folder
- Optimize and export to modern formats (WebP, AVIF)
- Parallel processing with configurable concurrency
- Smart cache to skip unchanged files
- Detailed statistics (duration, savings, file count)
- Flexible CLI options for custom conversions
- Supports: JPG, JPEG, PNG, TIFF, BMP, WebP, GIF

---

## Installation

```bash
npm install
```

---

## Usage

### Quick start

Place images in the `images/` folder (subfolders supported), then run:

```bash
npm run ci [prefix] [options]
```

Images are exported to the `optimized/` folder, preserving the original folder structure.

---

## CLI Options

### Shortcuts

| Option | Description |
|--------|-------------|
| `-w N` | WebP quality (0–100) |
| `-a N` | AVIF quality (0–100) |
| `-W N` | Max width in pixels |
| `-n`   | Disable WebP |
| `-A`   | Disable AVIF |
| `-c N` | Parallel workers |
| `-h`   | Show help |

### Long options

| Option | Default | Description |
|--------|---------|-------------|
| `--webp-quality` | 82 | WebP quality (0–100) |
| `--avif-quality` | 50 | AVIF quality (0–100) |
| `--width`        | 2000 | Maximum resize width |
| `--no-webp`      | — | Disable WebP generation |
| `--no-avif`      | — | Disable AVIF generation |
| `--concurrency`  | 4 | Number of parallel workers |
| `--help`         | — | Show help |

---

## Examples

```bash
# Show interactive menu
npm run ci

# Show help
npm run ci -- --help

# Custom WebP quality
npm run ci -- -w 90

# Disable AVIF, set width to 1500px
npm run ci -- -n -W 1500

# 8 parallel workers
npm run ci -- -c 8

# Combination: prefix + options
npm run ci -- projet -w 85 -a 60 -W 1920
```

---

## Interactive Menu

Run `npm run ci` without arguments to access the interactive menu:

1. **Convert with default settings** — Uses built-in defaults
2. **Configure conversion** — Step-by-step prompts for all settings
3. **Help** — Shows CLI help
4. **Quit** — Exit the program

Navigate with **↑ ↓** arrow keys, **Enter** to select.

---

## Project Structure

```
convert-img/
├── convert-images.mjs   # Main conversion script
├── images/              # Source folder for images (create subfolders as needed)
├── optimized/           # Output folder for optimized images
└── package.json         # Dependencies and scripts
```

---

## License

Open source.
