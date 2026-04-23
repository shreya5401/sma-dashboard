'use client';

import { RiEmotionHappyLine, RiEmotionUnhappyLine, RiEmotionNormalLine } from '@remixicon/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';

type SentimentData = { total: number; positive: number; negative: number; neutral: number; dominant: string };

const FALLBACK: SentimentData = { total: 0, positive: 54, negative: 23, neutral: 23, dominant: 'positive' };

export function WidgetSentimentAnalysis() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<SentimentData>('sentiment', keyword, FALLBACK);

  const chartData = [
    { name: 'Positive', value: data.positive, color: '#22c55e' },
    { name: 'Negative', value: data.negative, color: '#ef4444' },
    { name: 'Neutral', value: data.neutral, color: '#94a3b8' },
  ];

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 1 · Sentiment Analysis</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>
              {data.total > 0 ? `${data.total.toLocaleString()} Posts` : 'Analyzing…'}
            </div>
            <Badge.Root variant='light' color='green' size='medium'>NLP</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <ResponsiveContainer width='100%' height={140}>
        <PieChart>
          <Pie data={chartData} cx='50%' cy='50%' innerRadius={42} outerRadius={64} paddingAngle={3} dataKey='value'>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>

      <div className='flex w-full flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <RiEmotionHappyLine className='size-5 shrink-0 text-success-base' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Positive</div>
          <div className='text-paragraph-sm tabular-nums text-text-sub-600'>{data.positive}%</div>
          <Badge.Root variant='light' color='green' size='small'>{data.dominant === 'positive' ? 'Dominant' : '—'}</Badge.Root>
        </div>
        <div className='flex items-center gap-2'>
          <RiEmotionUnhappyLine className='size-5 shrink-0 text-error-base' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Negative</div>
          <div className='text-paragraph-sm tabular-nums text-text-sub-600'>{data.negative}%</div>
          <Badge.Root variant='light' color='red' size='small'>{data.dominant === 'negative' ? 'Dominant' : '—'}</Badge.Root>
        </div>
        <div className='flex items-center gap-2'>
          <RiEmotionNormalLine className='size-5 shrink-0 text-text-soft-400' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Neutral</div>
          <div className='text-paragraph-sm tabular-nums text-text-sub-600'>{data.neutral}%</div>
          <Badge.Root variant='light' color='gray' size='small'>{data.dominant === 'neutral' ? 'Dominant' : '—'}</Badge.Root>
        </div>
      </div>
    </div>
  );
}
