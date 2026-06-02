import html2canvas from 'html2canvas';

export async function captureElement(el: HTMLElement, scale = 2): Promise<string> {
  const canvas = await html2canvas(el, {
    backgroundColor: null,
    scale,
    useCORS: true,
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

/**
 * Share a data URL via the Web Share API when available; otherwise download as a PNG.
 * Returns the action taken so the UI can give feedback.
 */
export async function shareOrDownload(
  dataUrl: string,
  filename = 'myntra-wardrobe-look.png',
  text = 'My look on Myntra Wardrobe',
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: 'image/png' });

    const nav = navigator as Navigator & { canShare?: (data: { files?: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] }) && typeof navigator.share === 'function') {
      try {
        await navigator.share({ files: [file], text });
        return 'shared';
      } catch (e) {
        // User cancelled the native share sheet.
        if ((e as Error).name === 'AbortError') return 'cancelled';
        // Permission or other error - fall through to download.
      }
    }
  } catch {
    // Blob conversion failed (rare); fall back to download.
  }
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return 'downloaded';
}
