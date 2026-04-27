import fg from "fast-glob";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const prefix = process.argv[2] || "image";

const CONFIG = {
    inputDir: "./images",
    outputDir: "./optimized",

    generateWebp: true,
    generateAvif: true,

    webpQuality: 82,
    avifQuality: 50
};

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function convertFile(file, index) {

    const number = index + 1;

    const baseName = `${prefix}-${number}`;

    await ensureDir(CONFIG.outputDir);

    if (CONFIG.generateWebp) {
        await sharp(file)
            .resize({
                width: 2000,
                fit: "inside",
                withoutEnlargement: true
            })
            .webp({
                quality: CONFIG.webpQuality,
                effort: 6
            })
            .toFile(
                path.join(
                    CONFIG.outputDir,
                    `${baseName}.webp`
                )
            );

        console.log(`✓ ${baseName}.webp`);
    }

    if (CONFIG.generateAvif) {
        await sharp(file)
            .resize({
                width: 2000,
                fit: "inside",
                withoutEnlargement: true
            })
            .avif({
                quality: CONFIG.avifQuality,
                effort: 7
            })
            .toFile(
                path.join(
                    CONFIG.outputDir,
                    `${baseName}.avif`
                )
            );

        console.log(`✓ ${baseName}.avif`);
    }
}

async function main() {

    const files = await fg(
        `${CONFIG.inputDir}/**/*.{jpg,jpeg,png}`
    );

    for (const [index, file] of files.entries()) {
        await convertFile(file, index);
    }

    console.log("Done.");
}

main().catch(console.error);