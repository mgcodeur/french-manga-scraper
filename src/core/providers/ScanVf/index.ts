import axios from 'axios';
import * as cheerio from 'cheerio';

import { SCANVF_CONFIG } from '@/config/scanVf';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';
import { Chapter } from '@/core/models/Chapter';
import { Manga } from '@/core/models/Manga';
import { Page } from '@/core/models/Page';
import {
  extractAlternativeTitles,
  extractAuthors,
  extractCover,
  extractDescription,
  extractDrawers,
  extractGenders,
  extractRating,
  extractReleaseDate,
  extractStatus,
  extractTitle,
  extractChapters,
} from '@/core/providers/ScanVf/helpers';

import { BaseProvider } from '@/core/providers/BaseProvider';
import { mapSuggestionToManga } from '@/core/providers/ScanVf/mapper';
import { Suggestion } from '@/core/providers/ScanVf/types';

export class ScanVfProvider implements BaseProvider {
  async search(_query: string): Promise<Manga[]> {
    const searchUrl: string = `${SCANVF_CONFIG.baseUrl}/search?query=${_query}`;

    try {
      const { data } = await axios.get(searchUrl);
      const suggestions: Suggestion[] = await data.suggestions;
      return suggestions.map(mapSuggestionToManga);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ScanVfSearchException(error.message);
      }
      throw new ScanVfSearchException('An unknown error occurred');
    }
  }

  async getManga(_url: string): Promise<Manga> {
    try {
      const mangaUrl = _url;

      const { data } = await axios.get(mangaUrl);

      const $ = cheerio.load(data);

      return Promise.resolve({
        title: extractTitle($),
        alternativeTitles: extractAlternativeTitles($),
        cover: extractCover($),
        url: mangaUrl,
        description: extractDescription($),
        status: extractStatus($) as 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'unknown',
        source: 'scan-vf',
        authors: extractAuthors($),
        releaseDate: extractReleaseDate($),
        genders: extractGenders($),
        drawers: extractDrawers($),
        rating: extractRating($('.rating').text().trim()),
        chapters: extractChapters($),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ScanVfSearchException(error.message);
      }
      throw new ScanVfSearchException('An unknown error occurred');
    }
  }

  async getChapters(_url: string): Promise<Chapter[]> {
    try {
      const manga = await this.getManga(_url);
      return manga.chapters ?? [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ScanVfSearchException(error.message);
      }
      throw new ScanVfSearchException('An unknown error occurred');
    }
  }

  getPages(_chapterUrl: string): Promise<Page[]> {
    console.log(_chapterUrl);
    return Promise.resolve([]);
  }
}
