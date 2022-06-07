import { startCase } from 'lodash';
import glob from 'glob';

/**
 * @param {string} name File name.
 * @param {prefix} [prefix] Prefix for component name.
 * @param {postfix} [postfix] Postfix for component name.
 */
type TComponentNameArgs = {
  name: string;
  prefix?: string;
  postfix?: string;
};
/**
 * Returns component name.
 *
 * @returns {string} time-fast.svg -> TimeFast
 */
export function getComponentName({ name, prefix, postfix }: TComponentNameArgs): string {
  name = name.replace('.svg', '');
  return startCase(`${prefix}-${name}-${postfix}`).split(' ').join('');
}

/**
 * Looking for files with the same name in output folder.
 *
 * @param {string} name Component name.
 * @param {string} output Output folder glob.
 */
export function hasDupe(name: string, output: string) {
  const files = glob.sync(output);

  return files
    .map((item) => {
      const [fileName] = item.replace(/^.*[/\\]/, '').split('.');
      return fileName;
    })
    .includes(name);
}

/**
 * Minify SVG-icon and returns OptimizedSvg from svgo.
 *
 * @param {string} pathToIcon Path to current icon path.
 * @param {string} idPrefix Prefix for svg ids of icon.
 */
export function getMinifiedSVG(pathToIcon: string, idPrefix: string) {}

/**
 * Creates type for color props of icon component.
 *
 * @param {string} svg Svg content.
 */
export function getSvgColorType(svg: string = '') {}

/**
 * Creates icon component and put it in output folder.
 *
 * @param {string} svg Minifyed svg content.
 * @param {string} name Components name.
 * @param {string} output Output folder.
 */
export function createComponent(svg: string, name: string, output: string) {}
