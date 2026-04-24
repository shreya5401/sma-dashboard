'use client';

import * as React from 'react';
import { RiDashboard3Line, RiSearchLine } from '@remixicon/react';
import { useAtom, useSetAtom } from 'jotai';

import * as Button from '@/components/ui/button';
import * as Select from '@/components/ui/select';
import Header from '@/components/header';

import { keywordAtom, platformAtom, chatbotOpenAtom } from '@/lib/atoms';
import { WidgetSentimentAnalysis } from '@/components/widgets/widget-sentiment-analysis';
import { WidgetTrendingTopics } from '@/components/widgets/widget-trending-topics';
import { WidgetNetworkAnalysis } from '@/components/widgets/widget-network-analysis';
import { WidgetRecommendationSystem } from '@/components/widgets/widget-recommendation-system';
import { WidgetFakeNewsDetection } from '@/components/widgets/widget-fake-news-detection';
import { WidgetUserSegmentation } from '@/components/widgets/widget-user-segmentation';
import { WidgetDataVisualization } from '@/components/widgets/widget-data-visualization';
import { WidgetAdCampaign } from '@/components/widgets/widget-ad-campaign';
import { WidgetInfluencerDetection } from '@/components/widgets/widget-influencer-detection';
import { WidgetRealtimeMonitoring } from '@/components/widgets/widget-realtime-monitoring';
import { WidgetCompetitorAnalysis } from '@/components/widgets/widget-competitor-analysis';
import { WidgetPopularityPrediction } from '@/components/widgets/widget-popularity-prediction';

export default function PageHome() {
  const [keyword, setKeyword] = useAtom(keywordAtom);
  const [platform, setPlatform] = useAtom(platformAtom);
  const [inputValue, setInputValue] = React.useState(keyword);
  const setChatbotOpen = useSetAtom(chatbotOpenAtom);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) setKeyword(inputValue.trim());
  }

  return (
    <>
      <Header
        icon={
          <div className='flex size-12 items-center justify-center rounded-full bg-primary-alpha-10'>
            <RiDashboard3Line className='size-6 text-primary-base' />
          </div>
        }
        title='Social Media Analytics'
        description='AI-Powered Analytics Dashboard'
      >
      </Header>

      {/* Case Search Bar */}
      <div className='px-4 pb-4 lg:px-8'>
        <form onSubmit={handleSearch} className='flex items-center gap-3'>
          <div className='relative flex-1 max-w-md'>
            <RiSearchLine className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-soft-400' />
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setChatbotOpen(false)}
              placeholder='Search keyword, hashtag, or brand…'
              className='w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-2.5 pl-9 pr-4 text-label-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base'
            />
          </div>
          <Select.Root
            value={platform}
            onValueChange={(v) => setPlatform(v as 'x' | 'facebook')}
          >
            <Select.Trigger className='w-auto'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='x'>X (Twitter)</Select.Item>
              <Select.Item value='facebook'>Facebook</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button.Root type='submit' variant='primary' mode='filled' size='medium'>
            Analyze
          </Button.Root>
        </form>
        <p className='mt-2 text-paragraph-xs text-text-soft-400'>
          Analyzing: <span className='font-medium text-text-sub-600'>&ldquo;{keyword}&rdquo;</span> on <span className='font-medium text-text-sub-600'>{platform === 'x' ? 'X (Twitter)' : 'Facebook'}</span>
        </p>
      </div>

      <div className='flex flex-col gap-6 overflow-hidden px-4 pb-6 lg:px-8 lg:pt-1'>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(344px,1fr))] items-start justify-center gap-6'>
          <WidgetSentimentAnalysis />
          <WidgetTrendingTopics />
          <WidgetNetworkAnalysis />
          <WidgetRecommendationSystem />
          <WidgetFakeNewsDetection />
          <WidgetUserSegmentation />
          <div className='col-span-full'>
            <WidgetDataVisualization />
          </div>
          <WidgetAdCampaign />
          <WidgetInfluencerDetection />
          <WidgetRealtimeMonitoring />
          <div className='col-span-full'>
            <WidgetCompetitorAnalysis />
          </div>
          <WidgetPopularityPrediction />
        </div>
      </div>
    </>
  );
}
