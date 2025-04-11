import { Chapter } from '../models/Chapter';
import { Manga } from '../models/Manga';
import { Page } from '../models/Page';


export interface BaseProvider {
  search(query: string): Promise<Manga[]>;
  getManga(url: string): Promise<Manga>;
  getChapters(url: string): Promise<Chapter[]>;
  getPages(chapterUrl: string): Promise<Page[]>;
}