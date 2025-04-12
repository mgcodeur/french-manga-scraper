import { ScanVfProvider } from '@/core/providers/ScanVf/index';

describe('ScanVfProvider [REAL HTTP]', () => {
  const provider = new ScanVfProvider();

  it('should return real results from ScanVF', async () => {
    const results = await provider.search('one piece');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase()).toContain('one');
    expect(results[0].url).toMatch(/^https:\/\/www\.scan-vf\.net/);
  });
});
