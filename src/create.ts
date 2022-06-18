import glob from 'glob';
import fs from 'fs';
import { kebabCase } from 'lodash';

import { getComponentName, hasDupe, getMinifiedSVG, getSvgColorType, createComponent } from './utils';

type TCreateFNParams = {
  entry: string;
  output: string;
  rewrite?: boolean;
  prefix?: string;
  postfix?: string;
  iconTemplatePath?: string;
};

const DEFAULT_ICON_TEMPLATE_PATH = './icon-template.js'

export async function create({ entry, output, rewrite = false, prefix = '', postfix = '', iconTemplatePath = DEFAULT_ICON_TEMPLATE_PATH }: TCreateFNParams) {
  if (!entry) {
    throw Error('Entry should not be empty!');
  }

  console.log('Looking for new svgs...');

  const files = glob.sync(entry);

  console.log('Creating components...');

  files.forEach((item) => {
    const iconName = item.replace(/^.*[/\\]/, '');

    const componentName = prefix + getComponentName({ name: iconName, prefix, postfix });
    // TODO: check extension later

    if (rewrite || !hasDupe(componentName, output)) {
      console.log(`Processing ${componentName}.`);

      const svgData = getMinifiedSVG(item, kebabCase(componentName));

      if (svgData.error || svgData.modernError) {
        throw Error(svgData.error);
      }

      const colorsType = getSvgColorType(svgData.data);

      const template = fs.readFileSync(iconTemplatePath, 'utf-8');

      createComponent(svgData, componentName, output, template);
    }
  });

  console.log('DONE!');
}
