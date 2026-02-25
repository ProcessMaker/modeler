/** Matches one Mustache placeholder {{ variable }}. Variable: [^\s}]+ (no spaces, no '}'). Rejects {{}}, {{ }}, {{a b}}. */
const MUSTACHE_PLACEHOLDER = /\{\{\s*[^\s}]+\s*\}\}/;

/** Matches URL scheme at start (e.g. http:, https:). */
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * True when the string has only valid Mustache placeholders and the literal parts form a valid URL.
 * Rejects empty mustache ({{}}, {{ }}), stray { or }, and invalid URL characters.
 *
 * @param {string} str - Non-empty trimmed string.
 * @returns {boolean}
 */
export function hasValidMustacheOnly(str) {
  if (!str.includes('{{')) return false;

  const g = new RegExp(MUSTACHE_PLACEHOLDER.source, 'g');
  const urlSkeleton = str.replace(g, 'a');
  if (urlSkeleton.includes('{') || urlSkeleton.includes('}')) return false;

  const urlToTest = HAS_SCHEME.test(urlSkeleton) ? urlSkeleton : `http://${urlSkeleton}`;
  try {
    new URL(urlToTest);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates the Element Destination / Conditional Redirect URL field.
 * (1) Non-empty string. (2) If it contains {{: only valid Mustache placeholders and URL-valid literals. (3) Else: valid URL.
 *
 * @param {string} value - URL or Mustache template to validate.
 * @returns {boolean}
 */
export function isValidElementDestinationURL(value) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.includes('{{')) {
    return hasValidMustacheOnly(trimmed);
  }

  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}
