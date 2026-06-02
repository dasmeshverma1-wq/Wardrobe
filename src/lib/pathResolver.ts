// Global path resolver to automatically handle GitHub Pages subpath routing
// for all images and fetch requests without modifying every single file.

const base = import.meta.env.BASE_URL || '/';
const cleanBase = base.replace(/\/$/, '');

function resolveUrl(value: string): string {
  if (cleanBase && value.startsWith('/') && !value.startsWith('//')) {
    const hasBase =
      value.startsWith(base) ||
      value === cleanBase ||
      value.startsWith(cleanBase + '/');
    if (!hasBase) {
      return cleanBase + value;
    }
  }
  return value;
}

// 1. Intercept HTMLImageElement.src property setter
const originalSrcDescriptor = Object.getOwnPropertyDescriptor(
  HTMLImageElement.prototype,
  'src',
);
if (originalSrcDescriptor && originalSrcDescriptor.set) {
  const originalSet = originalSrcDescriptor.set;
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    ...originalSrcDescriptor,
    set: function (value) {
      if (typeof value === 'string') {
        value = resolveUrl(value);
      }
      originalSet.call(this, value);
    },
  });
}

// 2. Intercept Element.setAttribute for 'src' attribute
const originalSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (name, value) {
  if (name === 'src' && typeof value === 'string') {
    value = resolveUrl(value);
  }
  return originalSetAttribute.call(this, name, value);
};

// 3. Intercept window.fetch for relative API and asset requests
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  if (typeof input === 'string') {
    input = resolveUrl(input);
  } else if (input instanceof Request) {
    const url = input.url;
    // Request.url is always absolute, but if it was constructed from a relative path,
    // we can check if it needs base prepending.
    // However, since Request is usually constructed with resolved URLs, we don't need to over-complicate.
  }
  return originalFetch.call(this, input, init);
};
