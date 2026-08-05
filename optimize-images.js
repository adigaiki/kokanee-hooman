const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./images";
const outputDir = "./images-optimized";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir);

(async () => {
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();

        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext))
            continue;

        const input = path.join(inputDir, file);
        const output = path.join(
            outputDir,
            path.parse(file).name + ".webp"
        );

        await sharp(input)
            .resize({
                width: 1600,
                withoutEnlargement: true
            })
            .webp({
                quality: 78,
                effort: 6
            })
            .toFile(output);

        console.log(`✓ ${file}`);
    }
})();
