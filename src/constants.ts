export const REGEXPS = {
  WIDTH: /width="(?<width>\S*)"/,
  HEIGHT: /height="(?<height>\S*)"/,
  FILL: /fill="(?<fill>\S*)"/,
  STROKE: /stroke="(?<stroke>\S*)"/,
  VIEWBOX: /viewBox="(?<viewBox>[\d\s]*)"/,
  STYLE: /style="(?<style>[\S]*)"/,
  SVG: /(?<svg>[\s\S]*?)>/, // TODO: fix bug in group 2
  ARRAY: /\[.*\]/,
  ATTTRS: /(?<attr>(\S*['-])([a-zA-Z'-]+))="(?<data>[\S]*)"/,
};

export const ATTRIBUTE_REGEXP_GROUP_NAMES = {
  fill: 'fill',
  stroke: 'stroke',
};
