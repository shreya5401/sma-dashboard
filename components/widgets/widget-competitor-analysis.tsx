'use client';

import * as React from 'react';
import { RiBarChartLine } from '@remixicon/react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { WidgetDetailsModal } from '@/components/widget-details-modal';

type MetricRow = { metric: string; brand?: number; compA?: number; compB?: number };
type CompData = { brands: string[]; metrics: MetricRow[]; summary: string };

const FALLBACK: CompData = {
  brands: ['Tesla', 'Ford', 'BMW'],
  metrics: [
    { metric: 'Growth', brand: 34, compA: 28, compB: 19 },
    { metric: 'Engagement', brand: 62, compA: 48, compB: 55 },
    { metric: 'Strategy', brand: 75, compA: 60, compB: 65 },
  ],
  summary: 'Your brand leads in Strategy & Growth',
};

export function WidgetCompetitorAnalysis() {
  const keyword = useAtomValue(keywordAtom);
  
  const { data, loading } = useModuleData<CompData>('competitor', keyword, FALLBACK, { competitors: 'auto' });

  const brands = data.brands.length > 0 ? data.brands : FALLBACK.brands;
  const [b0, b1, b2] = brands;



  return (
    <div className='relative flex w-full flex-col gap-6 rounded-2xl bg-bg-white-0 p-6 shadow-regular-sm ring-1 ring-inset ring-stroke-soft-200 transition-all hover:shadow-regular-md'>
      {loading && <LoadingOverlay />}
      
      <div className='flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='text-label-sm font-medium uppercase tracking-wider text-text-sub-600'>Module 11 · Competitor Analysis</span>
            <div className='size-1.5 rounded-full bg-success-base animate-pulse' />
          </div>
          <div className='flex items-center gap-2'>
            <h3 className='text-title-h5 font-bold text-text-strong-950'>{brands.length} Brands Compared</h3>
            <Badge.Root variant='light' color='blue' size='small' className='font-semibold'>Benchmark</Badge.Root>
          </div>
        </div>
        <WidgetDetailsModal 
          title="Competitor Discovery" 
          moduleNumber="Module 11" 
          description="Cross-platform competitive benchmarking. Tracks market share, engagement delta, and strategy variance against industry leaders."
          data={{ brands: brands.join(', '), summary: data.summary }}
        />
      </div>

      <div className='h-[200px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data.metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8} barCategoryGap='25%'>
            <defs>
              <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary-base))" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="hsl(var(--primary-base))" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorCompA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="colorCompB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' className='stroke-stroke-soft-200' vertical={false} />
            <XAxis 
              dataKey='metric' 
              tick={{ fontSize: 12, fontWeight: 500, fill: 'hsl(var(--text-soft-400))' }} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--text-soft-400))' }} 
              axisLine={false} 
              tickLine={false} 
              unit='%' 
              domain={[0, 100]}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xl backdrop-blur-md">
                      <p className="text-label-sm font-bold text-text-strong-950">{label}</p>
                      <div className="flex flex-col gap-1.5">
                        {payload.map((p, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                              <span className="text-[11px] text-text-sub-600">
                                {p.name === 'brand' ? b0 : p.name === 'compA' ? b1 : b2}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-text-strong-950">{p.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className='text-[11px] font-medium text-text-sub-600'>{v === 'brand' ? b0 : v === 'compA' ? b1 : b2}</span>} 
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px' }}
            />
            <Bar dataKey='brand' name="brand" fill='url(#colorBrand)' radius={[6, 6, 0, 0]} animationDuration={1500} />
            <Bar dataKey='compA' name="compA" fill='url(#colorCompA)' radius={[6, 6, 0, 0]} animationDuration={1500} />
            <Bar dataKey='compB' name="compB" fill='url(#colorCompB)' radius={[6, 6, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className='flex items-center gap-2 rounded-xl bg-bg-soft-200 p-3'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-bg-white-0 shadow-sm'>
          <RiBarChartLine className='size-4 text-primary-base' />
        </div>
        <div className='flex flex-col'>
          <span className='text-paragraph-xs font-medium text-text-sub-600'>AI Insight</span>
          <span className='text-paragraph-sm font-semibold text-text-strong-950'>{data.summary}</span>
        </div>
      </div>
    </div>
  );
}
