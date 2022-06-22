import { OptimizedSvg } from 'svgo';

/**
 * @param {string} entry Folder with svg files.
 * @param {string} output Folder to put icons components.
 * @param {boolean} [rewrite] Generates and rewrites all icons component.
 * @param {string} [prefix] Prefix for icon component name.
 * @param {string} [postfix] Postfix for icon component name.
 * @param {string} [extention] Icon component file extention, .tsx by default.
 * @param {string} [iconTemplatePath] Path for icon template.
 */
export type TCreateFNParams = {
  entry: string;
  output: string;
  rewrite?: boolean;
  prefix?: string;
  postfix?: string;
  extention?: string;
  iconTemplatePath?: string;
};

/**
 * @param {string} name File name.
 * @param {string} [prefix] Prefix for component name.
 * @param {string} [postfix] Postfix for component name.
 */
export type TComponentNameArgs = {
  name: string;
  prefix?: string;
  postfix?: string;
};

/**
 * @param {string} svg Minifyed svg content.
 * @param {string} name Components name.
 * @param {string} output Output folder.
 * @param {string} tmplt Template of icon component.
 * @param {string} extention Icon component extention.
 */
export type TCreateComponentArgs = {
  svg: OptimizedSvg;
  name: string;
  output: string;
  tmplt: string;
  extention: string;
};
