'use client';

import { RiThumbUpLine, RiLightbulbLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';

type Rec = { title: string; score: number; type: string; author?: string };
type RecData = { recommendations: Rec[]; method: string };

const FALLBACK: RecData = {
  recommendations: [
    { title: 'Tesla Model 3 Review Thread', score: 94, type: 'Collaborative' },
    { title: 'EV Charging Infrastructure Debate', score: 88, type: 'Content-Based' },
    { title: 'SpaceX Starlink Updates', score: 81, type: 'Collaborative' },
    { title: 'AI in Autonomous Vehicles', score: 76, type: 'Content-Based' },
  ],
  method: 'TF-IDF Cosine Similarity',
};

export function WidgetRecommendationSystem() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<RecData>('recommendation', keyword, FALLBACK);

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 4 · Recommendation System</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{data.recommendations.length} Suggestions</div>
            <Badge.Root variant='light' color='blue' size='medium'>Filtering</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <div className='flex flex-col gap-3'>
        {data.recommendations.map((rec, i) => (
          <div key={i} className='flex items-center gap-3 rounded-xl bg-bg-weak-50 px-3 py-2.5'>
            <RiLightbulbLine className='size-5 shrink-0 text-text-soft-400' />
            <div className='flex-1 min-w-0'>
              <div className='truncate text-label-sm text-text-strong-950'>{rec.title}</div>
              <div className='text-paragraph-xs text-text-soft-400'>{rec.type}</div>
            </div>
            <div className='flex items-center gap-1.5'>
              <RiThumbUpLine className='size-4 text-text-soft-400' />
              <span className='text-label-sm text-text-sub-600'>{rec.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
