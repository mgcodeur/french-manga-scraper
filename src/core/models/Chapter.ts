import { Page } from '@/core/models/Page';

export interface Chapter {
    title: string;
    url: string;
    number?: number;
    uploadDate?: Date;
    pages?: Page[];
}