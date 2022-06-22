import glob from 'glob';
import fs from 'fs';
import { kebabCase } from 'lodash';

import { getComponentName, hasDupe, getMinifiedSVG, getSvgColorType, createComponent } from './utils';
import { TCreateFNParams } from './types';

const DEFAULT_ICON_TEMPLATE_PATH = './icon-template.js'

// TODO: add hooks

export async function create({
  entry,
  output,
  prefix = '',
  rewrite = false,
  postfix = '',
  extention = '.tsx',
  iconTemplatePath = DEFAULT_ICON_TEMPLATE_PATH,
}: TCreateFNParams) {
  if (!entry) {
    throw Error('Entry should not be empty!');
  }

  console.log('Looking for new svgs...');

  const files = glob.sync(entry);

  console.log('Creating components...');

  files.forEach((item) => {
    const iconName = item.replace(/^.*[/\\]/, '');

    const componentName = prefix + getComponentName({ name: iconName, prefix, postfix });

    if (rewrite || !hasDupe(componentName, output)) {
      console.log(`Processing ${componentName}.`);

      const svgData = getMinifiedSVG(item, kebabCase(componentName));

      if (svgData.error || svgData.modernError) {
        throw Error(svgData.error);
      }

      const colorsType = getSvgColorType(svgData.data);

      const template = fs.readFileSync(iconTemplatePath, 'utf-8');

      createComponent({svg: svgData, name: componentName, output, tmplt: template, extention});
    }
  });

  console.log('DONE!');
}
