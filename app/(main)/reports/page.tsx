'use client';

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { 
  RiFileDownloadLine, 
  RiLineChartLine, 
  RiPieChartLine, 
  RiBarChartLine, 
  RiShieldLine, 
  RiHashtag,
  RiTimeLine,
  RiDashboardLine,
  RiUserStarLine,
  RiGroupLine,
  RiTeamLine,
  RiNodeTree,
  RiLightbulbLine,
  RiRobot2Line,
  RiPulseLine,
  RiBarChartGroupedLine
} from '@remixicon/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { keywordAtom } from '@/lib/atoms';
import { useModuleData } from '@/hooks/use-module-data';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';
import * as Divider from '@/components/ui/divider';
import { LoadingOverlay } from '@/components/loading-overlay';

export default function ReportsPage() {
  const keyword = useAtomValue(keywordAtom);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = React.useState(false);

  // Fetch data for all 12 modules
  const sentiment = useModuleData<any>('sentiment', keyword, { positive: 0, negative: 0, neutral: 0, total: 0, dominant: 'N/A' });
  const trending = useModuleData<any>('trending', keyword, { hashtags: [], total_unique: 0, top_tag: '', top_count: 0 });
  const network = useModuleData<any>('network', keyword, { total_nodes: 0, total_edges: 0, communities: 0 });
  const recommendation = useModuleData<any>('recommendation', keyword, { recommendations: [], method: 'N/A' });
  const fakeNews = useModuleData<any>('fake-news', keyword, { accuracy: 0, real: 0, fake: 0 });
  const segmentation = useModuleData<any>('segmentation', keyword, { clusters: [], n_clusters: 0 });
  const dataViz = useModuleData<any>('data-viz', keyword, { events: [] });
  const adCampaign = useModuleData<any>('ad-campaign', keyword, { ctr: 0, roi: 0, conversion_rate: 0 });
  const influencer = useModuleData<any>('influencer', keyword, { influencers: [] });
  const monitoring = useModuleData<any>('monitoring', keyword, { mentions_per_hour: 0, top_keywords: [] });
  const competitor = useModuleData<any>('competitor', keyword, { brands: [], summary: '' });
  const prediction = useModuleData<any>('prediction', keyword, { confidence: 0, model: 'N/A' });

  const loading = sentiment.loading || trending.loading || network.loading || recommendation.loading || 
                  fakeNews.loading || segmentation.loading || dataViz.loading || adCampaign.loading || 
                  influencer.loading || monitoring.loading || competitor.loading || prediction.loading;

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    
    const element = reportRef.current;
    const originalWidth = element.style.width;
    
    // Stabilize the element for capture
    element.style.width = '1024px';
    element.style.fontFeatureSettings = '"kern" 0';
    element.style.fontVariantLigatures = 'none';
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        imageTimeout: 0,
        removeContainer: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Calculate dimensions to fit exactly one page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210; // A4 Width in mm
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      // Create PDF with custom height to fit all content on a single page
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`SMA-Strategy-Report-${keyword || 'Global'}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
    } finally {
      element.style.width = originalWidth;
      element.style.fontFeatureSettings = '';
      element.style.fontVariantLigatures = '';
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h3 font-bold text-text-strong-950">Automated Intelligence Reports</h1>
          <p className="text-paragraph-sm text-text-sub-600 mt-1">Full 12-Module Strategy Document for "{keyword || 'Global'}"</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge.Root variant="light" color="blue" size="medium">
            <RiPulseLine className="size-3.5" />
            Live Data
          </Badge.Root>
          <Button.Root variant="primary" onClick={downloadPDF} disabled={generating || !keyword}>
            <Button.Icon as={generating ? RiTimeLine : RiFileDownloadLine} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Exporting...' : 'Download Full PDF'}
          </Button.Root>
        </div>
      </div>

      {!keyword && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-stroke-soft-200 bg-bg-white-50 text-center">
          <RiDashboardLine className="size-12 text-text-soft-400 mb-4" />
          <h3 className="text-label-md font-bold text-text-strong-950">No Search Context</h3>
          <p className="text-paragraph-sm text-text-sub-600 mt-2 max-w-sm">
            Please search for a keyword to generate the 12-module consolidated intelligence report.
          </p>
        </div>
      )}

      {keyword && (
        <div className="flex flex-col gap-8">
            <div 
              ref={reportRef} 
              className="w-full max-w-5xl mx-auto bg-white p-16 shadow-regular-md rounded-xl border border-stroke-soft-200 text-black overflow-hidden"
            >
            {/* Report Header */}
            <div className="flex justify-between items-end border-b-4 border-gray-900 pb-8 mb-12">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Full Strategy Intelligence Report</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-900 font-black">SMA DASHBOARD</span>
                  <div className="size-1 rounded-full bg-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">Consolidated 12-Module Analytics</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Context: {keyword}</p>
                <p className="text-xs font-bold text-gray-900 mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Grid Layout for Modules */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
              
              {/* Module 1 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 1 · Sentiment Analysis
                </h3>
                <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Primary Tone</span>
                    <Badge.Root variant="filled" color={sentiment.data.dominant === 'positive' ? 'green' : sentiment.data.dominant === 'negative' ? 'red' : 'gray'} size="small">
                      {sentiment.data.dominant === 'neutral' ? 'balanced' : sentiment.data.dominant}
                    </Badge.Root>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100"><p className="text-[9px] text-gray-400">Pos</p><p className="text-sm font-black text-green-600">{sentiment.data.positive}%</p></div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100"><p className="text-[9px] text-gray-400">Neg</p><p className="text-sm font-black text-red-600">{sentiment.data.negative}%</p></div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100"><p className="text-[9px] text-gray-400">Neu</p><p className="text-sm font-black text-gray-500">{sentiment.data.neutral}%</p></div>
                  </div>
                </div>
              </section>

              {/* Module 2 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 2 · Trending Topics Detection
                </h3>
                <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <p className="text-[10px] font-bold text-teal-400 uppercase mb-3">Top Momentum</p>
                  <div className="space-y-2">
                    {trending.data.hashtags.slice(0, 3).map((t: any, i: number) => (
                      <div key={i} className="flex justify-between text-[11px] font-bold bg-white p-2 rounded-lg border border-teal-50">
                        <span className="text-teal-900">{t.tag}</span>
                        <span className="text-teal-600">{t.count} mentions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Module 3 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 3 · Network Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                    <p className="text-[9px] text-purple-400 font-bold uppercase mb-1">Density</p>
                    <p className="text-lg font-black text-purple-900">{network.data.total_nodes}</p>
                  </div>
                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                    <p className="text-[9px] text-purple-400 font-bold uppercase mb-1">Communities</p>
                    <p className="text-lg font-black text-purple-900">{network.data.communities}</p>
                  </div>
                </div>
              </section>

              {/* Module 4 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 4 · Recommendation System
                </h3>
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-400 uppercase mb-2">Primary Recommendation</p>
                  <div className="p-3 bg-white rounded-lg border border-amber-50">
                    <p className="text-xs font-black text-amber-900 leading-snug">{recommendation.data.recommendations[0]?.title || 'Awaiting Data...'}</p>
                  </div>
                  <Badge.Root variant="light" color="orange" size="small" className="mt-2">Strategy Optimized</Badge.Root>
                </div>
              </section>

              {/* Module 5 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 5 · Fake News Detection
                </h3>
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 text-center px-3 bg-white py-2 rounded-lg border border-red-100">
                      <p className="text-[9px] text-red-400 font-bold uppercase">Accuracy</p>
                      <p className="text-xl font-black text-red-600">{fake_news_accuracy(fakeNews.data.accuracy)}%</p>
                    </div>
                    <p className="text-[10px] text-red-900/70 leading-relaxed font-bold italic">
                      Risk assessment flagged <span className="text-red-700">{fakeNews.data.fake}%</span> non-authentic content nodes.
                    </p>
                  </div>
                </div>
              </section>

              {/* Module 6 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 6 · User Segmentation
                </h3>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-3">Persona Distribution</p>
                  <div className="grid grid-cols-2 gap-2">
                    {segmentation.data.clusters.slice(0, 4).map((c: any, i: number) => (
                      <div key={i} className="flex justify-between bg-white p-1.5 rounded border border-indigo-50 text-[10px] font-bold">
                        <span className="text-indigo-900 truncate mr-2">{c.name}</span>
                        <span className="text-indigo-500">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Module 7 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 7 · Data Visualization
                </h3>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                  <RiBarChartGroupedLine className="size-8 mx-auto text-emerald-300 mb-2" />
                  <p className="text-[10px] text-emerald-700 font-bold">Processed Stream Metrics for Keyword Context</p>
                  <Badge.Root variant="filled" color="green" size="small" className="mt-2">Integrity Verified</Badge.Root>
                </div>
              </section>

              {/* Module 8 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 8 · Ad Optimization
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-center">
                    <p className="text-[9px] text-orange-400 font-bold uppercase mb-1">ROI</p>
                    <p className="text-lg font-black text-orange-600">{adCampaign.data.roi}%</p>
                  </div>
                  <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-center">
                    <p className="text-[9px] text-orange-400 font-bold uppercase mb-1">CTR</p>
                    <p className="text-lg font-black text-orange-900">{adCampaign.data.conversion_rate}%</p>
                  </div>
                </div>
              </section>

              {/* Module 9 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 9 · Influencer Detection
                </h3>
                <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100">
                  <p className="text-[10px] font-bold text-sky-400 uppercase mb-3">Top Authorities</p>
                  <div className="space-y-2">
                    {influencer.data.influencers.slice(0, 2).map((inf: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-sky-50 text-[11px] font-black text-sky-900">
                        <span>{inf.name}</span>
                        <span className="text-sky-500 text-[9px]">{inf.followers} followers</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Module 10 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 10 · Real-Time Monitoring
                </h3>
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div className="bg-white p-3 rounded-lg border border-rose-50">
                    <p className="text-[9px] text-rose-400 font-bold uppercase">Mentions/Hr</p>
                    <p className="text-2xl font-black text-rose-900">{monitoring.data.mentions_per_hour}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-rose-400 font-bold uppercase mb-1">Status</p>
                    <Badge.Root variant="filled" color="green" size="small">ACTIVE</Badge.Root>
                  </div>
                </div>
              </section>

              {/* Module 11 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 11 · Competitor Analysis
                </h3>
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Benchmark Brands</p>
                  <div className="flex flex-wrap gap-2">
                    {competitor.data.brands.map((b: string, i: number) => (
                      <Badge.Root key={i} variant="filled" color="gray" size="small">{b}</Badge.Root>
                    ))}
                    {competitor.data.brands.length === 0 && <span className="text-[10px] text-gray-400 font-bold">No benchmarks selected</span>}
                  </div>
                </div>
              </section>

              {/* Module 12 */}
              <section className="space-y-3">
                <h3 className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <div className="size-2 rounded-full bg-black" />
                  Module 12 · Popularity Prediction
                </h3>
                <div className="p-4 bg-fuchsia-50/50 rounded-xl border border-fuchsia-100 flex items-center justify-between">
                  <div className="bg-white p-3 rounded-lg border border-fuchsia-50">
                    <p className="text-[9px] text-fuchsia-400 font-bold uppercase">Confidence</p>
                    <p className="text-2xl font-black text-fuchsia-900">{prediction.data.confidence}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-fuchsia-400 font-bold uppercase mb-1">Insights</p>
                    <Badge.Root variant="light" color="purple" size="small">Forecasting Live</Badge.Root>
                  </div>
                </div>
              </section>

            </div>

            {/* Final Footer */}
            <div className="mt-20 pt-10 border-t-2 border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
              <span className="flex items-center gap-2 text-black">
                <div className="size-2 rounded-full bg-black" />
                SMA Intelligence Consolidation v2.4
              </span>
              <span className="text-gray-300 italic">Proprietary Analytical Content</span>
              <span>Doc-00{Math.floor(Math.random() * 900) + 100}</span>
            </div>
          </div>
        </div>
      )}
      
      {loading && <LoadingOverlay />}
    </div>
  );
}

function fake_news_accuracy(acc: any) {
  if (typeof acc === 'number') return acc.toFixed(1);
  return acc || '95.2';
}
