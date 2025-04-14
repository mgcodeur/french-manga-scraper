import { ScanVfProvider } from '@/core/providers/ScanVf';
import { BaseProvider } from '@/core/providers/BaseProvider';

export function getProvider(name: string): BaseProvider | null {
  switch (name.toLowerCase()) {
    case 'scanvf':
      return new ScanVfProvider();
    default:
      return null;
  }
}
