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

const SHORTCUTS = {
    "-w": "--webp-quality",
    "-a": "--avif-quality",
    "-W": "--width",
    "-n": "--no-webp",
    "-A": "--no-avif",
    "-c": "--concurrency",
    "-h": "--help"
};

function showHelp() {
    console.log("\nUsage: ci [prefix] [options]\n");
    console.log("  -w N, --webp-quality N   WebP quality (0-100) [82]");
    console.log("  -a N, --avif-quality N   AVIF quality (0-100) [50]");
    console.log("  -W N, --width N          Max width [2000]");
    console.log("  -n, --no-webp            Disable WebP");
    console.log("  -A, --no-avif            Disable AVIF");
    console.log("  -c N, --concurrency N    Workers [4]");
    console.log("  -h, --help               Show help\n");
    console.log("Examples:\n  ci vacances -w 90\n  ci -n -W 1500\n  ci projet -w 85 -a 60 -W 1920\n");
}

async function parseArgs() {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };
    let prefix = null;

    if (args.length === 0) {
        return await showMenu(config);
    }

    const expanded = args.map((a) => SHORTCUTS[a] || a);

    for (let i = 0; i < expanded.length; i++) {
        const arg = expanded[i];
        if (["--help", "-h"].includes(arg)) { showHelp(); process.exit(0); }
        if (arg === "--webp-quality" && expanded[i + 1]) config.webpQuality = parseInt(expanded[++i]);
        else if (arg === "--avif-quality" && expanded[i + 1]) config.avifQuality = parseInt(expanded[++i]);
        else if (arg === "--width" && expanded[i + 1]) config.resizeWidth = parseInt(expanded[++i]);
        else if (arg === "--no-webp") config.generateWebp = false;
        else if (arg === "--no-avif") config.generateAvif = false;
        else if (arg === "--concurrency" && expanded[i + 1]) config.concurrency = parseInt(expanded[++i]);
        else if (!arg.startsWith("--")) prefix = arg;
    }

    return { config, prefix };
}
async function showMenu(defaultConfig) {
    const readline = await import("node:readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    const items = ["Convertir par defaut", "Configurer", "Aide", "Quitter"];
    let selected = 0;
    let result = null;

    function render() {
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout);
        console.log("\n=== Convertisseur d'images ===\n");
        items.forEach((it, i) => {
            console.log((i === selected ? "  > " : "    ") + it);
        });
        console.log("\n(↑↓ nav, Entree valider)");
    }

    function done(r) {
        result = r;
        try { rl.close(); } catch(e){}
        try { process.stdin.setRawMode(false); } catch(e){}
        try { process.stdin.pause(); } catch(e){}
    }

    render();
    try { process.stdin.setRawMode(true); } catch(e) {}
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
        if (result !== null) return;
        let key = { name: "" };
        if (chunk === "\x1b[A") key.name = "up";
        else if (chunk === "\x1b[B") key.name = "down";
        else if (chunk === "\r" || chunk === "\n") key.name = "return";
        else if (chunk === "\x03") { key.name = "c"; key.ctrl = true; }
        else { key.name = chunk.trim(); }

        if (key.name === "up" && selected > 0) { selected--; render(); }
        else if (key.name === "down" && selected < items.length - 1) { selected++; render(); }
        else if (key.name === "return" || key.name === "") {
            if (selected === 0) done({ config: defaultConfig, prefix: null });
            else if (selected === 1) { done(null); showConfigMenu(defaultConfig).then(r => { result = r; }); }
            else if (selected === 2) { done(null); showHelp(); process.exit(0); }
            else if (selected === 3) { done(null); process.exit(0); }
        }
        else if (key.ctrl && key.name === "c") { done(null); process.exit(0); }
        else if (key.name === "1") { done({ config: defaultConfig, prefix: null }); }
        else if (key.name === "2") { done(null); showConfigMenu(defaultConfig).then(r => { result = r; }); }
        else if (key.name === "3") { done(null); showHelp(); process.exit(0); }
        else if (key.name === "4") { done(null); process.exit(0); }
    });

    return new Promise((resolve) => {
        const iv = setInterval(() => {
            if (result !== null) { clearInterval(iv); resolve(result); }
        }, 50);
    });
}

async function showConfigMenu(defaultConfig) {
    const readline = await import("node:readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    const ask = (q) => new Promise((r) => rl.question(q, r));

    console.log("\n--- Configuration ---\n");
    const pfx = await ask("Prefixe (vide=defaut): ");
    const wq = await ask("WebP qualite [0-100] (82): ");
    const aq = await ask("AVIF qualite [0-100] (50): ");
    const wd = await ask("Largeur max (2000): ");
    const wc = await ask("Workers paralleles (4): ");
    const nw = (await ask("Desactiver WebP? (o/n): ")).toLowerCase() === "o";
    const na = (await ask("Desactiver AVIF? (o/n): ")).toLowerCase() === "o";
    rl.close();

    return {
        config: {
            ...defaultConfig,
            webpQuality: wq ? parseInt(wq) : 82,
            avifQuality: aq ? parseInt(aq) : 50,
            resizeWidth: wd ? parseInt(wd) : 2000,
            concurrency: wc ? parseInt(wc) : 4,
            generateWebp: !nw,
            generateAvif: !na
        },
        prefix: pfx || null
    };
}

function ensureDir(dir) { return fs.mkdir(dir, { recursive: true }); }

function getFolderName(file, inputDir) {
    const rel = path.relative(inputDir, file);
    const parts = rel.split(path.sep);
    return parts.length === 1 ? "image" : parts[0];
}

async function exists(f) { try { await fs.access(f); return true; } catch { return false; } }

async function isOlderThan(src, tgt) {
    try {
        const [ss, st] = await Promise.all([fs.stat(src), fs.stat(tgt)]);
        return ss.mtime > st.mtime;
    } catch { return false; }
}

async function convertFile(file, folder, name, cfg, st) {
    const td = path.join(cfg.outputDir, folder);
    await ensureDir(td);
    const wp = path.join(td, name + ".webp");
    const ap = path.join(td, name + ".avif");
    const img = sharp(file).resize({ width: cfg.resizeWidth, fit: "inside", withoutEnlargement: true });
    const ss = await fs.stat(file);
    st.totalSourceSize += ss.size;

    if (cfg.generateWebp) {
        const nu = !(await exists(wp)) || await isOlderThan(file, wp);
        if (!nu) {
            const ws = await fs.stat(wp);
            st.totalWebpSize += ws.size;
            st.skipped++;
            console.log("[s] skip " + folder + "/" + name + ".webp");
        } else {
            await img.clone().webp({ quality: cfg.webpQuality, effort: 6 }).toFile(wp);
            const ws = await fs.stat(wp);
            st.totalWebpSize += ws.size;
            st.webpConverted++;
            console.log("[v] " + folder + "/" + name + ".webp");
        }
    }
    if (cfg.generateAvif) {
        const nu = !(await exists(ap)) || await isOlderThan(file, ap);
        if (!nu) {
            const as = await fs.stat(ap);
            st.totalAvifSize += as.size;
            st.skipped++;
            console.log("[s] skip " + folder + "/" + name + ".avif");
        } else {
            await img.clone().avif({ quality: cfg.avifQuality, effort: 7 }).toFile(ap);
            const as = await fs.stat(ap);
            st.totalAvifSize += as.size;
            st.avifConverted++;
            console.log("[v] " + folder + "/" + name + ".avif");
        }
    }
}

async function processBatch(files, cfg, prfx, st) {
    const ctr = {};
    const tasks = [];
    for (let i_f = 0; i_f < files.length; i_f++) {
        const f = files[i_f];
        const fn = getFolderName(f, cfg.inputDir);
        if (!ctr[fn]) ctr[fn] = 1;
        const nm = prfx ? prfx + "-" + ctr[fn] : fn + "-" + ctr[fn];
        ctr[fn]++;
        tasks.push(convertFile(f, fn, nm, cfg, st).catch((e) => {
            console.error("[x] Error " + f + ":", e.message);
            st.errors++;
        }));
    }
    await Promise.all(tasks);
}

async function main() {
    const res = await parseArgs();
    if (!res) return;
    const config = res.config;
    const prefix = res.prefix;

    console.log("\\nConv: " + config.concurrency + " workers | " + (prefix ? "prefix: " + prefix : "no prefix"));
    if (config.generateWebp) console.log("  WebP: [v] q=" + config.webpQuality);
    else console.log("  WebP: [ ] off");
    if (config.generateAvif) console.log("  AVIF: [v] q=" + config.avifQuality);
    else console.log("  AVIF: [ ] off");
    console.log("  Width: " + config.resizeWidth + "\\n");

    const files = await fg(config.inputDir + "/**/*.{jpg,jpeg,png,tiff,bmp,webp,gif}");
    if (files.length === 0) { console.log("No images."); return; }
    console.log("Found " + files.length + " images.\\n");

    const st = { totalSourceSize: 0, totalWebpSize: 0, totalAvifSize: 0, webpConverted: 0, avifConverted: 0, skipped: 0, errors: 0 };
    const t0 = Date.now();

    for (let i = 0; i < files.length; i += config.concurrency) {
        await processBatch(files.slice(i, i + config.concurrency), config, prefix, st);
        console.log("Progress: " + Math.min(i + config.concurrency, files.length) + "/" + files.length);
    }

    const dur = ((Date.now() - t0) / 1000).toFixed(2);
    console.log("\\n=== Stats (" + dur + "s) ===");
    console.log("Source: " + (st.totalSourceSize / 1024 / 1024).toFixed(2) + " MB");
    if (config.generateWebp) console.log("WebP: " + st.webpConverted + " | " + (st.totalWebpSize / 1024 / 1024).toFixed(2) + " MB | -" + ((1 - st.totalWebpSize / st.totalSourceSize) * 100).toFixed(1) + "%");
    if (config.generateAvif) console.log("AVIF: " + st.avifConverted + " | " + (st.totalAvifSize / 1024 / 1024).toFixed(2) + " MB | -" + ((1 - st.totalAvifSize / st.totalSourceSize) * 100).toFixed(1) + "%");
    console.log("Skip: " + st.skipped + " | Err: " + st.errors + "\\nDone.\\n");
}
main().catch(console.error);