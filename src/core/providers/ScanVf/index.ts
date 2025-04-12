
import axios from "axios"

import { Chapter } from '@/core/models/Chapter';
import { Manga } from '@/core/models/Manga';
import { Page } from '@/core/models/Page';
import { BaseProvider } from '@/core/providers/BaseProvider';
import { Suggestion } from '@/core/providers/ScanVf/types';
import { mapSuggestionToManga } from '@/core/providers/ScanVf/mapper';
import { ScanVfSearchException } from '@/core/exceptions/ScanVfSearchException';
import { SCANVF_CONFIG } from "@/config/scanVf";

export class ScanVfProvider implements BaseProvider {
    async search(query: string): Promise<Manga[]> {
        const searchUrl: string = `${SCANVF_CONFIG.baseUrl}/search?query=${query}`;

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