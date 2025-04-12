import { ScanVfProvider } from '@/core/providers/ScanVf/index';
import { Manga } from '@/core/models/Manga';

describe('ScanVfProvider [REAL HTTP]', () => {
  const provider = new ScanVfProvider();

  it('should return real results from ScanVF', async () => {
    const results = await provider.search('one piece');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase()).toContain('one');
    expect(results[0].url).toMatch(/^https:\/\/www\.scan-vf\.net/);
  });

  it('should fetch and parse a real manga page from ScanVF', async () => {
    const results = await provider.search('one piece');
    const onePiece = results.find((m: Manga) => m.title.toLowerCase().includes('one piece'));

    expect(onePiece).toBeDefined();
    expect(onePiece?.url).toMatch(/^https:\/\/www\.scan-vf\.net\/one_piece/);

    const manga = await provider.getManga(onePiece!.url);

    expect(manga.title.toLowerCase()).toContain('one piece');
    expect(manga.cover).toMatch(/^https?:\/\//);
    expect(typeof manga.description).toBe('string');
    expect(manga.description.length).toBeGreaterThan(10);
    expect(manga.status).toMatch(/ongoing|completed|hiatus|cancelled|unknown/);
    expect(Array.isArray(manga.authors)).toBe(true);
    expect(manga.source).toBe('scan-vf');
  });
});
