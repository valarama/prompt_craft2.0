import React, { ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface CustomTooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  children, 
  content, 
  side = 'top',
  align = 'center',
  delayDuration = 400
}) => (
  <Tooltip.Provider delayDuration={delayDuration}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content 
          className="bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm max-w-xs z-50 shadow-lg backdrop-blur-sm"
          side={side}
          align={align}
          sideOffset={5}
        >
          {content}
          <Tooltip.Arrow className="fill-slate-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default CustomTooltip;
