import fs from "fs";
import path from "path";

export interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

let cachedFonts: SatoriFont[] | null = null;

/**
 * Loads and caches local font files from /public/fonts.
 * Avoids repeated disk I/O and eliminates external network latency.
 */
export function getShareCardFonts(): SatoriFont[] {
  if (cachedFonts && cachedFonts.length > 0) {
    return cachedFonts;
  }

  const fonts: SatoriFont[] = [];
  const fontsDir = path.join(process.cwd(), "public", "fonts");

  const fontConfigs = [
    { file: "PlayfairDisplay-Bold.ttf", name: "Playfair Display", weight: 700 as const },
    { file: "PlayfairDisplay-Regular.ttf", name: "Playfair Display", weight: 400 as const },
    { file: "SpaceMono-Regular.ttf", name: "Space Mono", weight: 400 as const },
  ];

  for (const config of fontConfigs) {
    const filePath = path.join(fontsDir, config.file);
    try {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        // Safely extract standalone ArrayBuffer
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );
        fonts.push({
          name: config.name,
          data: arrayBuffer,
          weight: config.weight,
          style: "normal",
        });
      }
    } catch (err) {
      console.error(`[FONTS] Error reading font file ${config.file}:`, err);
    }
  }

  if (fonts.length > 0) {
    cachedFonts = fonts;
  }

  return fonts;
}

