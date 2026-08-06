import smImg1 from "../../product img/sm-00810607023315_H1C1-1.jpg";
import smImg2 from "../../product img/sm-00810607024763_H1C1-1.jpg";
import smImg3 from "../../product img/sm-00810607025463_H1C1.jpg";
import smImg4 from "../../product img/sm-00810607026033_H1C1.jpg";
import smImg5 from "../../product img/sm-00893594002570_H1C1-1.jpg";

/**
 * PLACEHOLDER_PRODUCT_IMAGES — the repo's `product img/sm-*` placeholder
 * set (the only files there small enough to use as thumbnails; the
 * full-size originals are intentionally excluded). None of these five
 * files' embedded UPCs match any mock product/item in this prototype —
 * there is no real product-to-image mapping today, so assignment below is
 * positional/deterministic, not semantic. Acceptable per product
 * direction: the image does not need to match the mock product yet.
 */
const PLACEHOLDER_PRODUCT_IMAGES = [smImg1, smImg2, smImg3, smImg4, smImg5];

/** Small, stable string hash — deterministic so the same key (EAN/UPC/id)
 * always resolves to the same placeholder image across renders, instead of
 * a random pick that would visually "flicker" between re-renders. */
function hashKey(key) {
  const str = String(key);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * getPlaceholderProductImage — deterministic placeholder image for a
 * product/item row, keyed by any stable identifier the caller already has
 * (EAN, UPC, or id). Returns undefined when no key is available, so
 * ProductImageThumb's own no-src placeholder icon renders instead of a
 * guessed image.
 */
export function getPlaceholderProductImage(key) {
  if (!key) return undefined;
  return PLACEHOLDER_PRODUCT_IMAGES[hashKey(key) % PLACEHOLDER_PRODUCT_IMAGES.length];
}
