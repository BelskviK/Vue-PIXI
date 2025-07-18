/* ---------------------------------------------------------
   svgAssets.ts  – lightweight SVG loader / cache for Pixi v8
   --------------------------------------------------------- */
import { Assets, GraphicsContext, Texture } from "pixi.js";
import type { TileType } from "./Tile";

/* what the app passes in: { [TileType]: 'url-or-inline-svg' } */
export type SvgMap = Partial<Record<TileType, string>>;

/* runtime cache */
const cache = new Map<TileType, Texture | GraphicsContext>();

/**
 * Load & cache a set of SVG icons.
 *  – `raster = false` (default) keeps them as scalable vector paths.
 *  – `raster = true`  converts them to bitmap textures once (faster).
 */
export async function loadSvgMap(map: SvgMap, raster = false) {
  for (const [kind, src] of Object.entries(map) as [TileType, string][]) {
    if (cache.has(kind)) continue;

    try {
      if (raster) {
        /* 1️⃣  raster route */
        const tex = await Assets.load(src);
        cache.set(kind, tex);
      } else {
        /* 2️⃣  true-vector route */
        const ctx = src.trim().startsWith("<")
          ? new GraphicsContext().svg(src) /* inline */
          : await Assets.load({ src, parseAsGraphicsContext: true }); /* file */
        cache.set(kind, ctx);
      }
    } catch (e) {
      console.warn(`❌ SVG failed for ${kind} (${src}) – will use fallback`, e);
    }
  }
}

/* helper for Tile.ts */
export function svgFor(kind: TileType) {
  return cache.get(kind) ?? null;
}
