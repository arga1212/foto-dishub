/**
 * Convert an image URL (blob: or data:) to a data URL for PDF embedding
 */
export async function imageUrlToDataUrl(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Convert SVG string to data URL
 */
export function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Format name for file naming (spaces → underscores)
 */
export function formatFileName(name) {
  return name.trim().replace(/\s+/g, '_').toUpperCase() + '.pdf';
}
