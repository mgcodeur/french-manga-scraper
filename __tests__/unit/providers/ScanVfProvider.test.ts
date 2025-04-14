import axios from 'axios';
import fs from 'fs';
import { ScanVfProvider } from '@/core/providers/ScanVf/index';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';
import { SCANVF_CONFIG } from '@/config/scanVf';

jest.mock('axios');
jest.mock('@/config/scrapper', () => ({
  SCRAPPER_CONFIG: {
    dataDir: './mock-data',
  },
}));
jest.mock('fs');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('ScanVfProvider', () => {
  const provider = new ScanVfProvider();

  beforeEach(() => {
    mockedFs.existsSync.mockReset();
    mockedFs.mkdirSync.mockReset();
    mockedFs.readFileSync.mockReset();
    mockedFs.writeFileSync.mockReset();
  });

  it('should search for manga', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        suggestions: [
          { value: 'One Piece', data: 'one_piece' },
          { value: 'One Punch Man', data: 'one-punch-man' },
        ],
      },
    });

    const mangas = await provider.search('one');

    expect(mangas).toHaveLength(2);
    expect(mangas[0].title).toBe('One Piece');
    expect(mangas[0].url).toContain('https://www.scan-vf.net');
  });

  it('should throw ScanVfSearchException on failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(provider.search('fail')).rejects.toThrow(ScanVfSearchException);
  });

  it('should return parsed manga data', async () => {
    const fakeMangaHtml = `
      <html>
        <body>
          <h2 class="widget-title">One Piece</h2>
          <dt>Autres noms</dt><dd>ワンピース, OnePisu</dd>
          <div class="boxed"><img class="img-responsive" src="https://image.com/cover.jpg" /></div>
          <div class="well"><p>A great pirate adventure.</p></div>
          <dt>Statut</dt><dd>En cours</dd>
          <dt>Auteur(s)</dt><dd>Eiichiro Oda</dd>
          <dt>Date de sortie</dt><dd>1997</dd>
          <dt>Catégories</dt><dd>Action, Aventure</dd>
          <dt>Artist(s)</dt><dd>Oda</dd>
          <div class="rating">4.5</div>
        </body>
      </html>
    `;
    mockedAxios.get.mockResolvedValueOnce({ data: fakeMangaHtml });

    const manga = await provider.getManga(`${SCANVF_CONFIG.baseUrl}/one_piece`);

    expect(manga).toEqual({
      title: 'One Piece',
      alternativeTitles: ['ワンピース', 'OnePisu'],
      chapters: [],
      cover: 'https://image.com/cover.jpg',
      url: `${SCANVF_CONFIG.baseUrl}/one_piece`,
      description: 'A great pirate adventure.',
      status: 'ongoing',
      source: 'scan-vf',
      authors: ['Eiichiro Oda'],
      releaseDate: '1997',
      genders: ['Action', 'Aventure'],
      drawers: ['Oda'],
      rating: 4.5,
    });
  });

  it('should throw ScanVfSearchException on error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Something went wrong'));

    await expect(provider.getManga('/one_piece')).rejects.toThrow(ScanVfSearchException);
  });

  it('should return parsed chapters from manga page', async () => {
    const fakeMangaWithChaptersHtml = `
      <html>
        <body>
          <h2 class="widget-title">One Piece</h2>
          <dt>Autres noms</dt><dd>ワンピース, OnePisu</dd>
          <div class="boxed"><img class="img-responsive" src="https://image.com/cover.jpg" /></div>
          <div class="well"><p>A great pirate adventure.</p></div>
          <dt>Statut</dt><dd>En cours</dd>
          <dt>Auteur(s)</dt><dd>Eiichiro Oda</dd>
          <dt>Date de sortie</dt><dd>1997</dd>
          <dt>Catégories</dt><dd>Action, Aventure</dd>
          <dt>Artist(s)</dt><dd>Oda</dd>
          <div class="rating">Moyenne de 4.5/5</div>

          <ul class="chapters">
            <li>
              <a href="/one_piece/2">Chapitre 2</a>
              <em>Le chapeau de paille</em>
              <span class="date-chapter-title-rtl">18 Sep. 2016</span>
            </li>
            <li>
              <a href="/one_piece/1">Chapitre 1</a>
              <em>Le début d'une légende</em>
              <span class="date-chapter-title-rtl">19 Sep. 2016</span>
            </li>
          </ul>
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: fakeMangaWithChaptersHtml });

    const chapters = await provider.getChapters('/one_piece');

    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe("Le début d'une légende");
    expect(chapters[0].number).toBe(1);
    expect(chapters[0].url).toBe('/one_piece/1');
    expect(chapters[0].uploadDate).toBeInstanceOf(Date);

    expect(chapters[1].title).toBe('Le chapeau de paille');
    expect(chapters[1].number).toBe(2);
    expect(chapters[1].url).toBe('/one_piece/2');
  });

  it('should return parsed pages from chapter HTML', async () => {
    const fakeChapterHtml = `
      <html>
        <body>
          <div id="all">
            <img data-src="https://cdn.scan-vf.net/imgs/page1.jpg" />
            <img data-src="https://cdn.scan-vf.net/imgs/page2.jpg" />
            <img data-src="https://cdn.scan-vf.net/imgs/page3.jpg" />
          </div>
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: fakeChapterHtml });

    const pages = await provider.getPages('https://www.scan-vf.net/one_piece/chapitre-1');

    expect(Array.isArray(pages)).toBe(true);
    expect(pages).toHaveLength(3);

    expect(pages[0]).toEqual({
      number: 1,
      image: 'https://cdn.scan-vf.net/imgs/page1.jpg',
    });

    expect(pages[1]).toEqual({
      number: 2,
      image: 'https://cdn.scan-vf.net/imgs/page2.jpg',
    });

    expect(pages[2]).toEqual({
      number: 3,
      image: 'https://cdn.scan-vf.net/imgs/page3.jpg',
    });
  });

  it('should throw ScanVfSearchException if getPages fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Page not found'));

    await expect(provider.getPages('/one_piece/chapitre-404')).rejects.toThrow(
      ScanVfSearchException
    );
  });

  it('should return manga with limited chapters and their pages', async () => {
    const mockManga = {
      title: 'One Piece',
      alternativeTitles: [],
      cover: '',
      url: 'https://www.scan-vf.net/one_piece',
      description: '',
      status: 'ongoing',
      source: 'scan-vf',
      authors: [],
      releaseDate: '',
      genders: [],
      drawers: [],
      rating: 4.5,
      chapters: [
        { number: 1, title: 'Chapter 1', url: '/one_piece/1', uploadDate: new Date() },
        { number: 2, title: 'Chapter 2', url: '/one_piece/2', uploadDate: new Date() },
        { number: 3, title: 'Chapter 3', url: '/one_piece/3', uploadDate: new Date() },
      ],
    };

    const mockedPages = [
      { number: 1, image: 'page1.jpg' },
      { number: 2, image: 'page2.jpg' },
    ];
    jest.spyOn(provider, 'getPages').mockResolvedValue(mockedPages);

    const result = await provider.getMangaWithChaptersAndPages(mockManga as any, 2, 2);

    expect(result.chapters).toHaveLength(2);
    expect(result.chapters![0].number).toBe(2);
    expect(result.chapters![1].number).toBe(3);

    result.chapters!.forEach((chapter) => {
      expect(chapter.pages).toEqual(mockedPages);
    });
  });

  it('should create directory and save new manga if not exists', async () => {
    const mockManga = {
      title: 'Bleach',
      chapters: [{ number: 1, url: 'url-1' }],
    } as any;

    mockedFs.existsSync.mockReturnValue(false);

    const result = await provider.saveManga(mockManga);

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(mockManga, null, 2)
    );
    expect(result).toEqual(mockManga);
  });

  it('should merge new chapters with existing and save', async () => {
    const existingManga = {
      title: 'Bleach',
      chapters: [{ number: 1, url: 'url-1' }],
    };

    const newManga = {
      title: 'Bleach',
      chapters: [{ number: 2, url: 'url-2' }],
    };

    mockedFs.existsSync.mockImplementation((path) => {
      return path.toString().endsWith('manga.json') || true;
    });

    mockedFs.readFileSync.mockReturnValue(JSON.stringify(existingManga));

    const result = await provider.saveManga(newManga as any);

    expect(result.chapters).toHaveLength(2);
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(
        {
          title: 'Bleach',
          chapters: [
            { number: 1, url: 'url-1' },
            { number: 2, url: 'url-2' },
          ],
        },
        null,
        2
      )
    );
  });
});
