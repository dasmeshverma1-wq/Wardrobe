/**
 * Try-On avatar onboarding photos from `Images/try on me selfies/`.
 * Served from `public/seed-products/tryon-onboarding/`.
 */
export const TRYON_ONBOARDING = {
  /** Front face selfie — capture slot 1 */
  selfieFront: '/seed-products/tryon-onboarding/selfie-front.jpg',
  /** Side face selfie — capture slot 2 */
  selfieSide: '/seed-products/tryon-onboarding/selfie-side.jpg',
  /** Full-body front — body shot 1 */
  bodyFront: '/seed-products/tryon-onboarding/body-front.jpg',
  /** Full-body side / phone-angle POV — body shot 2 (from Images/try on me selfies/) */
  bodySide: '/seed-products/tryon-onboarding/body-side.jpg',
  /** How to hold the phone — camera viewfinder guide */
  phoneHoldingReference: '/seed-products/tryon-onboarding/phone-holding-reference.jpg',
} as const;

export function tryOnSelfieCapturePhoto(target: 1 | 2): string {
  return target === 1 ? TRYON_ONBOARDING.selfieFront : TRYON_ONBOARDING.selfieSide;
}

export function tryOnBodyCapturePhoto(target: 1 | 2): string {
  return target === 1 ? TRYON_ONBOARDING.bodyFront : TRYON_ONBOARDING.bodySide;
}
