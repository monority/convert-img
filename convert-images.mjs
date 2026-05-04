import fg from "fast-glob";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const DEFAULT_CONFIG = {
    inputDir: "./images",
    outputDir: "./optimized",

    generateWebp: true,
    generateAvif: true,

    webpQuality: 82,
    avifQuality: 50,

    resizeWidth: 2000,
    concurrency: 4
};

function parseArgs() {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };
    let prefix = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--webp-quality" && args[i + 1]) {
            config.webpQuality = parseInt(args[i + 1]);
            i++;
        } else if (arg === "--avif-quality" && args[i + 1]) {
            config.avifQuality = parseInt(args[i + 1]);
            i++;
        } else if (arg === "--width" && args[i + 1]) {
            config.resizeWidth = parseInt(args[i + 1]);
            i++;
        } else if (arg === "--no-webp") {
            config.generateWebp = false;
        } else if (arg === "--no-avif") {
            config.generateAvif = false;
        } else if (arg === "--concurrency" && args[i + 1]) {
            config.concurrency = parseInt(args[i + 1]);
            i++;
        } else if (!arg.startsWith("--")) {
            prefix = arg;
        }
    }

    return { config, prefix };
}

async function ensureDir(dir) {
    await fs.mkdir(dir, {
        recursive: true
    });
}

function getFolderName(file, inputDir) {

    const relative = path.relative(
        inputDir,
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

async function isOlderThan(sourceFile, targetFile) {
    try {
        const [sourceStat, targetStat] = await Promise.all([
            fs.stat(sourceFile),
            fs.stat(targetFile)
        ]);
        return sourceStat.mtime > targetStat.mtime;
    } catch {
        return false;
    }
}
async function convertFile(file, folderName, outputName, config, stats) {
    const targetDir = path.join(
        config.outputDir,
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
        width: config.resizeWidth,
        fit: "inside",
        withoutEnlargement: true
    });

    const sourceStat = await fs.stat(file);
    stats.totalSourceSize += sourceStat.size;

    // WEBP
    if (config.generateWebp) {
        const needsUpdate = await exists(webpPath)
            ? await isOlderThan(file, webpPath)
            : true;

        if (!needsUpdate) {
            console.log(`↷ skip ${folderName}/${outputName}.webp`);
            const webpStat = await fs.stat(webpPath);
            stats.totalWebpSize += webpStat.size;
            stats.skipped++;
        } else {
            await image
                .clone()
                .webp({
                    quality: config.webpQuality,
                    effort: 6
                })
                .toFile(webpPath);

            const webpStat = await fs.stat(webpPath);
            stats.totalWebpSize += webpStat.size;
            stats.webpConverted++;
            console.log(`✓ ${folderName}/${outputName}.webp`);
        }
    }

    // AVIF
    if (config.generateAvif) {
        const needsUpdate = await exists(avifPath)
            ? await isOlderThan(file, avifPath)
            : true;

        if (!needsUpdate) {
            console.log(`↷ skip ${folderName}/${outputName}.avif`);
            const avifStat = await fs.stat(avifPath);
            stats.totalAvifSize += avifStat.size;
            stats.skipped++;
        } else {
            await image
                .clone()
                .avif({
                    quality: config.avifQuality,
                    effort: 7
                })
                .toFile(avifPath);

            const avifStat = await fs.stat(avifPath);
            stats.totalAvifSize += avifStat.size;
            stats.avifConverted++;
            console.log(`✓ ${folderName}/${outputName}.avif`);
        }
    }
}
async function processBatch(files, config, prefix, stats) {
    const counters = {};
    const tasks = [];

    for (const file of files) {
        const folderName = getFolderName(file, config.inputDir);

        if (!counters[folderName]) {
            counters[folderName] = 1;
        }

        const filename = prefix
            ? `${prefix}-${counters[folderName]}`
            : `${folderName}-${counters[folderName]}`;

        counters[folderName]++;

        tasks.push(
            convertFile(file, folderName, filename, config, stats).catch(err => {
                console.error(`✗ Error processing ${file}:`, err.message);
                stats.errors++;
            })
        );
    }

    await Promise.all(tasks);
}

async function main() {
    const { config, prefix } = parseArgs();

    console.log(`Starting conversion with ${config.concurrency} concurrent workers...`);
    if (prefix) console.log(`Using prefix: "${prefix}"`);

    const files = await fg(
        `${config.inputDir}/**/*.{jpg,jpeg,png,tiff,bmp,webp,gif}`
    );

    if (files.length === 0) {
        console.log("No images found to convert.");
        return;
    }

    console.log(`Found ${files.length} images to process.\n`);

    const stats = {
        totalSourceSize: 0,
        totalWebpSize: 0,
        totalAvifSize: 0,
        webpConverted: 0,
        avifConverted: 0,
        skipped: 0,
        errors: 0
    };

    const startTime = Date.now();

    // Process files in batches with concurrency limit
    for (let i = 0; i < files.length; i += config.concurrency) {
        const batch = files.slice(i, i + config.concurrency);
        await processBatch(batch, config, prefix, stats);

        const progress = Math.min(i + config.concurrency, files.length);
        console.log(`Progress: ${progress}/${files.length} images processed`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n=== Statistics ===");
    console.log(`Total images: ${files.length}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Source size: ${(stats.totalSourceSize / 1024 / 1024).toFixed(2)} MB`);

    if (config.generateWebp) {
        console.log(`WebP converted: ${stats.webpConverted}`);
        console.log(`WebP size: ${(stats.totalWebpSize / 1024 / 1024).toFixed(2)} MB`);
        const webpSavings = ((1 - stats.totalWebpSize / stats.totalSourceSize) * 100).toFixed(1);
        console.log(`WebP savings: ${webpSavings}%`);
    }

    if (config.generateAvif) {
        console.log(`AVIF converted: ${stats.avifConverted}`);
        console.log(`AVIF size: ${(stats.totalAvifSize / 1024 / 1024).toFixed(2)} MB`);
        const avifSavings = ((1 - stats.totalAvifSize / stats.totalSourceSize) * 100).toFixed(1);
        console.log(`AVIF savings: ${avifSavings}%`);
    }

    console.log(`Skipped (up to date): ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);
    console.log("\nDone.");
}

main().catch(console.error);