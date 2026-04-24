'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { cn } from '@/utils/cn';
import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as ButtonGroup from '@/components/ui/button-group';

type Series = { date: string; value: number }[];
type VizData = { engagement: Series; reach: Series; sentiment: Series };

const FALLBACK: VizData = {
  engagement: [340,480,420,610,530,390,450].map((v, i) => ({ date: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v })),
  reach:      [1200,1850,1600,2100,1900,1400,1700].map((v, i) => ({ date: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v })),
  sentiment:  [52,58,49,63,60,55,57].map((v, i) => ({ date: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], value: v })),
};

const METRIC_COLORS: Record<string, string> = {
  engagement: 'hsl(var(--primary-base))',
  reach: '#f59e0b',
  sentiment: '#22c55e',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-3 shadow-regular-md backdrop-blur-md">
        <p className="mb-1 text-label-xs font-bold text-white/50 uppercase tracking-wider">{payload[0].payload.date}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-label-sm text-white/70">Value</span>
              <span className="text-label-sm font-bold" style={{ color: entry.stroke }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WidgetDataVisualization() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<VizData>('data-viz', keyword, FALLBACK);
  const [selected, setSelected] = React.useState<'engagement' | 'reach' | 'sentiment'>('engagement');

  const series = data[selected] ?? FALLBACK[selected];
  const color = METRIC_COLORS[selected];
  const gradId = `grad-${selected}`;

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 7 · Data Visualization</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>Weekly Metrics</div>
            <Badge.Root variant='light' color='blue' size='medium'>Charts</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <ButtonGroup.Root size='xxsmall' className='grid auto-cols-fr grid-flow-col' asChild>
        <ToggleGroupPrimitive.Root type='single' value={selected} onValueChange={(v) => v && setSelected(v as typeof selected)}>
          <ButtonGroup.Item asChild><ToggleGroupPrimitive.Item value='engagement'>Engagement</ToggleGroupPrimitive.Item></ButtonGroup.Item>
          <ButtonGroup.Item asChild><ToggleGroupPrimitive.Item value='reach'>Reach</ToggleGroupPrimitive.Item></ButtonGroup.Item>
          <ButtonGroup.Item asChild><ToggleGroupPrimitive.Item value='sentiment'>Sentiment</ToggleGroupPrimitive.Item></ButtonGroup.Item>
        </ToggleGroupPrimitive.Root>
      </ButtonGroup.Root>

      <ResponsiveContainer width='100%' height={120}>
        <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}
          className={cn('[&_.recharts-cartesian-grid-horizontal>line]:stroke-stroke-soft-200')}>
          <defs>
            <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={color} stopOpacity={0.2} />
              <stop offset='95%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' vertical={false} />
          <XAxis dataKey='date' hide />
          <YAxis hide />
          <Tooltip 
            content={<CustomTooltip />} 
            wrapperStyle={{ outline: 'none' }}
          />
          <Area type='monotone' dataKey='value' stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
