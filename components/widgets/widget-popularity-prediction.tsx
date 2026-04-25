'use client';

import { RiRobot2Line } from '@remixicon/react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { WidgetDetailsModal } from '@/components/widget-details-modal';

type DataPoint = { day: string; actual: number | null; predicted: number | null };
type PredData = { historical: DataPoint[]; predicted: DataPoint[]; confidence: number; model: string; r_squared: number };

const FALLBACK: PredData = {
  historical: [
    { day: 'D-6', actual: 340, predicted: null }, { day: 'D-5', actual: 410, predicted: null },
    { day: 'D-4', actual: 380, predicted: null }, { day: 'D-3', actual: 520, predicted: null },
    { day: 'D-2', actual: 490, predicted: null }, { day: 'D-1', actual: 560, predicted: 560 },
  ],
  predicted: [{ day: 'D+1', actual: null, predicted: 610 }, { day: 'D+2', actual: null, predicted: 680 }, { day: 'D+3', actual: null, predicted: 720 }],
  confidence: 87, model: 'RandomForest', r_squared: 0.87,
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/60 p-3 shadow-regular-md backdrop-blur-md">
        <p className="mb-1 text-label-xs font-bold text-white/50 uppercase tracking-wider">{payload[0].payload.day}</p>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-label-sm text-white/70">{entry.name === 'actual' ? 'Actual' : 'Predicted'}</span>
              <span className="text-label-sm font-bold" style={{ color: entry.stroke }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function WidgetPopularityPrediction() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<PredData>('prediction', keyword, FALLBACK);

  const allPoints = [...(data.historical ?? []), ...(data.predicted ?? [])];
  const lastHistorical = data.historical?.at(-1)?.day ?? 'D-1';
  const maxPredicted = data.predicted?.at(-1)?.predicted ?? 0;

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 12 · Popularity Prediction</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>+{maxPredicted} Predicted</div>
            <Badge.Root variant='light' color='purple' size='medium'>ML Model</Badge.Root>
          </div>
        </div>
        <WidgetDetailsModal 
          title="Popularity Prediction" 
          moduleNumber="Module 12" 
          description="Machine learning forecasting for content reach. Uses historical momentum and seasonal markers to predict future engagement peaks."
          data={{ model: data.model, confidence: data.confidence, r_squared: data.r_squared }}
        />
      </div>

      <ResponsiveContainer width='100%' height={140}>
        <LineChart data={allPoints} margin={{ top: 6, right: 4, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' vertical={false} />
          <XAxis dataKey='day' hide />
          <YAxis hide />
          <Tooltip 
            content={<CustomTooltip />} 
            wrapperStyle={{ outline: 'none' }}
          />
          <ReferenceLine x={lastHistorical} stroke='hsl(var(--stroke-soft-200))' strokeDasharray='4 4' />
          <Line dataKey='actual' stroke='hsl(var(--primary-base))' strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary-base))' }} connectNulls={false} />
          <Line dataKey='predicted' stroke='#f59e0b' strokeWidth={2} strokeDasharray='6 3' dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#f59e0b' }} connectNulls />
        </LineChart>
      </ResponsiveContainer>

      <div className='flex items-center gap-3 rounded-xl bg-bg-weak-50 px-3 py-2'>
        <RiRobot2Line className='size-5 shrink-0 text-primary-base' />
        <div className='flex-1'>
          <div className='text-label-sm text-text-strong-950'>Model Confidence</div>
          <div className='text-paragraph-xs text-text-soft-400'>{data.model} · R² = {data.r_squared}</div>
        </div>
        <Badge.Root variant='light' color='green' size='small'>{data.confidence}%</Badge.Root>
      </div>
    </div>
  );
}
