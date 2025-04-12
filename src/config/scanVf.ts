import { env } from '@/core/utils/env';

export const SCANVF_CONFIG = {
  baseUrl: env('SCANVF_BASE_URL', 'https://www.scan-vf.net'),
};
