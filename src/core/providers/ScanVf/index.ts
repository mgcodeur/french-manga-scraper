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

import fs from 'fs';
import path from 'path';
import { SCRAPPER_CONFIG } from '@/config/scrapper';
import { slugify } from '@/core/utils/string';

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

  async getPages(_chapterUrl: string): Promise<Page[]> {
    try {
      const { data } = await axios.get(_chapterUrl.trim());

      const $ = cheerio.load(data);

      return (
        $('#all img')
          .map((index, el) => {
            return {
              number: index + 1,
              image: $(el).attr('data-src')?.trim() || '',
            };
          })
          .toArray() || []
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ScanVfSearchException(error.message);
      }
      throw new ScanVfSearchException('An unknown error occurred');
    }
  }

  async getMangaWithChaptersAndPages(
    _manga: Manga,
    _numberOfChapters: number = 10,
    _fromChapter: number = 1
  ): Promise<Manga> {
    const chapters = _manga.chapters;

    if (!chapters) {
      throw new ScanVfSearchException('No chapters found');
    }

    _manga.chapters = chapters
      ?.filter((chapter: Chapter) => chapter.number >= _fromChapter)
      .slice(0, _numberOfChapters);

    for (const chapter of _manga.chapters) {
      const pages = await this.getPages(chapter.url);
      chapter.pages = pages;
    }

    return _manga;
  }

  async saveManga(_manga: Manga): Promise<Manga> {
    const mangaDir = path.join(SCRAPPER_CONFIG.dataDir, slugify(_manga.title));

    if (!fs.existsSync(mangaDir)) {
      fs.mkdirSync(mangaDir, { recursive: true });
    }

    const mangaFilePath = path.join(mangaDir, 'manga.json');

    let savedManga: Manga | null = null;

    if (fs.existsSync(mangaFilePath)) {
      const savedData = fs.readFileSync(mangaFilePath, 'utf-8');
      savedManga = JSON.parse(savedData) as Manga;

      const existingChapters = savedManga.chapters || [];
      const newChapters = _manga.chapters || [];

      const mergedChapters = [
        ...existingChapters,
        ...newChapters.filter(
          (newChapter) => !existingChapters.some((existing) => existing.url === newChapter.url)
        ),
      ];

      savedManga.chapters = mergedChapters;
    } else {
      savedManga = _manga;
    }

    fs.writeFileSync(mangaFilePath, JSON.stringify(savedManga, null, 2));

    return savedManga;
  }

  async sendWebhook(_webhookUrl: string, _data: Manga): Promise<void> {
    try {
      console.log(`Sending webhook to ${_webhookUrl}...`);
      await axios.post(_webhookUrl, _data, {
        withCredentials: false,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ScanVfSearchException(error?.message);
      }
      throw new ScanVfSearchException('An unknown error occurred');
    }
  }
}
