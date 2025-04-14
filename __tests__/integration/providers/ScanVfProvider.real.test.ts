import { ScanVfProvider } from '@/core/providers/ScanVf/index';
import { Manga } from '@/core/models/Manga';

jest.mock('@/config/scrapper', () => ({
  SCRAPPER_CONFIG: {
    dataDir: './mock-data',
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

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

  it('should fetch and parse real chapters from ScanVF', async () => {
    const results = await provider.search('one piece');
    const onePiece = results.find((m: Manga) => m.title.toLowerCase().includes('one piece'));

    expect(onePiece).toBeDefined();

    const chapters = await provider.getChapters(onePiece!.url);

    expect(Array.isArray(chapters)).toBe(true);
    expect(chapters.length).toBeGreaterThan(0);

    const first = chapters[0];
    expect(typeof first.title).toBe('string');
    expect(first.title.length).toBeGreaterThan(0);

    expect(typeof first.url).toBe('string');
    expect(first.url).toMatch(/\/one_piece\/chapitre-\d+/);

    expect(typeof first.number).toBe('number');
    expect(first.number).toBeGreaterThan(0);

    expect(first.uploadDate).toBeInstanceOf(Date);
  });

  it('should fetch and parse real pages from a ScanVF chapter', async () => {
    const results = await provider.search('one piece');
    const onePiece = results.find((m: Manga) => m.title.toLowerCase().includes('one piece'));

    expect(onePiece).toBeDefined();

    const chapters = await provider.getChapters(onePiece!.url);
    expect(chapters.length).toBeGreaterThan(0);

    const firstChapter = chapters[0];

    const fullChapterUrl = firstChapter.url.trim();
    const pages = await provider.getPages(fullChapterUrl);

    expect(Array.isArray(pages)).toBe(true);
    expect(pages.length).toBeGreaterThan(0);

    const firstPage = pages[0];
    expect(firstPage.number).toBe(1);
    expect(firstPage.image.trim()).toMatch(/^https?:\/\//);
  });

  it('should fetch manga with selected chapters and their pages [REAL HTTP]', async () => {
    const provider = new ScanVfProvider();

    const results = await provider.search('one piece');
    const onePiece = results.find((m: Manga) => m.title.toLowerCase().includes('one piece'));

    expect(onePiece).toBeDefined();

    const manga = await provider.getManga(onePiece!.url);

    const enriched = await provider.getMangaWithChaptersAndPages(manga, 2, 1);

    expect(enriched.chapters).toBeDefined();
    expect(enriched.chapters!.length).toBeLessThanOrEqual(2);

    enriched.chapters!.forEach((chapter) => {
      expect(Array.isArray(chapter.pages)).toBe(true);
      expect(chapter.pages!.length).toBeGreaterThan(0);

      const firstPage = chapter.pages![0];
      expect(firstPage.number).toBe(1);
      expect(firstPage.image).toMatch(/^https?:\/\//);
    });
  });
});
