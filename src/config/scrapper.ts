import { env } from '@/core/utils/env';

export const SCRAPPER_CONFIG = {
  dataDir: env('DATA_DIR', new URL('../../data', import.meta.url).pathname),
};
