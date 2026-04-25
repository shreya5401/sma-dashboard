'use client';

import { RiRadioButtonLine } from '@remixicon/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { WidgetDetailsModal } from '@/components/widget-details-modal';

type TimePoint = { time: string; mentions: number };
type KW = { word: string; count: number; trend: string };
type MonitorData = { mentions_per_hour: number; time_series: TimePoint[]; top_keywords: KW[] };

const FALLBACK: MonitorData = {
  mentions_per_hour: 312,
  time_series: [42,28,134,210,189,267,312,284,198,95].map((v, i) => ({
    time: ['00:00','04:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'][i], mentions: v,
  })),
  top_keywords: [{ word: 'Tesla', count: 312, trend: '+18%' }, { word: 'Musk', count: 248, trend: '+9%' }, { word: 'EV', count: 197, trend: '+24%' }],
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-3 shadow-regular-md backdrop-blur-md">
        <p className="mb-1 text-label-xs font-bold text-white/50 uppercase tracking-wider">{payload[0].payload.time}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-label-sm text-white/70">Mentions</span>
              <span className="text-label-sm font-bold" style={{ color: entry.stroke }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WidgetRealtimeMonitoring() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<MonitorData>('monitoring', keyword, FALLBACK);

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 10 · Real-Time Monitoring</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{data.mentions_per_hour} Mentions/hr</div>
            <Badge.Root variant='light' color='green' size='medium'>
              <RiRadioButtonLine className='size-3 animate-pulse' />
              Live
            </Badge.Root>
          </div>
        </div>
        <WidgetDetailsModal 
          title="Real-Time Monitoring" 
          moduleNumber="Module 10" 
          description="High-velocity data ingestion and indexing. Tracks global mentions and topic spikes across multiple platforms with sub-second latency."
          data={{ mentions_hr: data.mentions_per_hour, keywords_tracked: data.top_keywords.length }}
        />
      </div>

      <ResponsiveContainer width='100%' height={110}>
        <AreaChart data={data.time_series} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id='mentionsGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='hsl(var(--primary-base))' stopOpacity={0.2} />
              <stop offset='95%' stopColor='hsl(var(--primary-base))' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' vertical={false} />
          <XAxis dataKey='time' hide />
          <YAxis hide />
          <Tooltip 
            content={<CustomTooltip />} 
            wrapperStyle={{ outline: 'none' }}
          />
          <Area type='monotone' dataKey='mentions' stroke='hsl(var(--primary-base))' strokeWidth={2} fill='url(#mentionsGrad)' dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary-base))' }} />
        </AreaChart>
      </ResponsiveContainer>

      <div className='flex flex-col gap-2'>
        {data.top_keywords.map((kw, i) => (
          <div key={i} className='flex items-center gap-2'>
            <div className='size-1.5 rounded-full bg-primary-base shrink-0' />
            <div className='flex-1 text-label-sm text-text-sub-600'>#{kw.word}</div>
            <span className='text-paragraph-sm tabular-nums text-text-sub-600'>{kw.count}</span>
            <Badge.Root variant='light' color='green' size='small'>{kw.trend}</Badge.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
