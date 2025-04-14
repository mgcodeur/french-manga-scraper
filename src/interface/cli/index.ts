import { Command } from 'commander';
import { runSave } from '@/interface/cli/commands/save';

const program = new Command();

program
  .name('manga-cli')
  .description('CLI tool to scrape manga from multiple providers')
  .version('1.0.0');

program
  .command('save')
  .argument('<provider>', 'provider name (e.g., scanvf)')
  .argument('<url>', 'manga URL')
  .argument('[numberOfChapters]', 'number of chapters to save', '5')
  .argument('[fromChapter]', 'starting chapter number', '1')
  .action(runSave);

program.parse(process.argv);
