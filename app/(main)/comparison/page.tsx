'use client';

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { 
  RiTwitterXLine, 
  RiFacebookBoxFill, 
  RiBarChartGroupedLine, 
  RiPieChartLine, 
  RiLineChartLine,
  RiDashboardLine,
  RiShuffleLine
} from '@remixicon/react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import Header from '@/components/header';

type PlatformStats = {
  platform: string;
  mentions: number;
  sentiment: { positive: number; negative: number; neutral: number };
  engagement_rate: number;
  top_hashtag: string;
};

type ComparisonData = {
  keyword: string;
  platforms: PlatformStats[];
  summary: { leading_platform: string; total_mentions: number; avg_engagement: number };
};

const FALLBACK: ComparisonData = {
  keyword: '',
  platforms: [
    { platform: 'Twitter', mentions: 0, sentiment: { positive: 0, negative: 0, neutral: 0 }, engagement_rate: 0, top_hashtag: '' },
    { platform: 'Facebook', mentions: 0, sentiment: { positive: 0, negative: 0, neutral: 0 }, engagement_rate: 0, top_hashtag: '' },
  ],
  summary: { leading_platform: 'N/A', total_mentions: 0, avg_engagement: 0 }
};

const PLATFORM_COLORS: Record<string, string> = {
  'Twitter': '#000000',
  'Facebook': '#1877F2',
};

export default function ComparisonPage() {
  const keyword = useAtomValue(keywordAtom);
  const { data, loading } = useModuleData<ComparisonData>('platform-comparison', keyword, FALLBACK);

  if (!keyword) {
    return (
      <div className="flex flex-col gap-6 p-6 lg:p-10">
        <Header 
          title="Platform Comparison" 
          description="Benchmarking Twitter vs Facebook"
          icon={<RiShuffleLine className="size-6 text-primary-base" />}
        />
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-stroke-soft-200 bg-bg-white-50 text-center">
          <RiDashboardLine className="size-12 text-text-soft-400 mb-4" />
          <h3 className="text-label-md font-bold text-text-strong-950">No Keyword Selected</h3>
          <p className="text-paragraph-sm text-text-sub-600 mt-2 max-w-sm">
            Please search for a keyword on the Overview page to enable cross-platform comparison.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      {loading && <LoadingOverlay />}
      <Header 
        title="Platform Comparison" 
        description={`Analyzing "${keyword}" performance across social ecosystems`}
        icon={<RiShuffleLine className="size-6 text-primary-base" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200">
            <p className="text-label-xs font-bold text-text-soft-400 uppercase tracking-widest mb-1">Leading by Engagement</p>
            <div className="flex items-center gap-3">
              {data.summary.leading_platform === 'Twitter' ? <RiTwitterXLine className="size-6" /> : <RiFacebookBoxFill className="size-6 text-[#1877F2]" />}
              <h3 className="text-title-h4 font-black text-text-strong-950">{data.summary.leading_platform}</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200">
            <p className="text-label-xs font-bold text-text-soft-400 uppercase tracking-widest mb-1">Total Reach</p>
            <h3 className="text-title-h3 font-black text-text-strong-950">{data.summary.total_mentions.toLocaleString()}</h3>
            <p className="text-paragraph-xs text-text-sub-600 mt-1">Consolidated Mentions</p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200">
            <p className="text-label-xs font-bold text-text-soft-400 uppercase tracking-widest mb-1">Average Engagement</p>
            <h3 className="text-title-h3 font-black text-primary-base">{data.summary.avg_engagement}%</h3>
            <p className="text-paragraph-xs text-text-sub-600 mt-1">Cross-platform Interaction Rate</p>
          </div>
        </div>

        {/* Volume Comparison Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-label-md font-bold text-text-strong-950 flex items-center gap-2">
              <RiBarChartGroupedLine className="size-5 text-primary-base" />
              Volume Distribution
            </h3>
            <Badge.Root variant="light" color="gray" size="medium">Real-time Comparison</Badge.Root>
          </div>
          <div className="h-[350px] w-full mt-4">
            {data.platforms.some(p => p.mentions > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.platforms} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-stroke-soft-200" />
                  <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload as PlatformStats;
                        return (
                          <div className="bg-white p-4 shadow-regular-md rounded-xl border border-stroke-soft-200">
                            <p className="text-label-xs font-bold text-text-soft-400 uppercase mb-2">{d.platform}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-8"><span className="text-sm text-text-sub-600">Mentions</span><span className="text-sm font-bold">{d.mentions.toLocaleString()}</span></div>
                              <div className="flex justify-between gap-8"><span className="text-sm text-text-sub-600">Engagement</span><span className="text-sm font-bold text-primary-base">{d.engagement_rate}%</span></div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="mentions" 
                    radius={[8, 8, 0, 0]} 
                    barSize={60}
                    minPointSize={10}
                    fill="#8884d8"
                  >
                    {data.platforms.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PLATFORM_COLORS[entry.platform] || '#8884d8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-soft-400 bg-bg-weak-50 rounded-xl border-2 border-dashed border-stroke-soft-200">
                <RiBarChartGroupedLine className="size-8 mb-2 opacity-50" />
                <p className="text-paragraph-sm font-medium">Waiting for mention data...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.platforms.map((p, i) => (
          <div key={i} className="p-8 rounded-2xl bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-bg-weak-50 flex items-center justify-center">
                  {p.platform === 'Twitter' ? <RiTwitterXLine className="size-5" /> : <RiFacebookBoxFill className="size-5 text-[#1877F2]" />}
                </div>
                <div>
                  <h4 className="text-label-md font-black text-text-strong-950">{p.platform}</h4>
                  <p className="text-paragraph-xs text-text-soft-400">{p.top_hashtag}</p>
                </div>
              </div>
              <Badge.Root variant="filled" color={p.mentions > 3000 ? 'green' : 'blue'} size="medium">
                {p.mentions > 3000 ? 'High Volume' : 'Steady'}
              </Badge.Root>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-label-xs font-bold text-text-soft-400 uppercase flex items-center gap-2">
                  <RiPieChartLine className="size-4 text-primary-base" />
                  Sentiment Breakdown
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Positive', val: p.sentiment.positive, color: 'text-success-base' },
                    { label: 'Negative', val: p.sentiment.negative, color: 'text-error-base' },
                    { label: 'Neutral', val: p.sentiment.neutral, color: 'text-text-soft-400' },
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-paragraph-xs text-text-sub-600">{s.label}</span>
                      <div className="flex items-center gap-3 flex-1 px-4">
                        <div className="h-1.5 flex-1 bg-bg-weak-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.label === 'Positive' ? 'bg-success-base' : s.label === 'Negative' ? 'bg-error-base' : 'bg-gray-300'}`} style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                      <span className={`text-label-xs font-bold ${s.color}`}>{s.val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-label-xs font-bold text-text-soft-400 uppercase flex items-center gap-2">
                  <RiLineChartLine className="size-4 text-primary-base" />
                  Engagement KPI
                </p>
                <div className="p-6 bg-bg-weak-50 rounded-2xl flex flex-col items-center justify-center border border-stroke-soft-200">
                  <p className="text-title-h2 font-black text-text-strong-950">{p.engagement_rate}%</p>
                  <p className="text-[10px] font-bold text-text-sub-600 uppercase tracking-widest mt-1">Interaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
