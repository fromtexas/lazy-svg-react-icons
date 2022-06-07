import glob from 'glob';
import { kebabCase } from 'lodash';

import { getComponentName, hasDupe, getMinifiedSVG, getSvgColorType, createComponent } from './utils';

type TCreateFNParams = {
  entry: string;
  output: string;
  rewrite?: boolean;
  prefix?: string;
  postfix?: string;
};

export async function create({ entry, output, rewrite = false, prefix = '', postfix = '' }: TCreateFNParams) {
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
      const colorsType = getSvgColorType(svgData);

      createComponent(svgData, componentName, output);
    }
  });

  console.log('DONE!');
}
