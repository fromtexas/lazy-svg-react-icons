`
/* svg_file:${pathToIcon} */

const DEFAULT_FILL_VALUE = ${fill};
const DEFAULT_STROKE_VALUE = ${stroke};

type TProps = ${type};

/**
 *
 * @param {TProps}
 */
export function ${componentName}(props: TProps) {
  const {
    width = ${width},
    height = ${height},
    fill = DEFAULT_FILL_VALUE,
    stroke = DEFAULT_STROKE_VALUE,
    ...rest
   } = props;

   return (
    <svg className={"wb-icon" + " " + props.className || ''} style={{ width, height }} {...rest} />
  );
}

export default ${componentName};
`
