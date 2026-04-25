'use client';

import { RiTeamLine } from '@remixicon/react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { WidgetDetailsModal } from '@/components/widget-details-modal';

type Cluster = { name: string; count: number; avg_followers: number; color: string };
type SegData = { clusters: Cluster[]; n_clusters: number };

const FALLBACK: SegData = {
  clusters: [
    { name: 'Power Users', count: 382, avg_followers: 12000, color: '#3b82f6' },
    { name: 'Casual Browsers', count: 519, avg_followers: 3200, color: '#f59e0b' },
    { name: 'Lurkers', count: 383, avg_followers: 890, color: '#94a3b8' },
  ],
  n_clusters: 3,
};

// Fixed scatter positions per cluster for visualization
const SCATTER_POS = [
  [{ x: 25, y: 80, z: 200 }, { x: 30, y: 75, z: 180 }, { x: 22, y: 85, z: 160 }],
  [{ x: 60, y: 45, z: 250 }, { x: 65, y: 40, z: 220 }, { x: 58, y: 50, z: 190 }],
  [{ x: 80, y: 20, z: 150 }, { x: 85, y: 25, z: 130 }, { x: 78, y: 18, z: 110 }],
];

export function WidgetUserSegmentation() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<SegData>('segmentation', keyword, FALLBACK);

  const clusters = data.clusters.length > 0 ? data.clusters : FALLBACK.clusters;

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 6 · User Segmentation</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{clusters.length} Clusters</div>
            <Badge.Root variant='light' color='purple' size='medium'>K-Means</Badge.Root>
          </div>
        </div>
        <WidgetDetailsModal 
          title="User Segmentation" 
          moduleNumber="Module 6" 
          description="K-means clustering of audience personas. Groups users based on behavioral metadata, engagement frequency, and follower demographics."
          data={{ clusters: data.n_clusters, total_users: clusters.reduce((a, b) => a + b.count, 0) }}
        />
      </div>

      <ResponsiveContainer width='100%' height={140}>
        <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' />
          <XAxis type='number' dataKey='x' hide />
          <YAxis type='number' dataKey='y' hide />
          <ZAxis type='number' dataKey='z' range={[40, 120]} />
          <Tooltip cursor={false} content={() => null} />
          {SCATTER_POS.map((group, i) => (
            <Scatter key={i} data={group} fill={clusters[i]?.color ?? '#94a3b8'} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className='flex flex-col gap-2'>
        {clusters.map((seg, i) => (
          <div key={i} className='flex items-center gap-2'>
            <div className='size-2.5 shrink-0 rounded-full' style={{ backgroundColor: seg.color }} />
            <div className='flex-1 text-label-sm text-text-sub-600'>{seg.name}</div>
            <div className='flex items-center gap-1'>
              <RiTeamLine className='size-4 text-text-soft-400' />
              <span className='text-paragraph-sm tabular-nums text-text-sub-600'>{seg.count} users</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
