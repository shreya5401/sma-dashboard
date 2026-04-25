'use client';

import { RiArrowUpLine, RiArrowDownLine, RiMegaphoneLine } from '@remixicon/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { WidgetDetailsModal } from '@/components/widget-details-modal';

type WeekRow = { name: string; ctr: number; conv: number; roi: number };
type AdData = { ctr: number; conversion_rate: number; roi: number; weekly: WeekRow[] };

const FALLBACK: AdData = {
  ctr: 5.2, conversion_rate: 2.9, roi: 318,
  weekly: [
    { name: 'Week 1', ctr: 3.2, conv: 1.8, roi: 210 },
    { name: 'Week 2', ctr: 4.1, conv: 2.3, roi: 265 },
    { name: 'Week 3', ctr: 3.8, conv: 2.0, roi: 240 },
    { name: 'Week 4', ctr: 5.2, conv: 2.9, roi: 318 },
  ],
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-3 shadow-regular-md backdrop-blur-md">
        <p className="mb-1 text-label-xs font-bold text-white/50 uppercase tracking-wider">{payload[0].payload.name}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-label-sm text-white/70">{entry.name.toUpperCase()}</span>
              <span className="text-label-sm font-bold" style={{ color: entry.fill }}>{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WidgetAdCampaign() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<AdData>('ad-campaign', keyword, FALLBACK);

  const kpis = [
    { label: 'CTR', value: `${data.ctr}%`, up: data.ctr > 3 },
    { label: 'Conversion', value: `${data.conversion_rate}%`, up: data.conversion_rate > 1 },
    { label: 'ROI', value: `${data.roi}%`, up: data.roi > 100 },
  ];

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 8 · Ad Campaign Optimization</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>ROI: {data.roi}%</div>
            <Badge.Root variant='light' color='green' size='medium'>Active</Badge.Root>
          </div>
        </div>
        <WidgetDetailsModal 
          title="Ad Campaign Optimization" 
          moduleNumber="Module 8" 
          description="Predictive modeling for ad spend efficiency. Analyzes CTR and conversion trends to maximize ROI through automated budget reallocation."
          data={{ ctr: data.ctr, conversion: data.conversion_rate, roi: data.roi }}
        />
      </div>

      <div className='grid grid-cols-3 gap-3'>
        {kpis.map((kpi, i) => (
          <div key={i} className='flex flex-col gap-1 rounded-xl bg-bg-weak-50 p-3'>
            <div className='text-subheading-xs uppercase text-text-soft-400'>{kpi.label}</div>
            <div className='text-label-md text-text-strong-950'>{kpi.value}</div>
            <div className={`flex items-center gap-0.5 text-paragraph-xs ${kpi.up ? 'text-success-base' : 'text-error-base'}`}>
              {kpi.up ? <RiArrowUpLine className='size-3.5' /> : <RiArrowDownLine className='size-3.5' />}
              {kpi.up ? 'Above avg' : 'Below avg'}
            </div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width='100%' height={100}>
        <BarChart data={data.weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' vertical={false} />
          <XAxis dataKey='name' hide />
          <YAxis hide />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey='ctr' fill='hsl(var(--primary-base))' radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey='conv' fill='#f59e0b' radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>

      <div className='flex items-center gap-1.5'>
        <RiMegaphoneLine className='size-4 text-text-soft-400' />
        <span className='text-paragraph-sm text-text-sub-600'>{data.weekly.length} weeks tracked</span>
      </div>
    </div>
  );
}
