import axios from 'axios';
import { ScanVfProvider } from '@/core/providers/ScanVf/index';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';
import { SCANVF_CONFIG } from '@/config/scanVf';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScanVfProvider', () => {
  const provider = new ScanVfProvider();

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
});
