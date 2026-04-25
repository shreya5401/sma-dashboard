'use client';

import * as React from 'react';
import {
  RiUserStarLine,
  RiNodeTree,
  RiLinksLine,
  RiGroupLine,
  RiRefreshLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCloseCircleLine,
} from '@remixicon/react';

import { useModuleData } from '@/hooks/use-module-data';
import { LoadingOverlay } from '@/components/loading-overlay';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Modal from '@/components/ui/modal';

export type Influencer = {
  rank: number;
  name: string;
  followers: string;
  score: number;
  delta: string;
  mention_count: number;
  engagement: number;
};

export type GraphNode = {
  id: string;
  name: string;
  score: number;
  followers: number;
  in_degree: number;
  out_degree: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  weight: number;
};

export type InfluencerData = {
  influencers: Influencer[];
  algorithm: string;
  stats: { nodes: number; edges: number; components: number };
  graph?: { nodes: GraphNode[]; edges: GraphEdge[] };
};

const FALLBACK: InfluencerData = {
  influencers: [],
  algorithm: 'eigenvector_centrality',
  stats: { nodes: 0, edges: 0, components: 0 },
  graph: { nodes: [], edges: [] },
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: string;
};

type SortKey =
  | 'rank'
  | 'followers'
  | 'mention_count'
  | 'engagement'
  | 'score'
  | 'delta';

type SortState = { key: SortKey; dir: 'asc' | 'desc' };

export function InfluencerDetailsDrawer({ open, onOpenChange, keyword }: Props) {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<SortState>({ key: 'rank', dir: 'asc' });

  const { data, loading } = useModuleData<InfluencerData>(
    'influencer',
    open ? keyword : '',
    FALLBACK,
    { include_graph: 'true', _r: String(refreshKey) },
  );

  React.useEffect(() => {
    setHoveredId(null);
    setSelectedId(null);
  }, [open, keyword]);

  const graph = data.graph ?? { nodes: [], edges: [] };
  const activeId = hoveredId ?? selectedId;

  const handleToggleSelect = React.useCallback((id: string | null) => {
    setSelectedId((prev) => (id && prev === id ? null : id));
  }, []);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className='max-w-[1180px]'>
        <Modal.Header
          icon={RiUserStarLine}
          title='Module 9 · Influencer Detection'
          description={`Top voices for "${keyword}" ranked by eigenvector centrality`}
        />
        <Modal.Body className='relative max-h-[85vh] overflow-y-auto p-0'>
          {loading && <LoadingOverlay />}

          <div className='grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_400px]'>
            <div className='flex min-w-0 flex-col gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <StatsBar stats={data.stats} algorithm={data.algorithm} />
                <Button.Root
                  variant='neutral'
                  mode='stroke'
                  size='xxsmall'
                  onClick={() => setRefreshKey((k) => k + 1)}
                  disabled={loading}
                >
                  <Button.Icon as={RiRefreshLine} />
                  Refresh
                </Button.Root>
              </div>

              <RankedTable
                rows={data.influencers}
                sort={sort}
                onSortChange={setSort}
                activeId={activeId}
                onHover={setHoveredId}
                onToggleSelect={handleToggleSelect}
              />

              <InteractionHint />
            </div>

            <div className='flex min-w-0 flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <div className='text-label-sm text-text-strong-950'>Mention Network</div>
                {selectedId && (
                  <button
                    type='button'
                    onClick={() => setSelectedId(null)}
                    className='flex items-center gap-1 text-paragraph-xs text-text-sub-600 hover:text-text-strong-950'
                  >
                    <RiCloseCircleLine className='size-3.5' />
                    Clear selection
                  </button>
                )}
              </div>

              <NetworkGraph
                nodes={graph.nodes}
                edges={graph.edges}
                activeId={activeId}
                onHover={setHoveredId}
                onToggleSelect={handleToggleSelect}
              />

              <ActiveNodeCard
                activeId={activeId}
                nodes={graph.nodes}
                edges={graph.edges}
                rows={data.influencers}
              />

              <Legend />
            </div>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Header widgets                                                             */
/* -------------------------------------------------------------------------- */

function StatsBar({
  stats,
  algorithm,
}: {
  stats: { nodes: number; edges: number; components: number };
  algorithm: string;
}) {
  const prettyAlgo = algorithm
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <StatChip icon={RiGroupLine} label={`${stats.nodes} users`} />
      <StatChip icon={RiLinksLine} label={`${stats.edges} mentions`} />
      <StatChip icon={RiNodeTree} label={`${stats.components} components`} />
      <Badge.Root variant='light' color='yellow' size='medium'>
        {prettyAlgo}
      </Badge.Root>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className='flex items-center gap-1.5 rounded-lg bg-bg-weak-50 px-2.5 py-1.5'>
      <Icon className='size-4 text-text-sub-600' />
      <span className='text-label-xs text-text-sub-600'>{label}</span>
    </div>
  );
}

function InteractionHint() {
  return (
    <div className='rounded-lg bg-bg-weak-50 px-3 py-2 text-paragraph-xs text-text-sub-600'>
      Hover a row to highlight the node in the network · click to pin the
      selection · click any numeric column header to sort.
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ranked table                                                               */
/* -------------------------------------------------------------------------- */

function parseFollowers(s: string): number {
  const match = s.match(/^([\d.]+)\s*([KMB]?)$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'B') return num * 1e9;
  if (suffix === 'M') return num * 1e6;
  if (suffix === 'K') return num * 1e3;
  return num;
}

function nameToId(name: string): string {
  return name.replace(/^@/, '');
}

function RankedTable({
  rows,
  sort,
  onSortChange,
  activeId,
  onHover,
  onToggleSelect,
}: {
  rows: Influencer[];
  sort: SortState;
  onSortChange: (s: SortState) => void;
  activeId: string | null;
  onHover: (id: string | null) => void;
  onToggleSelect: (id: string) => void;
}) {
  const sorted = React.useMemo(() => {
    const getVal = (r: Influencer, key: SortKey): number => {
      if (key === 'followers') return parseFollowers(r.followers);
      if (key === 'delta') return parseFloat(r.delta);
      return r[key] as number;
    };
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = getVal(a, sort.key);
      const bv = getVal(b, sort.key);
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [rows, sort]);

  const handleSort = (key: SortKey) => {
    if (sort.key === key) {
      onSortChange({ key, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ key, dir: key === 'rank' ? 'asc' : 'desc' });
    }
  };

  if (rows.length === 0) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 py-12 text-paragraph-sm text-text-soft-400'>
        No influencer data yet.
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-xl border border-stroke-soft-200'>
      <table className='w-full min-w-[640px] text-label-sm'>
        <thead className='bg-bg-weak-50'>
          <tr className='text-left text-subheading-2xs uppercase tracking-wider text-text-soft-400'>
            <SortHeader
              label='#'
              colKey='rank'
              sort={sort}
              onSort={handleSort}
              align='left'
              width='w-10'
            />
            <th className='px-3 py-2.5 font-medium'>User</th>
            <SortHeader
              label='Followers'
              colKey='followers'
              sort={sort}
              onSort={handleSort}
            />
            <SortHeader
              label='Mentions'
              colKey='mention_count'
              sort={sort}
              onSort={handleSort}
            />
            <SortHeader
              label='Engagement'
              colKey='engagement'
              sort={sort}
              onSort={handleSort}
            />
            <SortHeader
              label='Score'
              colKey='score'
              sort={sort}
              onSort={handleSort}
            />
            <SortHeader
              label='Delta'
              colKey='delta'
              sort={sort}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody className='divide-y divide-stroke-soft-200 bg-bg-white-0'>
          {sorted.map((r) => {
            const id = nameToId(r.name);
            const isActive = activeId === id;
            const dimmed = activeId !== null && !isActive;
            return (
              <tr
                key={r.rank}
                onMouseEnter={() => onHover(id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onToggleSelect(id)}
                className={[
                  'cursor-pointer text-text-strong-950 transition-colors',
                  isActive ? 'bg-warning-lighter/40' : '',
                  dimmed ? 'opacity-50' : '',
                ].join(' ')}
              >
                <td className='px-3 py-2.5 text-text-soft-400 tabular-nums'>
                  {r.rank}
                </td>
                <td className='px-3 py-2.5 font-medium'>{r.name}</td>
                <td className='px-3 py-2.5 text-right tabular-nums'>
                  {r.followers}
                </td>
                <td className='px-3 py-2.5 text-right tabular-nums text-text-sub-600'>
                  {r.mention_count.toLocaleString()}
                </td>
                <td className='px-3 py-2.5 text-right tabular-nums text-text-sub-600'>
                  {r.engagement.toLocaleString()}
                </td>
                <td className='px-3 py-2.5 text-right tabular-nums font-medium'>
                  {r.score.toFixed(3)}
                </td>
                <td
                  className={`px-3 py-2.5 text-right tabular-nums ${
                    r.delta.startsWith('-')
                      ? 'text-error-base'
                      : 'text-success-base'
                  }`}
                >
                  {r.delta}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label,
  colKey,
  sort,
  onSort,
  align = 'right',
  width,
}: {
  label: string;
  colKey: SortKey;
  sort: SortState;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
  width?: string;
}) {
  const isActive = sort.key === colKey;
  const arrow = !isActive ? null : sort.dir === 'asc' ? (
    <RiArrowUpSLine className='size-3.5' />
  ) : (
    <RiArrowDownSLine className='size-3.5' />
  );
  return (
    <th className={`px-3 py-2.5 font-medium ${width ?? ''}`}>
      <button
        type='button'
        onClick={() => onSort(colKey)}
        className={[
          'inline-flex items-center gap-1 transition-colors hover:text-text-strong-950',
          align === 'right' ? 'ml-auto flex justify-end' : '',
          isActive ? 'text-text-strong-950' : '',
        ].join(' ')}
      >
        <span>{label}</span>
        <span className='inline-flex w-3.5 justify-center'>{arrow}</span>
      </button>
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/* Selected / hovered node detail card                                        */
/* -------------------------------------------------------------------------- */

function ActiveNodeCard({
  activeId,
  nodes,
  edges,
  rows,
}: {
  activeId: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  rows: Influencer[];
}) {
  if (!activeId) {
    return (
      <div className='rounded-xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 px-4 py-3 text-paragraph-xs text-text-soft-400'>
        Hover or click a row/node to see connection details here.
      </div>
    );
  }

  const node = nodes.find((n) => n.id === activeId);
  const row = rows.find((r) => nameToId(r.name) === activeId);

  // The graph is trimmed to the top 20; fall back to row data if the active
  // user doesn't appear there (e.g. while the graph payload is still loading).
  const display = node
    ? {
        name: node.name,
        score: node.score,
        followers: node.followers,
        in_degree: node.in_degree,
        out_degree: node.out_degree,
      }
    : row
      ? {
          name: row.name,
          score: row.score,
          followers: parseFollowers(row.followers),
          in_degree: row.mention_count,
          out_degree: 0,
        }
      : null;

  if (!display) return null;

  const mentionedBy = edges.filter((e) => e.target === activeId);
  const mentioning = edges.filter((e) => e.source === activeId);
  const topMentioners = [...mentionedBy]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  return (
    <div className='rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='text-label-md font-medium text-text-strong-950'>
            {display.name}
          </div>
          <div className='text-paragraph-xs text-text-sub-600'>
            score {display.score.toFixed(3)} ·{' '}
            {display.followers.toLocaleString()} followers
          </div>
        </div>
        <Badge.Root variant='light' color='blue' size='medium'>
          #{row?.rank ?? '?'}
        </Badge.Root>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-2'>
        <MiniStat label='Mentioned by' value={mentionedBy.length} />
        <MiniStat label='Mentions out' value={mentioning.length} />
      </div>

      {topMentioners.length > 0 && (
        <div className='mt-3'>
          <div className='mb-1 text-subheading-2xs uppercase tracking-wider text-text-soft-400'>
            Top mentioners
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {topMentioners.map((e) => (
              <span
                key={`${e.source}-${e.target}`}
                className='inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-2 py-0.5 text-paragraph-xs text-text-sub-600'
              >
                @{e.source}
                <span className='text-text-soft-400'>×{e.weight}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className='rounded-lg bg-bg-weak-50 px-2.5 py-1.5'>
      <div className='text-paragraph-xs text-text-soft-400'>{label}</div>
      <div className='text-label-md tabular-nums text-text-strong-950'>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Legend                                                                     */
/* -------------------------------------------------------------------------- */

function Legend() {
  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-bg-weak-50 px-3 py-2'>
      <LegendRow color='#f59e0b' label='Node size = centrality score' />
      <LegendRow color='#3b82f6' label='Mostly mentioned (influencer)' />
      <LegendRow color='#10b981' label='Mostly mentioning (connector)' />
      <LegendRow color='#94a3b8' label='Edge width = mention count' line />
    </div>
  );
}

function LegendRow({
  color,
  label,
  line,
}: {
  color: string;
  label: string;
  line?: boolean;
}) {
  return (
    <div className='flex items-center gap-1.5'>
      {line ? (
        <div className='h-0.5 w-5' style={{ background: color }} />
      ) : (
        <div className='size-2.5 rounded-full' style={{ background: color }} />
      )}
      <span className='text-paragraph-xs text-text-sub-600'>{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Network visualization                                                      */
/* -------------------------------------------------------------------------- */

const VIEW_SIZE = 380;
const CENTER = VIEW_SIZE / 2;
const RADIUS = VIEW_SIZE / 2 - 42;
const NODE_MIN = 6;
const NODE_MAX = 22;

type Point = { x: number; y: number };

function circularLayout(nodes: GraphNode[]): Record<string, Point> {
  const positions: Record<string, Point> = {};
  const n = nodes.length;
  if (n === 0) return positions;

  const sorted = [...nodes].sort((a, b) => b.score - a.score);
  if (n === 1) {
    positions[sorted[0].id] = { x: CENTER, y: CENTER };
    return positions;
  }

  positions[sorted[0].id] = { x: CENTER, y: CENTER };
  const outer = sorted.slice(1);
  outer.forEach((node, i) => {
    const angle = (i / outer.length) * Math.PI * 2 - Math.PI / 2;
    positions[node.id] = {
      x: CENTER + RADIUS * Math.cos(angle),
      y: CENTER + RADIUS * Math.sin(angle),
    };
  });
  return positions;
}

function NetworkGraph({
  nodes,
  edges,
  activeId,
  onHover,
  onToggleSelect,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onToggleSelect: (id: string) => void;
}) {
  const positions = React.useMemo(() => circularLayout(nodes), [nodes]);
  const adjacency = React.useMemo(() => {
    const adj = new Set<string>();
    if (!activeId) return adj;
    edges.forEach((e) => {
      if (e.source === activeId) adj.add(e.target);
      if (e.target === activeId) adj.add(e.source);
    });
    return adj;
  }, [edges, activeId]);

  if (nodes.length === 0) {
    return (
      <div className='flex aspect-square items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 text-paragraph-sm text-text-soft-400'>
        No mention graph available for this keyword yet.
      </div>
    );
  }

  const maxScore = Math.max(...nodes.map((n) => n.score), 1e-9);
  const maxWeight = Math.max(...edges.map((e) => e.weight), 1);

  const nodeRadius = (score: number) =>
    NODE_MIN + (NODE_MAX - NODE_MIN) * (score / maxScore);

  const nodeColor = (n: GraphNode) => {
    if (n.in_degree === 0 && n.out_degree === 0) return '#94a3b8';
    return n.in_degree >= n.out_degree ? '#3b82f6' : '#10b981';
  };

  return (
    <div className='relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0'>
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className='aspect-square w-full'
        role='img'
        aria-label='Mention network'
      >
        <defs>
          <marker
            id='influencer-arrow'
            viewBox='0 0 10 10'
            refX='9'
            refY='5'
            markerWidth='5'
            markerHeight='5'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' fill='#cbd5e1' />
          </marker>
          <marker
            id='influencer-arrow-active'
            viewBox='0 0 10 10'
            refX='9'
            refY='5'
            markerWidth='5'
            markerHeight='5'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' fill='#f59e0b' />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const from = positions[e.source];
          const to = positions[e.target];
          if (!from || !to) return null;
          const isActive =
            activeId !== null &&
            (e.source === activeId || e.target === activeId);
          const dimmed = activeId !== null && !isActive;
          const width = 0.75 + (e.weight / maxWeight) * 2.5;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isActive ? '#f59e0b' : '#cbd5e1'}
              strokeOpacity={isActive ? 0.95 : dimmed ? 0.12 : 0.45}
              strokeWidth={isActive ? width + 0.75 : width}
              markerEnd={
                isActive
                  ? 'url(#influencer-arrow-active)'
                  : 'url(#influencer-arrow)'
              }
            />
          );
        })}

        {nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const r = nodeRadius(n.score);
          const isActive = activeId === n.id;
          const isNeighbor = adjacency.has(n.id);
          const dimmed = activeId !== null && !isActive && !isNeighbor;
          return (
            <g
              key={n.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() => onHover(n.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onToggleSelect(n.id)}
              className='cursor-pointer'
              style={{ opacity: dimmed ? 0.35 : 1, transition: 'opacity 120ms' }}
            >
              <circle
                r={isActive ? r + 2 : r}
                fill={nodeColor(n)}
                fillOpacity={isActive ? 1 : 0.8}
                stroke={isActive ? '#f59e0b' : '#ffffff'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {isActive && (
                <g transform={`translate(0, ${-r - 10})`}>
                  <rect
                    x={-64}
                    y={-20}
                    width={128}
                    height={24}
                    rx={4}
                    fill='#0f172a'
                    fillOpacity={0.94}
                  />
                  <text
                    x={0}
                    y={-4}
                    textAnchor='middle'
                    fontSize={10}
                    fill='#ffffff'
                    fontFamily='system-ui, sans-serif'
                  >
                    {n.name} · {n.score.toFixed(3)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
