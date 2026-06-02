/** Neutral full-body silhouette for quick try-on demos (no upload required). */
export const TRYON_SAMPLE_BODY = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F3F0F7"/>
        <stop offset="100%" stop-color="#E8E4EE"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg)"/>
    <ellipse cx="200" cy="78" rx="42" ry="48" fill="#D8D2DC"/>
    <path d="M128 130 Q200 108 272 130 L290 280 Q200 268 110 280 Z" fill="#CFC8D4"/>
    <path d="M110 280 L95 420 L130 420 L145 300 L255 300 L270 420 L305 420 L290 280 Z" fill="#C5BECB"/>
    <path d="M130 420 L118 560 L168 560 L178 440 L222 440 L232 560 L282 560 L270 420 Z" fill="#BAB3C0"/>
    <ellipse cx="168" cy="555" rx="28" ry="12" fill="#A8A0AE"/>
    <ellipse cx="232" cy="555" rx="28" ry="12" fill="#A8A0AE"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
})();

/** Returning-user wireframe demo — real model photo from seed assets. */
export const TRYON_RETURNING_USER_BODY = '/seed-products/female_model_tryon.png';
