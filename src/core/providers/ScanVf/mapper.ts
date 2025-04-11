import { Manga } from '../../models/Manga';
import { Suggestion } from './types';

export function mapSuggestionToManga(s: Suggestion): Manga {
    return {
        title: s.value,
        url: s.data.startsWith("http") ? s.data : `https://www.scan-vf.net/${s.data}`,
        cover: "",
        source: "scan-vf",
        status: "unknown",
    };
}