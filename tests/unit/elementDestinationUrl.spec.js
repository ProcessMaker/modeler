import {
  isValidElementDestinationURL,
  hasValidMustacheOnly,
} from '@/utils/elementDestinationUrl';

describe('elementDestinationUrl', () => {
  describe('hasValidMustacheOnly', () => {
    it('returns false when string does not contain {{', () => {
      expect(hasValidMustacheOnly('no mustache here')).toBe(false);
      expect(hasValidMustacheOnly('https://example.com')).toBe(false);
    });

    it('returns true when string has only valid placeholders', () => {
      expect(hasValidMustacheOnly('{{var}}')).toBe(true);
      expect(hasValidMustacheOnly('{{a}}{{b}}')).toBe(true);
    });

    it('returns false when string contains empty mustache {{}} or {{ }}', () => {
      expect(hasValidMustacheOnly('{{}}')).toBe(false);
      expect(hasValidMustacheOnly('{{ }}')).toBe(false);
    });

      it('returns false when string has stray {{ or }}', () => {
        expect(hasValidMustacheOnly('{{unclosed')).toBe(false);
        expect(hasValidMustacheOnly('{{a}} }}')).toBe(false);
      });

      it('returns false when valid placeholders are followed by empty {{}}', () => {
        expect(hasValidMustacheOnly('{{server}}/{{_request.id}}{{}}')).toBe(false);
      });
  });

  describe('isValidElementDestinationURL', () => {
    describe('non-string or empty', () => {
      it('returns false for non-string values', () => {
        expect(isValidElementDestinationURL(null)).toBe(false);
        expect(isValidElementDestinationURL(undefined)).toBe(false);
        expect(isValidElementDestinationURL(123)).toBe(false);
        expect(isValidElementDestinationURL({})).toBe(false);
        expect(isValidElementDestinationURL([])).toBe(false);
      });

      it('returns false for empty string', () => {
        expect(isValidElementDestinationURL('')).toBe(false);
      });

      it('returns false for whitespace-only string', () => {
        expect(isValidElementDestinationURL('   ')).toBe(false);
        expect(isValidElementDestinationURL('\t\n')).toBe(false);
      });
    });

    describe('Mustache template (contains {{)', () => {
      it('returns true for valid single placeholder', () => {
        expect(isValidElementDestinationURL('{{var}}')).toBe(true);
        expect(isValidElementDestinationURL('{{ APP_URL }}')).toBe(true);
        expect(isValidElementDestinationURL('  {{path}}  ')).toBe(true);
      });

      it('returns true for valid multiple placeholders', () => {
        expect(isValidElementDestinationURL('{{a}}{{b}}')).toBe(true);
        expect(isValidElementDestinationURL('{{x}}/{{y}}')).toBe(true);
      });

      it('returns true for URL with valid Mustache placeholders', () => {
        expect(isValidElementDestinationURL('https://host/{{path}}')).toBe(true);
        expect(isValidElementDestinationURL('http://example.com/{{id}}/view')).toBe(true);
      });

      it('returns false for empty placeholder {{}}', () => {
        expect(isValidElementDestinationURL('{{}}')).toBe(false);
      });

      it('returns false for placeholder with only spaces {{ }}', () => {
        expect(isValidElementDestinationURL('{{ }}')).toBe(false);
      });

      it('returns false for unclosed Mustache (stray {{)', () => {
        expect(isValidElementDestinationURL('{{unclosed')).toBe(false);
        expect(isValidElementDestinationURL('{{a}} {{')).toBe(false);
      });

      it('returns false for stray closing braces }}', () => {
        expect(isValidElementDestinationURL('{{a}} }}')).toBe(false);
        expect(isValidElementDestinationURL('}}solo')).toBe(false);
      });

      it('returns false for placeholder with space inside variable name', () => {
        expect(isValidElementDestinationURL('{{var2 var2}}')).toBe(false);
      });

      it('returns false for URL with valid placeholders plus empty {{}}', () => {
        expect(isValidElementDestinationURL('{{server}}/{{_request.id}}{{}}')).toBe(false);
      });
    });

    describe('plain URL (no Mustache)', () => {
      it('returns true for valid HTTP URL', () => {
        expect(isValidElementDestinationURL('http://example.com')).toBe(true);
        expect(isValidElementDestinationURL('http://a.b')).toBe(true);
      });

      it('returns true for valid HTTPS URL', () => {
        expect(isValidElementDestinationURL('https://example.com')).toBe(true);
        expect(isValidElementDestinationURL('https://example.com/path?q=1')).toBe(true);
      });

      it('returns true for URL with trimmed whitespace', () => {
        expect(isValidElementDestinationURL('  https://example.com  ')).toBe(true);
      });

      it('returns false for invalid URL', () => {
        expect(isValidElementDestinationURL('not a url')).toBe(false);
        expect(isValidElementDestinationURL('://bad')).toBe(false);
      });
    });
  });
});
