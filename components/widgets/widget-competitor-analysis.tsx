'use client';

import { RiBarChartLine } from '@remixicon/react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';

type MetricRow = { metric: string; brand?: number; compA?: number; compB?: number };
type CompData = { brands: string[]; metrics: MetricRow[]; summary: string };

const FALLBACK: CompData = {
  brands: ['Tesla', 'Ford', 'BMW'],
  metrics: [
    { metric: 'Growth', brand: 34, compA: 28, compB: 19 },
    { metric: 'Engagement', brand: 62, compA: 48, compB: 55 },
    { metric: 'Reach', brand: 78, compA: 82, compB: 61 },
    { metric: 'Sentiment', brand: 71, compA: 59, compB: 66 },
  ],
  summary: 'Your brand leads in Growth & Sentiment',
};

export function WidgetCompetitorAnalysis() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<CompData>('competitor', keyword, FALLBACK, { competitors: 'Ford,BMW' });

  const [b0, b1, b2] = data.brands.length > 0 ? data.brands : FALLBACK.brands;

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 11 · Competitor Analysis</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{data.brands.length || 3} Brands Compared</div>
            <Badge.Root variant='light' color='blue' size='medium'>Strategy</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <ResponsiveContainer width='100%' height={180}>
        <BarChart data={data.metrics} margin={{ top: 4, right: 4, left: -16, bottom: 4 }} barCategoryGap='30%'>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' vertical={false} />
          <XAxis dataKey='metric' tick={{ fontSize: 11, fill: 'hsl(var(--text-soft-400))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--text-soft-400))' }} axisLine={false} tickLine={false} unit='%' />
          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(v: number, n: string) => [`${v}%`, n === 'brand' ? b0 : n === 'compA' ? b1 : b2]} />
          <Legend formatter={(v) => v === 'brand' ? b0 : v === 'compA' ? b1 : b2} wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey='brand' fill='hsl(var(--primary-base))' radius={[4, 4, 0, 0]} />
          <Bar dataKey='compA' fill='#f59e0b' radius={[4, 4, 0, 0]} />
          <Bar dataKey='compB' fill='#94a3b8' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className='flex items-center gap-1.5'>
        <RiBarChartLine className='size-4 text-text-soft-400' />
        <span className='text-paragraph-sm text-text-sub-600'>{data.summary}</span>
      </div>
    </div>
  );
}
