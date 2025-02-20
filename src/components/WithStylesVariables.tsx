import { FC, useMemo } from 'react';
import { getColorTokensCSSVars, getDimensionTokensCSSVars } from '@/utils';

interface WithStylesVariablesProps {
  colors?: NonNullable<Type.KVStorage['colors']>;
  dimensions?: NonNullable<Type.KVStorage['dimensions']>;
}

const WithStylesVariables: FC<WithStylesVariablesProps> = ({ colors, dimensions }) => {
  const colorCssVariables = useMemo(() => colors && getColorTokensCSSVars(colors), [colors]);
  const dimensionCssVariables = useMemo(() => dimensions && getDimensionTokensCSSVars(dimensions), [dimensions]);
  return (
    <>
      {colorCssVariables && <div dangerouslySetInnerHTML={{ __html: colorCssVariables }} />}
      {dimensionCssVariables && <div dangerouslySetInnerHTML={{ __html: dimensionCssVariables }} />}
    </>
  );
};

export default WithStylesVariables;
