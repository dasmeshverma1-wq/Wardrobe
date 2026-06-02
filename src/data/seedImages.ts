/**
 * Two image sources for the seeded wardrobe:
 *
 * 1. **`SEED_IMAGES`** — inline SVG silhouettes used as fallbacks for a few
 *    legacy categories (blazers etc.). Footwear and bags use real photos in
 *    `public/seed-products/`.
 *
 * 2. **`SEED_PHOTOS`** — product photos for tops, bottoms, outerwear,
 *    footwear, bags, hats, and eyewear. Hosted under `public/seed-products/`
 *    so they're bundled with the app (no external runtime fetches).
 *
 * The seed list in `seed.ts` mixes both sources to keep the demo wardrobe
 * looking like a real closet.
 */

function svgDataUrl(svg: string): string {
  const cleaned = svg.replace(/\n\s*/g, ' ').trim();
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(cleaned);
}

const tee = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M60 30 L40 50 L20 80 L40 95 L55 80 L55 170 L145 170 L145 80 L160 95 L180 80 L160 50 L140 30 L115 30 C115 42 85 42 85 30 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
</svg>`);

const pants = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M55 20 L145 20 L150 70 L130 180 L105 180 L100 90 L95 180 L70 180 L50 70 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <path d='M55 30 L145 30' stroke='#282C3F' stroke-width='1.5' opacity='0.4'/>
</svg>`);

const jacket = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M55 30 L40 55 L20 90 L40 105 L55 90 L55 180 L100 180 L100 55 L100 180 L145 180 L145 90 L160 105 L180 90 L160 55 L145 30 L115 30 L100 50 L85 30 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <circle cx='100' cy='85' r='2.5' fill='#282C3F'/>
  <circle cx='100' cy='110' r='2.5' fill='#282C3F'/>
  <circle cx='100' cy='135' r='2.5' fill='#282C3F'/>
</svg>`);

const dress = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M65 30 L85 30 C85 42 115 42 115 30 L135 30 L140 70 L160 180 L40 180 L60 70 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
</svg>`);

const sneaker = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M20 130 L40 110 L70 100 L100 95 L130 105 L160 115 L180 130 L180 150 L170 160 L25 160 L18 150 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <path d='M60 110 L65 130 M85 100 L90 130 M110 100 L115 130' stroke='#282C3F' stroke-width='1.5' opacity='0.5'/>
</svg>`);

const heel = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M30 140 L150 100 L170 110 L170 145 L155 155 L40 155 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <path d='M150 155 L155 175 L150 178' stroke='#282C3F' stroke-width='3' fill='none'/>
</svg>`);

const bag = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M70 60 C70 35 130 35 130 60' stroke='#282C3F' stroke-width='3' fill='none'/>
  <rect x='45' y='60' width='110' height='110' rx='10' fill='${fill}' stroke='#282C3F' stroke-width='2'/>
  <rect x='90' y='100' width='20' height='14' rx='2' fill='#282C3F' opacity='0.25'/>
</svg>`);

const sunglasses = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <circle cx='65' cy='100' r='35' fill='${fill}' stroke='#282C3F' stroke-width='3'/>
  <circle cx='135' cy='100' r='35' fill='${fill}' stroke='#282C3F' stroke-width='3'/>
  <path d='M100 95 C 92 90 88 90 88 100 M100 95 C 108 90 112 90 112 100' stroke='#282C3F' stroke-width='3' fill='none'/>
  <path d='M30 92 L 8 80 M170 92 L 192 80' stroke='#282C3F' stroke-width='3'/>
</svg>`);

const turtleneck = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M85 22 L115 22 L115 40 L130 40 L150 60 L165 95 L150 105 L138 92 L138 178 L62 178 L62 92 L50 105 L35 95 L50 60 L70 40 L85 40 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <rect x='85' y='22' width='30' height='14' rx='4' fill='${fill}' stroke='#282C3F' stroke-width='2'/>
  <path d='M85 26 L115 26' stroke='#282C3F' stroke-width='1.2' opacity='0.45'/>
</svg>`);

const skirt = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M55 30 L145 30 L155 50 L175 175 L25 175 L45 50 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <path d='M70 50 L62 175 M90 50 L86 175 M110 50 L114 175 M130 50 L138 175'
        stroke='#282C3F' stroke-width='1' opacity='0.35'/>
  <path d='M50 50 L150 50' stroke='#282C3F' stroke-width='1.5' opacity='0.55'/>
</svg>`);

const kneeBoot = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M80 20 L120 20 L122 130 L152 158 L152 180 L78 180 L78 158 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <path d='M78 158 L122 158' stroke='#282C3F' stroke-width='1.3' opacity='0.45'/>
  <path d='M120 28 L120 60' stroke='#282C3F' stroke-width='1.3' opacity='0.4'/>
</svg>`);

const coat = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <path d='M55 28 L40 50 L18 90 L40 105 L52 92 L52 190 L100 190 L100 50 L100 190 L148 190 L148 92 L160 105 L182 90 L160 50 L145 28 L120 28 L100 48 L80 28 Z'
        fill='${fill}' stroke='#282C3F' stroke-width='2' stroke-linejoin='round'/>
  <path d='M100 48 L100 190' stroke='#282C3F' stroke-width='1.3' opacity='0.45'/>
  <circle cx='100' cy='80' r='2.5' fill='#282C3F'/>
  <circle cx='100' cy='110' r='2.5' fill='#282C3F'/>
  <circle cx='100' cy='140' r='2.5' fill='#282C3F'/>
  <circle cx='100' cy='170' r='2.5' fill='#282C3F'/>
</svg>`);

const watch = (fill: string) => svgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <rect x='70' y='40' width='60' height='25' rx='4' fill='#282C3F'/>
  <rect x='70' y='135' width='60' height='25' rx='4' fill='#282C3F'/>
  <rect x='55' y='65' width='90' height='70' rx='14' fill='${fill}' stroke='#282C3F' stroke-width='3'/>
  <circle cx='100' cy='100' r='25' fill='#FFFFFF' stroke='#282C3F' stroke-width='1.5'/>
  <line x1='100' y1='100' x2='100' y2='85' stroke='#282C3F' stroke-width='2'/>
  <line x1='100' y1='100' x2='112' y2='100' stroke='#282C3F' stroke-width='2'/>
</svg>`);

export const SEED_IMAGES = {
  teeWhite: tee('#FFFFFF'),
  teeBlack: tee('#282C3F'),
  blouseBlush: tee('#F8D7DE'),
  pantsBeige: pants('#E7D8B5'),
  pantsBlack: pants('#2F2F33'),
  jeansBlue: pants('#4A6B8F'),
  blazerNavy: jacket('#1F2A44'),
  blazerCream: jacket('#EEE2C2'),
  dressFloral: dress('#E58FB3'),
  dressBoho: dress('#C28A60'),
  sneakerWhite: sneaker('#FFFFFF'),
  heelRed: heel('#B91A3C'),
  heelBlack: heel('#1B1C20'),
  bagBrown: bag('#8B5A2B'),
  bagBlack: bag('#1B1C20'),
  bagStraw: bag('#D4B97A'),
  sunglassesBlack: sunglasses('#282C3F'),
  turtleneckBlack: turtleneck('#1B1C20'),
  turtleneckCream: turtleneck('#F1E7D3'),
  skirtPleatedBlack: skirt('#1B1C20'),
  skirtPleatedKhaki: skirt('#8B7A55'),
  kneeBootBlack: kneeBoot('#1B1C20'),
  kneeBootBrown: kneeBoot('#5B3A22'),
  coatCamel: coat('#B58A60'),
  coatBlack: coat('#1B1C20'),
  watchSilver: watch('#D4D5D9'),
};

/**
 * Real product photos served from `public/seed-products/`. Each entry is a
 * site-relative URL — Vite resolves it from the build root at runtime, so
 * the same path works in `npm run dev` and `npm run build`.
 */
export const SEED_PHOTOS = {
  // Tops + outerwear
  greenDenimJacket: '/seed-products/green-denim-jacket.png',
  beigeHoodie: '/seed-products/beige-hoodie.png',
  blackTee: '/seed-products/black-tee.png',
  kimonoCropTop: '/seed-products/kimono-crop-top.png',
  whiteCropTop: '/seed-products/white-crop-top.png',
  dressShirt: '/seed-products/dress-shirt.png',
  whiteBlouse: '/seed-products/white-blouse.png',
  redShirt: '/seed-products/red-shirt.png',
  linenBeachShirt: '/seed-products/linen-beach-shirt.png',
  whiteLinenShirt: '/seed-products/white-linen-shirt.webp',
  hawaiianShirt: '/seed-products/hawaiian-shirt.png',
  elegantTop: '/seed-products/elegant-top.png',

  // Dresses
  redPolkaDress: '/seed-products/red-polka-dress.png',
  womanDress: '/seed-products/woman-dress.png',

  // Bottoms
  swimShorts: '/seed-products/swim-shorts.png',
  blackJeans: '/seed-products/black-jeans.png',
  blueJeans: '/seed-products/blue-jeans.png',
  blueJeansFaded: '/seed-products/blue-jeans-faded.png',
  whiteJoggers: '/seed-products/white-joggers.png',
  greyJoggers: '/seed-products/grey-joggers.png',
  khakiChinos: '/seed-products/khaki-chinos.png',
  khakiPants: '/seed-products/khaki-pants.png',
  greenShorts: '/seed-products/green-shorts.png',
  denimShortsRipped: '/seed-products/denim-shorts-ripped.png',
  orangeSwimShorts: '/seed-products/orange-swim-shorts.png',
  blueSwimShorts: '/seed-products/blue-swim-shorts.png',
  yellowShorts: '/seed-products/yellow-shorts.png',
  greenDrawstringShorts: '/seed-products/green-drawstring-shorts.png',

  // Hats
  detectiveHat: '/seed-products/detective-hat.png',
  strawHat: '/seed-products/straw-hat.png',
  blueCap: '/seed-products/blue-cap.png',
  brownFeltHat: '/seed-products/brown-felt-hat.png',
  blueBeanie: '/seed-products/blue-beanie.png',
  yellowBucketHat: '/seed-products/yellow-bucket-hat.png',
  purpleCap: '/seed-products/purple-cap.png',
  redCap: '/seed-products/red-cap.png',
  canvasBucketHat: '/seed-products/canvas-bucket-hat.png',
  greenBucketHat: '/seed-products/green-bucket-hat.png',

  // Eyewear
  blackSunglasses: '/seed-products/black-sunglasses.png',
  roundEyeglasses: '/seed-products/round-eyeglasses.png',
  sunglassesBlackRim: '/seed-products/sunglasses-black-rim.png',
  colorfulSunglasses: '/seed-products/colorful-sunglasses.png',

  // Footwear
  colorfulSportsShoes: '/seed-products/colorful-sports-shoes.png',
  casualLeatherShoes: '/seed-products/casual-leather-shoes.png',
  fashionShoes: '/seed-products/fashion-shoes.png',
  clothShoes: '/seed-products/cloth-shoes.png',
  brownFormalShoes: '/seed-products/brown-formal-shoes.png',
  shoes3d: '/seed-products/shoes-3d.png',
  whiteSneakers: '/seed-products/white-sneakers.png',
  colorfulSandals: '/seed-products/colorful-sandals.png',
  contemporarySandals: '/seed-products/contemporary-sandals.png',
  vintageBrownSandals: '/seed-products/vintage-brown-sandals.png',

  // Bags
  blackBag: '/seed-products/black-bag.png',
  brownLeatherHandbag: '/seed-products/brown-leather-handbag.png',

  // Imported outfit flat lays (Images/)
  f1Top: '/seed-products/outfits/f1-f/top.png',
  f1Skirt: '/seed-products/outfits/f1-f/skirt.png',
  f2Top: '/seed-products/outfits/f2-f/top.png',
  f2Jeans: '/seed-products/outfits/f2-f/jeans.png',
  f3Top: '/seed-products/outfits/f3-f/top.png',
  f3Jeans: '/seed-products/outfits/f3-f/jeans.png',
  m1Shirt: '/seed-products/outfits/m1-m/shirt.png',
  m1Pants: '/seed-products/outfits/m1-m/pants.png',
  m1Shoes: '/seed-products/outfits/m1-m/shoes.png',
  greenTopFemale: '/seed-products/green-top-female.png',
  whiteBottomFemale: '/seed-products/white-bottom-female.png',
  purpleFootwearFemale: '/seed-products/purple-footwear-female.png',
} as const;
