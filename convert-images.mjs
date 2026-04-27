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
async function convertFile(
    file,
    folderName,
    outputName
) {

    const targetDir = path.join(
        CONFIG.outputDir,
        folderName
    );

    await ensureDir(targetDir);

    const image = sharp(file)
        .resize({
            width: CONFIG.resizeWidth,
            fit: "inside",
            withoutEnlargement: true
        });

    if (CONFIG.generateWebp) {

        await image
            .clone()
            .webp({
                quality: CONFIG.webpQuality,
                effort: 6
            })
            .toFile(
                path.join(
                    targetDir,
                    `${outputName}.webp`
                )
            );

        console.log(
            `✓ ${folderName}/${outputName}.webp`
        );
    }

    if (CONFIG.generateAvif) {

        await image
            .clone()
            .avif({
                quality: CONFIG.avifQuality,
                effort: 7
            })
            .toFile(
                path.join(
                    targetDir,
                    `${outputName}.avif`
                )
            );

        console.log(
            `✓ ${folderName}/${outputName}.avif`
        );
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