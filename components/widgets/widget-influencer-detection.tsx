'use client';

import { RiUserStarLine, RiArrowUpLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';

type Influencer = { rank: number; name: string; followers: string; score: number; delta: string };
type InfluencerData = { influencers: Influencer[] };

const FALLBACK: InfluencerData = {
  influencers: [
    { rank: 1, name: '@elonmusk_fan', followers: '2.4M', score: 0.98, delta: '+0.03' },
    { rank: 2, name: '@teslaowner', followers: '840K', score: 0.87, delta: '+0.01' },
    { rank: 3, name: '@evtech_daily', followers: '620K', score: 0.81, delta: '+0.05' },
    { rank: 4, name: '@cleanenergy_x', followers: '415K', score: 0.74, delta: '-0.02' },
    { rank: 5, name: '@spaceexplorer', followers: '390K', score: 0.69, delta: '+0.04' },
  ],
};

const BG_COLORS = ['bg-sky-200 text-sky-950', 'bg-purple-200 text-purple-950', 'bg-blue-200 text-blue-950', 'bg-red-200 text-red-950', 'bg-yellow-200 text-yellow-950'];

export function WidgetInfluencerDetection() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<InfluencerData>('influencer', keyword, FALLBACK);

  const list = data.influencers.length > 0 ? data.influencers : FALLBACK.influencers;
  const top = list[0];

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 9 · Influencer Detection</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{top?.name ?? '—'}</div>
            <Badge.Root variant='light' color='yellow' size='medium'>Score {top?.score ?? '—'}</Badge.Root>
          </div>
        </div>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </div>

      <div className='flex flex-col gap-2'>
        {list.slice(0, 5).map((inf, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div className='w-5 shrink-0 text-center text-subheading-xs text-text-soft-400'>{inf.rank}</div>
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-label-sm ${BG_COLORS[i % BG_COLORS.length]}`}>
              {inf.name.replace('@', '').slice(0, 2).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='truncate text-label-sm text-text-strong-950'>{inf.name}</div>
              <div className='text-paragraph-xs text-text-soft-400'>{inf.followers} followers</div>
            </div>
            <div className='flex items-center gap-1'>
              <RiUserStarLine className='size-4 text-warning-base' />
              <span className='text-label-sm text-text-sub-600'>{inf.score}</span>
              <span className={`text-paragraph-xs ${inf.delta.startsWith('+') ? 'text-success-base' : 'text-error-base'}`}>{inf.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='flex items-center gap-1.5'>
        <RiArrowUpLine className='size-4 text-text-soft-400' />
        <span className='text-paragraph-sm text-text-sub-600'>Ranked by Eigenvector Centrality</span>
      </div>
    </div>
  );
}
