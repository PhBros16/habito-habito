// Gera os ícones do PWA a partir de um SVG (um "ensō" minimalista).
// Uso: node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const svg = (pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f4f1ea"/>
  <g transform="translate(256 256) scale(${1 - pad}) translate(-256 -256)">
    <circle cx="256" cy="256" r="150" fill="none" stroke="#7c9c88" stroke-width="30"
      stroke-linecap="round" stroke-dasharray="820 1000" transform="rotate(-70 256 256)"/>
    <circle cx="256" cy="256" r="46" fill="#c79f73" opacity="0.9"/>
  </g>
</svg>`;

mkdirSync("public/icons", { recursive: true });

const jobs = [
  ["public/icons/icon-192.png", 192, 0],
  ["public/icons/icon-512.png", 512, 0],
  ["public/icons/maskable-512.png", 512, 0.22],
  ["public/icons/apple-touch-icon.png", 180, 0.08],
];

for (const [file, size, pad] of jobs) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
  console.log("ok", file);
}

// Favicon vetorial (convenção do Next: src/app/icon.svg)
writeFileSync("public/icon.svg", svg(0).trim());
console.log("ok public/icon.svg");
