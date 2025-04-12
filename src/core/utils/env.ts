import * as dotenv from 'dotenv';
import { MissingEnvVariableException } from '@/core/exceptions/MissingEnvVariableException';

dotenv.config();

export const env = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    
    if (value === undefined && defaultValue === undefined) {
        throw new MissingEnvVariableException(key);
    }
    
    return value ?? defaultValue!;
}