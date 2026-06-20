import { describe, expect, it } from 'vitest';
import { normalizeImageUrl } from '@/lib/utils/image-url';

describe('normalizeImageUrl', () => {
  it('adds https to protocol-less URLs', () => {
    expect(normalizeImageUrl('example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  it('converts Google Drive sharing links', () => {
    expect(
      normalizeImageUrl('https://drive.google.com/file/d/abc123/view?usp=sharing')
    ).toBe('https://drive.google.com/uc?export=view&id=abc123');
  });

  it('converts Dropbox links to raw', () => {
    const out = normalizeImageUrl('https://www.dropbox.com/s/xyz/photo.jpg?dl=0');
    expect(out).toContain('raw=1');
  });
});
