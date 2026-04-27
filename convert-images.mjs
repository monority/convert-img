import fg from "fast-glob";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const CONFIG = {
    inputDir: "./images",
    outputDir: "./optimized",

    generateWebp: true,
    generateAvif: true,

    webpQuality: 82,
    avifQuality: 50,

    resizeWidth: 2000
};

async function ensureDir(dir) {
    await fs.mkdir(dir, {
        recursive: true
    });
}

function getFolderName(file) {

    const relative = path.relative(
        CONFIG.inputDir,
        file
    );

    const parts = relative.split(path.sep);

    if (parts.length === 1) {
        return "image";
    }

    return parts[0];
}
async function exists(file) {
    try {
        await fs.access(file);
        return true;
    } catch {
        return false;
    }
}
async function convertFile(file, folderName, outputName) {

    const targetDir = path.join(
        CONFIG.outputDir,
        folderName
    );

    await ensureDir(targetDir);

    const webpPath = path.join(
        targetDir,
        `${outputName}.webp`
    );

    const avifPath = path.join(
        targetDir,
        `${outputName}.avif`
    );

    const image = sharp(file).resize({
        width: CONFIG.resizeWidth,
        fit: "inside",
        withoutEnlargement: true
    });

    // WEBP
    if (CONFIG.generateWebp) {

        if (await exists(webpPath)) {
            console.log(`↷ skip ${folderName}/${outputName}.webp`);
        } else {
            await image
                .clone()
                .webp({
                    quality: CONFIG.webpQuality,
                    effort: 6
                })
                .toFile(webpPath);

            console.log(`✓ ${folderName}/${outputName}.webp`);
        }
    }

    // AVIF
    if (CONFIG.generateAvif) {

        if (await exists(avifPath)) {
            console.log(`↷ skip ${folderName}/${outputName}.avif`);
        } else {
            await image
                .clone()
                .avif({
                    quality: CONFIG.avifQuality,
                    effort: 7
                })
                .toFile(avifPath);

            console.log(`✓ ${folderName}/${outputName}.avif`);
        }
    }
}
async function main() {

    const files = await fg(
        `${CONFIG.inputDir}/**/*.{jpg,jpeg,png}`
    );

    const counters = {};

    for (const file of files) {

        const folderName = getFolderName(file);

        if (!counters[folderName]) {
            counters[folderName] = 1;
        }

        const filename =
            `${folderName}-${counters[folderName]}`;

        counters[folderName]++;

        await convertFile(
            file,
            folderName,
            filename
        );
    }

    console.log("\nDone.");
}

main().catch(console.error);