const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const convert = require("heic-convert");

async function convertHeicInFolder(folderPath) {
  const files = await promisify(fs.readdir)(folderPath);
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(folderPath, files[i]);
    const stat = await promisify(fs.stat)(filePath);
    if (stat.isDirectory()) {
      // recursivamente converte imagens HEIC em subpastas
      await convertHeicInFolder(filePath);
    } else if (path.extname(filePath).toLowerCase() === ".heic") {
      // converte imagem HEIC em JPEG
      const inputBuffer = await promisify(fs.readFile)(filePath);
      const images = await convert.all({
        buffer: inputBuffer,
        format: "JPEG",
      });
      const outputFolder = path.join(folderPath, "convert-images");
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }
      for (let idx in images) {
        const image = images[idx];
        const outputBuffer = await image.convert();
        const outputFilePath = path.join(
          outputFolder,
          `${path.basename(filePath, ".heic")}-${idx}.jpg`
        );
        await promisify(fs.writeFile)(outputFilePath, outputBuffer);
      }
    }
  }
}

const folderPath = "./images";
convertHeicInFolder(folderPath);
