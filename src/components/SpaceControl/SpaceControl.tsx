import { FC, MouseEvent, useState } from 'react';
import { ChangeValue } from './components/ChangeValue';

const VALUE_WIDTH = 34;
const VALUE_HEIGHT = 24;

const BORDER = 1;
const INNER_MARGIN = 3;

const MOST_INNER_WIDTH = 62;
const MOST_INNER_HEIGHT = 6;

const INNER_WIDTH = MOST_INNER_WIDTH + (VALUE_WIDTH + BORDER) * 2;
const INNER_HEIGHT = MOST_INNER_HEIGHT + (VALUE_HEIGHT + BORDER) * 2;

const TOTAL_WIDTH = INNER_WIDTH + (INNER_MARGIN + VALUE_WIDTH + BORDER) * 2;
const TOTAL_HEIGHT = INNER_HEIGHT + (INNER_MARGIN + VALUE_HEIGHT + BORDER) * 2;

export type SpaceProperties =
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft';

export type SpaceValueType = Record<SpaceProperties, string>;

type SpaceControlProps = {
  name?: string;
  value?: Record<SpaceProperties, string>;
  options?: MeshType.Options[];
  isReadOnly?: boolean;
  onChange: (type: SpaceProperties, value: string) => void;
};

export const SpaceControl: FC<SpaceControlProps> = ({ name, value, onChange, options, isReadOnly }) => {
  const [hoveredState, setHoveredState] = useState({
    'segment-marginTop': false,
    'segment-marginRight': false,
    'segment-marginBottom': false,
    'segment-marginLeft': false,
    'segment-paddingTop': false,
    'segment-paddingRight': false,
    'segment-paddingBottom': false,
    'segment-paddingLeft': false,
    'value-marginTop': false,
    'value-marginRight': false,
    'value-marginBottom': false,
    'value-marginLeft': false,
    'value-paddingTop': false,
    'value-paddingRight': false,
    'value-paddingBottom': false,
    'value-paddingLeft': false,
  });

  const onMouseOverSegment = (e: MouseEvent<SVGPathElement>) => {
    if (isReadOnly) return;
    const elementId = (e.target as SVGPathElement).id;
    setHoveredState(prev => ({ ...prev, [`segment-${elementId}`]: true }));
  };

  const onMouseLeaveSegment = (e: MouseEvent<SVGPathElement>) => {
    if (isReadOnly) return;
    const elementId = (e.target as SVGPathElement).id;
    setHoveredState(prev => ({ ...prev, [`segment-${elementId}`]: false }));
  };

  const onMouseOverValue = (e: MouseEvent<HTMLButtonElement>) => {
    if (isReadOnly) return;
    const dataProperty = (e.target as HTMLButtonElement).getAttribute('data-property');

    setHoveredState(prev => ({ ...prev, [`value-${dataProperty}`]: true }));
  };

  const onMouseLeaveValue = (e: MouseEvent<HTMLButtonElement>) => {
    if (isReadOnly) return;
    const dataProperty = (e.target as HTMLButtonElement).getAttribute('data-property');

    setHoveredState(prev => ({ ...prev, [`value-${dataProperty}`]: false }));
  };

  const isHovered = (type: SpaceProperties) => hoveredState[`value-${type}`] || hoveredState[`segment-${type}`];

  return (
    <div className="space-control">
      <div className="container">
        <div className="item">Margin</div>
        <div className="item item-iner">Padding</div>
        <div className="value property-marginTop">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r1s:"
            data-state="closed"
            className="button-wrapper"
          />

          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            dataProperty="marginTop"
            options={options}
            type="marginTop"
            onChange={onChange}
            value={value?.['marginTop']}
          />
        </div>
        <div className="value property-marginRight">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r1u:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            options={options}
            type="marginRight"
            dataProperty="marginRight"
            onChange={onChange}
            value={value?.['marginRight']}
          />
        </div>
        <div className="value property-marginBottom">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r20:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            options={options}
            type="marginBottom"
            dataProperty="marginBottom"
            onChange={onChange}
            value={value?.['marginBottom']}
          />
        </div>
        <div className="value property-marginLeft">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r22:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            options={options}
            type="marginLeft"
            dataProperty="marginLeft"
            onChange={onChange}
            value={value?.['marginLeft']}
          />
        </div>
        <div className="value property-paddingTop">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r24:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            options={options}
            dataProperty="paddingTop"
            type="paddingTop"
            onChange={onChange}
            value={value?.['paddingTop']}
          />
        </div>
        <div className="value property-paddingRight">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r26:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            dataProperty="paddingRight"
            options={options}
            type="paddingRight"
            onChange={onChange}
            value={value?.['paddingRight']}
          />
        </div>
        <div className="value property-paddingBottom">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r28:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            dataProperty="paddingBottom"
            options={options}
            type="paddingBottom"
            onChange={onChange}
            value={value?.['paddingBottom']}
          />
        </div>
        <div className="value property-paddingLeft">
          <div
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="radix-:r2a:"
            data-state="closed"
            className="button-wrapper"
          />
          <ChangeValue
            onMouseEnter={onMouseOverValue}
            onMouseLeave={onMouseLeaveValue}
            dataProperty="paddingLeft"
            options={options}
            type="paddingLeft"
            onChange={onChange}
            value={value?.['paddingLeft']}
          />
        </div>
      </div>
      <svg
        width={TOTAL_WIDTH}
        height={TOTAL_HEIGHT}
        viewBox="0 0 208 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath={`url(#radix-:r1q:-${name})`}>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="marginTop"
            d="M208 0H0L77.25 56H130.75L208 0Z"
            className={`margin-top ${isHovered('marginTop') ? 'hover' : ''}`}
          ></path>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="marginRight"
            d="M208 112L130.75 56L208 0V112Z"
            className={`margin-right ${isHovered('marginRight') ? 'hover' : ''}`}
          ></path>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="marginBottom"
            d="M208 112H0L77.25 56H130.75L208 112Z"
            className={`margin-bottom ${isHovered('marginBottom') ? 'hover' : ''}`}
          ></path>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="marginLeft"
            d="M0 0L77.25 56L0 112V0Z"
            className={`margin-left ${isHovered('marginLeft') ? 'hover' : ''}`}
          ></path>
        </g>
        <rect rx="2.5" x="0.5" y="0.5" width="207" height="111" className="vertical-rect"></rect>
        <rect rx="2.5" x="35.5" y="25.5" width="137" height="61" className="horizontal-rect"></rect>
        <g clipPath={`url(#radix-:r1r:-${name})`}>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="paddingTop"
            d="M208 0H0L77.25 56H130.75L208 0Z"
            className={`padding-top ${isHovered('paddingTop') ? 'hover' : ''}`}
          ></path>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="paddingRight"
            d="M208 112L130.75 56L208 0V112Z"
            className={`padding-right ${isHovered('paddingRight') ? 'hover' : ''}`}
          ></path>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="paddingBottom"
            d="M208 112H0L77.25 56H130.75L208 112Z"
            className={`padding-bottom ${isHovered('paddingBottom') ? 'hover' : ''}`}
          ></path>
          <path
            onMouseOver={onMouseOverSegment}
            onMouseLeave={onMouseLeaveSegment}
            id="paddingLeft"
            d="M0 0L77.25 56L0 112V0Z"
            className={`padding-left ${isHovered('paddingLeft') ? 'hover' : ''}`}
          ></path>
        </g>
        <rect rx=".5" x="38.5" y="28.5" width="131" height="55" className="vertical-rect"></rect>
        <rect rx=".5" x="73.5" y="53.5" width="61" height="5" className="horizontal-rect"></rect>
        <defs>
          <clipPath id={`radix-:r1q:-${name}`}>
            {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
            <rect rx="2.5" x="0.5" y="0.5" width="207" height="111" className="c-eyrheu"></rect>
          </clipPath>
          <clipPath id={`radix-:r1r:-${name}`}>
            {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
            <rect rx=".5" x="38.5" y="28.5" width="131" height="55" className="c-eyrheu"></rect>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
