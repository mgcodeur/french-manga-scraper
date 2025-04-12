import { SCANVF_CONFIG } from './config/scanVf';
import { ScanVfProvider } from './core/providers/ScanVf';

async function main(): Promise<void> {
  const pages = await new ScanVfProvider().getManga(`https://www.scan-vf.net/my-hero-academia/`);

  console.log(pages);
}

main();
