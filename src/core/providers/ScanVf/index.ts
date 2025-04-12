import axios from 'axios';

import { Chapter } from '@/core/models/Chapter';
import { Manga } from '@/core/models/Manga';
import { Page } from '@/core/models/Page';
import { BaseProvider } from '@/core/providers/BaseProvider';
import { Suggestion } from '@/core/providers/ScanVf/types';
import { mapSuggestionToManga } from '@/core/providers/ScanVf/mapper';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';
import { SCANVF_CONFIG } from '@/config/scanVf';

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

  getManga(_url: string): Promise<Manga> {
    console.log(_url);
    return Promise.resolve({} as Manga);
  }

  getChapters(_url: string): Promise<Chapter[]> {
    console.log(_url);
    return Promise.resolve([]);
  }

  getPages(_chapterUrl: string): Promise<Page[]> {
    console.log(_chapterUrl);
    return Promise.resolve([]);
  }
}
