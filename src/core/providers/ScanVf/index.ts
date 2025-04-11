
import axios from "axios"

import { Chapter } from '../../models/Chapter';
import { Manga } from '../../models/Manga';
import { Page } from '../../models/Page';
import { BaseProvider } from '../BaseProvider';
import { Suggestion } from './types';
import { mapSuggestionToManga } from './mapper';
import { ScanVfSearchException } from '../../exceptions/ScanVfSearchException';

export class ScanVfProvider implements BaseProvider {
    async search(query: string): Promise<Manga[]> {
        const searchUrl: string = `https://www.scan-vf.net/search?query=${query}`; 

        try {
            const { data } = await axios.get(searchUrl);
            const suggestions: Suggestion[] = await data.suggestions;
            return suggestions.map(mapSuggestionToManga);
        } catch (error) {
            throw new ScanVfSearchException("Error fetching search results from ScanVF");
        }
    }
    
    getManga(url: string): Promise<Manga> {
        return Promise.resolve({} as Manga);
    }
    
    getChapters(url: string): Promise<Chapter[]> {
        return Promise.resolve([]);
    }
    
    getPages(chapterUrl: string): Promise<Page[]> {
        return Promise.resolve([]);
    }
}