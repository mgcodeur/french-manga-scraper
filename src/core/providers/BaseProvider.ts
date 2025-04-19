import { Chapter } from '@/core/models/Chapter';
import { Manga } from '@/core/models/Manga';
import { Page } from '@/core/models/Page';

export interface BaseProvider {
  search(_query: string): Promise<Manga[]>;
  getManga(_url: string): Promise<Manga>;
  getChapters(_url: string): Promise<Chapter[]>;
  getPages(_chapterUrl: string): Promise<Page[]>;
  getMangaWithChaptersAndPages(
    _manga: Manga,
    _numberOfChapters?: number,
    _fromChapter?: number
  ): Promise<Manga>;
  saveManga(_manga: Manga): Promise<Manga>;
  sendWebhook(_webhookUrl: string, _manga: Manga): Promise<void>;
}
