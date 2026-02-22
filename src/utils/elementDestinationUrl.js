/**
 * Valid Mustache placeholder: {{ variable }}.
 * Variable: one or more non-whitespace characters (no spaces inside the name). Rejects {{}}, {{ }}, {{var2 var2}}.
 */
const MUSTACHE_PLACEHOLDER = /{{\s*\S+\s*}}/;

/**
 * Returns true if the string has only valid Mustache definitions (one or more) and no stray {{ or }}.
 * Valid: {{var}}, {{ APP_URL }}, https://host/{{path}}, {{a}}{{b}}. Invalid: {{}}, {{ }}, {{unclosed, }}solo.
 * @param {string} str - Non-empty trimmed string.
 * @returns {boolean}
 */
function hasValidMustacheOnly(str) {
  if (!str.includes('{{')) {
    return false;
  }
  const globalRegex = new RegExp(MUSTACHE_PLACEHOLDER.source, 'g');
  const withoutPlaceholders = str.replace(globalRegex, '');
  const hasStrayBraces = withoutPlaceholders.includes('{{') || withoutPlaceholders.includes('}}');
  if (hasStrayBraces) {
    return false;
  }
  // No stray braces and string contained {{ → at least one valid placeholder was matched.
  return true;
}

/**
 * Validates Element Destination / Conditional Redirect URL field.
 * 1. Must be a non-empty string.
 * 2. If it contains {{: must be valid Mustache (one or more placeholders like {{var}}, no stray braces). Invalid Mustache → false (same as invalid URL).
 * 3. If it does not contain {{: must be a valid URL.
 *
 * @param {string} value - Value to validate (URL or Mustache template).
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
