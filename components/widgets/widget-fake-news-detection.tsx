'use client';

import { RiShieldCheckLine, RiAlertLine } from '@remixicon/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';

type FakeNewsData = { total: number; real: number; fake: number; real_count?: number; fake_count?: number; accuracy: number };

const FALLBACK: FakeNewsData = { total: 0, real: 73, fake: 27, accuracy: 95.2 };

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-3 shadow-regular-md backdrop-blur-md">
        <p className="mb-1 text-label-xs font-bold text-white/50 uppercase tracking-wider">{entry.name} News</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-label-sm text-white/70">Share</span>
          <span className="text-label-sm font-bold" style={{ color: entry.payload.color }}>{entry.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export function WidgetFakeNewsDetection() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<FakeNewsData>('fake-news', keyword, FALLBACK);

  const chartData = [
    { name: 'Real', value: data.real, color: '#22c55e' },
    { name: 'Fake', value: data.fake, color: '#ef4444' },
  ];

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 5 · Fake News Detection</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{data.accuracy}% Accuracy</div>
            <Badge.Root variant='light' color='green' size='medium'>Classifier</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <ResponsiveContainer width='100%' height={130}>
        <PieChart>
          <Pie data={chartData} cx='50%' cy='50%' innerRadius={38} outerRadius={58} paddingAngle={4} dataKey='value' stroke='none'>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />} 
            wrapperStyle={{ outline: 'none' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className='flex w-full flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <RiShieldCheckLine className='size-5 shrink-0 text-success-base' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Real Posts</div>
          <div className='text-paragraph-sm tabular-nums text-text-sub-600'>{data.real}%</div>
          <Badge.Root variant='light' color='green' size='small'>{data.real_count ?? '—'} posts</Badge.Root>
        </div>
        <div className='flex items-center gap-2'>
          <RiAlertLine className='size-5 shrink-0 text-error-base' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Fake Posts</div>
          <div className='text-paragraph-sm tabular-nums text-text-sub-600'>{data.fake}%</div>
          <Badge.Root variant='light' color='red' size='small'>{data.fake_count ?? '—'} posts</Badge.Root>
        </div>
      </div>
    </div>
  );
}
