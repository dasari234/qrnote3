import { isRagFile, isVisionFile } from '@/lib/ai/attachments';

describe('AI attachment helpers', () => {
  describe('isVisionFile', () => {
    it('returns true for PNG', () => {
      expect(isVisionFile('image/png')).toBe(true);
    });

    it('returns true for JPEG', () => {
      expect(isVisionFile('image/jpeg')).toBe(true);
    });

    it('returns false for PDF', () => {
      expect(isVisionFile('application/pdf')).toBe(false);
    });
  });

  describe('isRagFile', () => {
    it('returns true for PDF', () => {
      expect(isRagFile('application/pdf')).toBe(true);
    });

    it('returns true for JSON', () => {
      expect(isRagFile('application/json')).toBe(true);
    });

    it('returns false for images', () => {
      expect(isRagFile('image/png')).toBe(false);
    });
  });
});
