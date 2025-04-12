import axios from 'axios';
import { ScanVfProvider } from '@/core/providers/ScanVf/index';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';
import { SCANVF_CONFIG } from '@/config/scanVf';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScanVfProvider', () => {
  const provider = new ScanVfProvider();
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
    mockedAxios.get.mockResolvedValueOnce({ data: fakeMangaHtml });

    const manga = await provider.getManga(`${SCANVF_CONFIG.baseUrl}/one_piece`);

    expect(manga).toEqual({
      title: 'One Piece',
      alternativeTitles: ['ワンピース', 'OnePisu'],
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
});
