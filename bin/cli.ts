import { Command } from 'commander';

import { create } from '../src/create';

const program = new Command();

// TODO: add template path option

program
  .requiredOption('-e, --entry <entry>', 'Glob pattern for entry point')
  .option('-r, --rewrite', 'Will rewrite existing files', false)
  .option('-p, --prefix <prefix>', 'Prefix for icon name', '')
  .option('-e, --postfix <postfix>', 'Postfix for icon name', '')
  .option('-o --output <output>', 'Output folder path', process.cwd())
  .parse(process.argv);

const { entry, rewrite, prefix, postfix, output } = program.opts();

create({ entry, rewrite, prefix, postfix, output });
