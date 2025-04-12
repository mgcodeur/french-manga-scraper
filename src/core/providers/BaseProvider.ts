import { Chapter } from '@/core/models/Chapter';
import { Manga } from '@/core/models/Manga';
import { Page } from '@/core/models/Page';


export interface BaseProvider {
  search(query: string): Promise<Manga[]>;
  getManga(url: string): Promise<Manga>;
  getChapters(url: string): Promise<Chapter[]>;
  getPages(chapterUrl: string): Promise<Page[]>;
}