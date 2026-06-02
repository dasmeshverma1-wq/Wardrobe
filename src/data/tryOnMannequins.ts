/** Stylized try-on preview tiles for the consent carousel (inline SVG — no external assets). */
function mannequinSvg(tone: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 138">
    <rect width="104" height="138" fill="#FAFAFC"/>
    <ellipse cx="52" cy="28" rx="16" ry="18" fill="${tone}"/>
    <path d="M34 46 Q52 38 70 46 L76 72 Q52 66 28 72 Z" fill="${accent}" opacity="0.9"/>
    <path d="M28 72 L22 118 L38 118 L44 84 L60 84 L66 118 L82 118 L76 72 Z" fill="${accent}"/>
    <rect x="18" y="118" width="68" height="12" rx="6" fill="#E8E4EE"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TRYON_CONSENT_MANNEQUINS = [
  mannequinSvg('#E8C4B8', '#FF3F6C'),
  mannequinSvg('#C8A882', '#8270DB'),
  mannequinSvg('#D4B896', '#14958F'),
  mannequinSvg('#B8907A', '#282C3F'),
  mannequinSvg('#E0B8A8', '#F16565'),
];
