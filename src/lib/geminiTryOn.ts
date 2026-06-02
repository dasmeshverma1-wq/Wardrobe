import type { TryOnGarment, TryOnProgress } from './tryOnTypes';
import { sortGarmentsByLayer } from './tryOnPlacement';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp',
] as const;

type InlineImagePart = {
  inlineData: { mimeType: string; data: string };
};

type GenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType?: string; data?: string };
        text?: string;
      }>;
    };
  }>;
  error?: { message?: string };
};

const CATEGORY_HINT: Record<string, string> = {
  tops: 'top / shirt',
  bottoms: 'bottoms / pants / shorts',
  dresses: 'dress',
  outerwear: 'jacket / outer layer',
  footwear: 'shoes',
  bags: 'bag',
  accessories: 'accessory',
};

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function imageUrlToInlinePart(url: string): Promise<InlineImagePart | null> {
  try {
    if (url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      return { inlineData: { mimeType: match[1], data: match[2] } };
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const mimeType = blob.type || 'image/jpeg';
    const data = await blobToBase64(blob);
    return { inlineData: { mimeType, data } };
  } catch {
    return null;
  }
}

function buildTryOnPrompt(garments: TryOnGarment[]): string {
  const sorted = sortGarmentsByLayer(garments);
  const lines = sorted.map((g, i) => {
    const zone = g.zone ?? 'torso';
    const cat = CATEGORY_HINT[g.category] ?? g.category;
    return `${i + 2}. ${cat} — "${g.name}" (wardrobe zone: ${zone})`;
  });

  return [
    'Create ONE photorealistic full-body virtual try-on image.',
    '',
    'Image 1 is the PERSON reference: keep their face, body shape, pose, skin tone, and a clean neutral studio-style background.',
    'Images 2 onward are PRODUCT cutouts from the user closet — dress the person in ALL of them with natural fit, shadows, and lighting.',
    '',
    'Garments to apply (layer bottom to top):',
    ...lines,
    '',
    'Rules:',
    '- Full body visible from head to toe when possible',
    '- No text, logos, watermarks, or collages',
    '- Output a single final try-on photo only',
  ].join('\n');
}

function extractImageDataUrl(json: GenerateResponse): string | null {
  const parts = json.candidates?.[0]?.content?.parts;
  if (!parts?.length) return null;
  for (const part of parts) {
    const data = part.inlineData?.data;
    if (!data) continue;
    const mime = part.inlineData?.mimeType ?? 'image/png';
    return `data:${mime};base64,${data}`;
  }
  return null;
}

async function generateWithModel(
  apiKey: string,
  model: string,
  parts: Array<InlineImagePart | { text: string }>,
): Promise<string | null> {
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: '9:16' },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as GenerateResponse;
  if (!res.ok) {
    console.warn('[gemini try-on]', model, json.error?.message ?? res.status);
    return null;
  }

  return extractImageDataUrl(json);
}

/**
 * Gemini (AI Studio) virtual try-on — person photo + product images by category.
 * Returns null on failure so callers can fall back to canvas compositor.
 */
export async function composeTryOnGemini(
  bodyPhotoUrl: string,
  garments: TryOnGarment[],
  onProgress?: (p: TryOnProgress) => void,
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey?.trim()) return null;
  if (!garments.length) return null;

  onProgress?.({ step: 0, total: 5, label: 'Connecting to Gemini…' });

  const personPart = await imageUrlToInlinePart(bodyPhotoUrl);
  if (!personPart) return null;

  const sorted = sortGarmentsByLayer(garments).slice(0, 6);
  const productParts: InlineImagePart[] = [];
  for (const g of sorted) {
    onProgress?.({
      step: 1,
      total: 5,
      label: `Loading ${g.name || g.category}…`,
    });
    const part = await imageUrlToInlinePart(g.imageUrl);
    if (part) productParts.push(part);
  }
  if (productParts.length === 0) return null;

  const parts: Array<InlineImagePart | { text: string }> = [
    { text: 'PERSON reference (image 1):' },
    personPart,
    { text: buildTryOnPrompt(sorted) },
    ...productParts.flatMap((p, i) => [
      { text: `Product ${i + 1}:` } as { text: string },
      p,
    ]),
  ];

  onProgress?.({ step: 2, total: 5, label: 'Generating try-on with AI…' });

  for (const model of IMAGE_MODELS) {
    try {
      const image = await generateWithModel(apiKey.trim(), model, parts);
      if (image) {
        onProgress?.({ step: 4, total: 5, label: 'Final render…' });
        return image;
      }
    } catch (err) {
      console.warn('[gemini try-on]', model, err);
    }
  }

  return null;
}
