import React from 'react';
import { Line, Circle } from 'rc-progress';

export const Progress = ({
  type,
  percent,
  strokeWidth,
  className,
  style,
  strokeColor,
  gapPosition,
  trailColor,
  trailWidth,
}: {
  type: 'line' | 'circle';
  percent: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  strokeColor?: string;
  gapPosition?: 'top' | 'right' | 'bottom' | 'left';
  trailColor?: string;
  trailWidth?: number;
}) => {
  return (
    <div>
      {type === 'line' && (
        <Line
          percent={percent}
          strokeWidth={strokeWidth}
          className={className}
          style={style}
          strokeColor={strokeColor}
          gapPosition={gapPosition}
          trailColor={trailColor}
          trailWidth={trailWidth}
          prefixCls="progress"
        />
      )}
      {type === 'circle' && (
        <Circle
          percent={percent}
          strokeWidth={strokeWidth}
          className={className}
          style={style}
          strokeColor={strokeColor}
          gapPosition={gapPosition}
          trailColor={trailColor}
          trailWidth={trailWidth}
          prefixCls="progress"
        />
      )}
    </div>
  );
};
