import { startCase, sortBy, camelCase, upperCase, template } from 'lodash';
import glob from 'glob';
import fs from 'fs';
import { optimize, OptimizedSvg } from 'svgo';

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
  TEMPLATE_VARIABLE: /\$\{(?<name>[^}]+)}/, // TODO: remove
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
function mergeAttributes(attributes: string[] = [], exclude: RegExp = /fill="(?<fill>none\S*)"/) {
  attributes = attributes.filter((item) => !exclude.test(item));
  attributes = sortBy(Array.from(new Set(attributes)));

  return attributes;
}

/**
 * Creates constant with assigned value.
 *
 * @param {string} value Constant value.
 * @param {string} name Attribute name.
 */
function getDefaultValue(value: string, name: string = '') {
  if (value) {
    return `const DEFAULT_${name}_VALUE = ${REGEXPS.ARRAY.test(value) ? value : `'${value}'`};`;
  }
  return '';
}

/**
 * Returns modified value of fill or stroke attributes for template.
 *
 * @param {string} value
 */
 function getTemplateValue(value: string) {
  return `${REGEXPS.ARRAY.test(value) ? value : `'${value}'`};`;
}

/**
 *
 * @param {string} interfaceName
 * @param {string} extedtion
 */
 function extendInterface(interfaceName: string = '', extedtion: string = '') {
  if (!extedtion) {
    return interfaceName;
  }

  return `Modify<${interfaceName}, ${extedtion}>`;
}

type TProps = Record<string, string>;

/**
 * Returns props with default values.
 *
 * @param {TProps} props
 */
function getProps(props: TProps) {
  if (isEmptyValues(props)) {
    return '';
  }

  return Object.keys(props).reduce((res, key) => {
    if (props[key]) {
      return res + ` ${key} = DEFAULT_${upperCase(key)}_VALUE,`;
    }
    return res;
  }, '');
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
 *
 * @param {(arg: number) => string} replacement
 */
function createReplacer(replacement: (arg: number) => string) {
  return (svg = '', attributesItem = '', attributeIndex = 0) => {
    // TODO: remove replaceAll
    return svg.replaceAll(attributesItem, replacement(attributeIndex));
  };
}

/**
 *
 * @param {boolean} isArr True if there are more then one attribute
 * @param {string} attribute
 */
function creteReplacement(isArr: boolean = false, attribute: string = '') {
  const replacement = isArr
    ? (attributeIndex = 0) => `${attribute}={${attribute}[${attributeIndex}]}`
    : () => `${attribute}={${attribute}}`;
  return createReplacer(replacement);
}

/**
 *
 * @param {string} svg
 * @param {string[]} attributes Массив атриибутов
 * @param {(svg?: string, attributesItem?: string, attributeIndex?: number) => string} replacer Функция меняющая значение атрибута
 */
 function replaceSvgAttributes(svg: string, attributes: string[], replacer: (svg?: string, attributesItem?: string, attributeIndex?: number) => string) {
  if (!attributes || attributes.length === 0) {
    return svg;
  }
  return attributes.reduce(replacer, svg);
}

/**
 * @param {string} svgWithProps Content.
 * @param {string} width
 * @param {string} pathToIcon Original svg file destination.
 * @param {string} componentName
 * @param {string} fill
 * @param {string} stroke
 * @param {boolean} isSquareIcon
 */
type TTemplateParams = {
  svgWithProps: string,
  width: string,
  pathToIcon: string,
  componentName: string,
  fill: string,
  stroke: string,
  isSquareIcon: boolean,
}

/**
 * Returns component file content.
 *
 * @param {TTemplateParams} props All icon component props
 */
// TODO: fix template imports
function getIconTemplate({ svgWithProps, width, pathToIcon, componentName, fill, stroke, isSquareIcon }: TTemplateParams) {
  return `/* svg_file:${pathToIcon} */
import { IconPropsInterface, Modify } from './types';
import './styles.css';

${getDefaultValue(fill, 'FILL')}
${getDefaultValue(stroke, 'STROKE')}

/**
 *
 * @param {IconPropsInterface} props
 */
export function ${componentName}(props:\n${extendInterface(
    'IconPropsInterface',
    getExtendedInterface({ fill, stroke }),
  )}) {
  const { width = ${width}, height = ${isSquareIcon ? 'width' : "'auto'"},\n${getProps({
    fill,
    stroke,
  })} ...rest } = props;
  return (
    ${svgWithProps}
  );
}

export default ${componentName};
`;
}

/**
 * Generates svg-component content.
 *
 * @param {OptimizedSvg} svgObj
 * @param {string} componentName
 */
function getComponentSource(svgObj: OptimizedSvg, componentName: string) {
  // Gather arrays of all fill and stroke attributes
  const fill = mergeAttributes(getSvgAttributes(svgObj.data, toGlobal(REGEXPS.FILL)));
  const stroke = mergeAttributes(getSvgAttributes(svgObj.data, toGlobal(REGEXPS.STROKE)));
  const dashedAttrs = mergeAttributes(getSvgAttributes(svgObj.data, toGlobal(REGEXPS.ATTTRS)));

  // Removing width and height
  let svgWithProps = svgObj.data.replace(REGEXPS.HEIGHT, '');
  svgWithProps = svgWithProps.replace(REGEXPS.WIDTH, '');

  // Add class and {...props} at the end of <svg > tag
  // svgWithProps = svgWithProps.replace(
  //   '><',
  //   " style={{ width, height }} {...rest} className={`wb-icon ${props.className || ''}`}><",
  // );

  // Replacing all fill and stroke attributes values to props
  svgWithProps = replaceSvgAttributes(svgWithProps, fill, creteReplacement(fill.length > 1, 'fill'));
  svgWithProps = replaceSvgAttributes(svgWithProps, stroke, creteReplacement(stroke.length > 1, 'stroke'));
  svgWithProps = replaceSvgAttributes(svgWithProps, dashedAttrs, (res, item) => {
    const [attr] = item!.split('=');
    return res!.replaceAll(attr, camelCase(attr));
  });

  const fillToProps = toPropsValue(getAttributesValues(fill, REGEXPS.FILL, ATTRIBUTE_REGEXP_GROUP_NAMES.fill));
  const strokeToProps = toPropsValue(getAttributesValues(stroke, REGEXPS.STROKE, ATTRIBUTE_REGEXP_GROUP_NAMES.stroke));

  const iconProps = {
    svgWithProps,
    width: svgObj.info.width,
    height: svgObj.info.height,
    pathToIcon: svgObj.path || '',
    componentName,
    fill: getTemplateValue(fillToProps),
    stroke: getTemplateValue(strokeToProps),
    isSquareIcon: svgObj.info.width === svgObj.info.height,
    type: getExtendedInterface({ fill: fillToProps, stroke: strokeToProps })
  };

  return iconProps;
  // return getIconTemplate(iconProps);
}

/**
 * @param {string} tmplt Template of icon component.
 * @param {any} srcData Icon file params.
 */
function getIconFileContent(tmplt: string, srcData: any) {
  const svgTagOpen = '<svg';
  const svgTagClose = '/>';

  let { svgWithProps } = srcData;

  const compiled = template(tmplt);
  const res = compiled(srcData);

  const templateToArr = res.split(' ');
  const svgTagOpenIndex = templateToArr.indexOf(svgTagOpen);
  const svgTagCloseIndex = templateToArr.indexOf(svgTagClose);
  const extraSvgAttributes = templateToArr.slice(svgTagOpenIndex + 1, svgTagCloseIndex).join(' ');
  // TODO: rewrite it later
  svgWithProps = svgWithProps.replace('><', `${extraSvgAttributes}><`);


  return '';
}

/**
 * Creates icon component and put it in output folder.
 *
 * @param {string} svg Minifyed svg content.
 * @param {string} name Components name.
 * @param {string} output Output folder.
 * @param {string} tmplt Template of icon component.
 */
export function createComponent(svg: OptimizedSvg, name: string, output: string, tmplt: string) {
  const componentSrcData = getComponentSource(svg, name);

  const iconFileConntent = getIconFileContent(tmplt, componentSrcData);
  // TODO: file extention shhould be optional
  const pathToComponent = output + name + '.tsx';

  fs.writeFileSync(pathToComponent, iconFileConntent);
}
