import React, { FC } from 'react';
import { getTokenNameFromVar, isAliasValue, resolveDesignTokenValue } from '@/utils';

type BorderExampleProps = {
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
};

const BorderExample: FC<BorderExampleProps> = borderStyleProps => {
  const { borderRadius, borderWidth, borderColor, borderStyle } = Object.entries(
    borderStyleProps
  ).reduce<BorderExampleProps>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: isAliasValue(value) && value ? `var(--${resolveDesignTokenValue(value)})` : value,
    }),
    {}
  );
  return (
    <div
      title={`Radius:[${getTokenNameFromVar(borderRadius)}] Width:[${getTokenNameFromVar(
        borderWidth
      )}] Color:[${getTokenNameFromVar(borderColor)}] Style:[${getTokenNameFromVar(borderStyle)}]`}
      className="h-8 w-12 bg-white bg-zero-pattern"
      style={{ borderRadius, borderWidth, borderColor, borderStyle }}
    />
  );
};

export default BorderExample;
