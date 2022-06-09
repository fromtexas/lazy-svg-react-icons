import { startCase, sortBy } from 'lodash';
import glob from 'glob';
import fs from 'fs';
import { optimize } from 'svgo';

const REGEXPS = { // TODO: move it to constants
  WIDTH: /width="(?<width>\S*)"/,
  HEIGHT: /height="(?<height>\S*)"/,
  FILL: /fill="(?<fill>\S*)"/,
  STROKE: /stroke="(?<stroke>\S*)"/,
  VIEWBOX: /viewBox="(?<viewBox>[\d\s]*)"/,
  STYLE: /style="(?<style>[\S]*)"/,
  SVG: /(?<svg>[\s\S]*?)>/,
  ARRAY: /\[.*\]/,
  ATTTRS: /(?<attr>(\S*['-])([a-zA-Z'-]+))="(?<data>[\S]*)"/,
};

const ATTRIBUTE_REGEXP_GROUP_NAMES = {
  fill: 'fill',
  stroke: 'stroke',
};

/**
 * Makes regex global.
 *
 * @param {RegExp} regexp
 */
function toGlobal(regexp: RegExp) {
  return new RegExp(regexp, 'g');
}

/**
 * Returns array of svg attributes.
 *
 * @param {string} svg
 * @param {string} attributeRegexp
 */
function getSvgAttributes(svg: string, attributeRegexp: RegExp) {
  return svg.match(attributeRegexp) || [];
}

/**
 * Removes the same attributes from array.
 *
 * @param {string[]} attributes
 * @param {RegExp} exclude Regexp excludes from array attributes
 */
function mergeAttributes(attributes: string[] = [], exclude = /fill="(?<fill>none\S*)"/) {
  attributes = attributes.filter((item) => !exclude.test(item));
  attributes = sortBy(Array.from(new Set(attributes)));

  return attributes;
}

/**
 * Checks if object has no values.
 *
 * @param {Record<string, any>} obj
 */
function isEmptyValues(obj: Record<string, any> = {}) {
  return Object.values(obj).filter(Boolean).length === 0;
}

/**
 * Возвращает тип соответсвующий свойствам переданного объекта.
 * Returns props type of created icon component
 *
 * @param {Record<string, string>} props
 */
function getExtendedInterface(props: Record<string, string>) {
  if (isEmptyValues(props)) {
    return '';
  }

  const interfaceData = Object.keys(props).reduce((res, key) => {
    if (REGEXPS.ARRAY.test(props[key])) {
      return res + `${key}?: string[],`; // TODO: tuple
    }
    if (props[key]) {
      return res + `${key}?: string,`;
    }
    return res;
  }, '');

  return `{ ${interfaceData} }`;
}

/**
 * Makes string from passesed array of values.
 *
 * @param {string[]} values
 */
 function toPropsValue(values: string[] = []) {
  if (values.length > 1) {
    return JSON.stringify(values);
  }
  return values[0];
}

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
 * @param {string[]} attributes Svg's attributes.
 * @param {RegExp} attributeRegexp Regexp returns attribute value.
 * @param {string} groupName Regexp group name.
 */
 function getAttributesValues(attributes: string[], attributeRegexp: RegExp, groupName: string = '') {
  if (!attributes || attributes.length === 0) {
    return [];
  }
  const values = attributes.map((item) => attributeRegexp.exec(item)?.groups?.[groupName]);
  return values.filter(Boolean) as string[];
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
export function getMinifiedSVG(pathToIcon: string, idPrefix: string) {
  const content = fs.readFileSync(pathToIcon, 'utf-8');

  return optimize(content, {
    path: pathToIcon,
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            cleanupIDs: {
              prefix: idPrefix,
              remove: false,
              minify: true,
            },
          },
        },
      },
    ],
  });
}

/**
 * Creates type for color props of icon component.
 *
 * @param {string} svg Svg content.
 */
export function getSvgColorType(svg: string = '') {
  const fill = mergeAttributes(getSvgAttributes(svg, toGlobal(REGEXPS.FILL)));
  const stroke = mergeAttributes(getSvgAttributes(svg, toGlobal(REGEXPS.STROKE)));

  return getExtendedInterface({
    fill: toPropsValue(getAttributesValues(fill, REGEXPS.FILL, ATTRIBUTE_REGEXP_GROUP_NAMES.fill)),
    stroke: toPropsValue(getAttributesValues(stroke, REGEXPS.STROKE, ATTRIBUTE_REGEXP_GROUP_NAMES.stroke)),
  });
}

/**
 * Creates icon component and put it in output folder.
 *
 * @param {string} svg Minifyed svg content.
 * @param {string} name Components name.
 * @param {string} output Output folder.
 */
export function createComponent(svg: string, name: string, output: string) {}
