'use client';

import { RiNodeTree, RiGroupLine, RiUserStarLine } from '@remixicon/react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { useAtomValue } from 'jotai';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import { WidgetDetailsModal } from '@/components/widget-details-modal';

type NetworkData = { total_nodes: number; total_edges: number; communities: number; influencers: number; connectors: number };

const FALLBACK: NetworkData = { total_nodes: 0, total_edges: 0, communities: 3, influencers: 12, connectors: 47 };

// Fixed scatter positions for visual representation
const SCATTER_DATA = [
  [{ x: 20, y: 70, z: 300 }, { x: 30, y: 75, z: 280 }, { x: 22, y: 85, z: 160 }],
  [{ x: 55, y: 40, z: 250 }, { x: 65, y: 40, z: 220 }, { x: 58, y: 50, z: 190 }],
  [{ x: 80, y: 75, z: 200 }, { x: 85, y: 25, z: 130 }, { x: 60, y: 80, z: 400 }],
];

export function WidgetNetworkAnalysis() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<NetworkData>('network', keyword, FALLBACK);

  return (
    <div className='relative flex w-full flex-col gap-5 rounded-2xl bg-bg-white-0 p-5 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200'>
      {loading && <LoadingOverlay />}
      <div className='flex items-start gap-2'>
        <div className='flex-1'>
          <div className='text-label-sm text-text-sub-600'>Module 3 · Network Analysis</div>
          <div className='mt-1 flex items-center gap-2'>
            <div className='text-title-h5 text-text-strong-950'>{data.total_nodes.toLocaleString()} Nodes</div>
            <Badge.Root variant='light' color='purple' size='medium'>NetworkX</Badge.Root>
          </div>
        </div>
        <WidgetDetailsModal 
          title="Network Analysis" 
          moduleNumber="Module 3" 
          description="Graph-based visualization of community structures. Detects information hubs, bridging nodes, and isolated clusters within the social graph."
          data={{ nodes: data.total_nodes, edges: data.total_edges, communities: data.communities }}
        />
      </div>

      <ResponsiveContainer width='100%' height={140}>
        <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray='4 4' className='stroke-stroke-soft-200' />
          <XAxis type='number' dataKey='x' hide />
          <YAxis type='number' dataKey='y' hide />
          <ZAxis type='number' dataKey='z' range={[60, 200]} />
          <Tooltip cursor={false} content={() => null} />
          {SCATTER_DATA.map((group, i) => (
            <Scatter key={i} data={group} fill={['hsl(var(--primary-base))', '#f59e0b', '#22c55e'][i]} fillOpacity={0.6} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className='flex w-full flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <RiGroupLine className='size-5 shrink-0 text-primary-base' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Communities</div>
          <div className='text-paragraph-sm tabular-nums text-text-strong-950'>{data.communities} detected</div>
        </div>
        <div className='flex items-center gap-2'>
          <RiUserStarLine className='size-5 shrink-0 text-warning-base' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Influencers</div>
          <div className='text-paragraph-sm tabular-nums text-text-strong-950'>{data.influencers} ranked</div>
        </div>
        <div className='flex items-center gap-2'>
          <RiNodeTree className='size-5 shrink-0 text-text-soft-400' />
          <div className='flex-1 text-label-sm text-text-sub-600'>Connectors</div>
          <div className='text-paragraph-sm tabular-nums text-text-strong-950'>{data.connectors} bridging</div>
        </div>
      </div>
    </div>
  );
}
