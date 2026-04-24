'use client';

import { RiHashtag } from '@remixicon/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';

type TrendingData = { hashtags: { tag: string; count: number }[]; total_unique: number; top_tag: string; top_count: number };

const FALLBACK: TrendingData = {
  hashtags: [
    { tag: '#Tesla', count: 412 }, { tag: '#EV', count: 318 }, { tag: '#AI', count: 274 },
    { tag: '#Tech', count: 201 }, { tag: '#SpaceX', count: 189 }, { tag: '#Climate', count: 143 },
  ],
  total_unique: 48, top_tag: '#Tesla', top_count: 412,
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-3 shadow-regular-md backdrop-blur-md">
        <p className="mb-1 text-label-xs font-bold text-white/50 uppercase tracking-wider">{payload[0].payload.tag}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-label-sm text-white/70">Mentions</span>
              <span className="text-label-sm font-bold" style={{ color: entry.fill }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WidgetTrendingTopics() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<TrendingData>('trending', keyword, FALLBACK);

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 2 · Trending Topics Detection</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{data.top_tag || '#—'} · Top</div>
            <Badge.Root variant='light' color='blue' size='medium'>{data.top_count} mentions</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <ResponsiveContainer width='100%' height={160}>
        <BarChart data={data.hashtags.slice(0, 6)} layout='vertical' margin={{ top: 0, right: 0, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' horizontal={false} />
          <XAxis type='number' hide />
          <YAxis type='category' dataKey='tag' tick={{ fontSize: 11, fill: 'hsl(var(--text-sub-600))' }} width={56} axisLine={false} tickLine={false} />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey='count' fill='hsl(var(--primary-base))' radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>

      <div className='flex items-center gap-1.5'>
        <RiHashtag className='size-4 text-text-soft-400' />
        <span className='text-paragraph-sm text-text-sub-600'>{data.total_unique} unique hashtags tracked</span>
      </div>
    </div>
  );
}
