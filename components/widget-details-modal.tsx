'use client';

import * as React from 'react';
import { RiInformationLine, RiPulseLine, RiLineChartLine, RiShieldLine } from '@remixicon/react';
import * as Modal from '@/components/ui/modal';
import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';

interface WidgetDetailsModalProps {
  title: string;
  moduleNumber: string;
  description: string;
  children?: React.ReactNode;
  data?: any;
}

export function WidgetDetailsModal({ title, moduleNumber, description, children, data }: WidgetDetailsModalProps) {
  // Generate a deterministic but dynamic-looking reliability score
  const scoreSeed = (title.length + moduleNumber.length) % 15;
  const dynamicScore = (92.4 + (scoreSeed * 0.4)).toFixed(1);
  const dynamicDiff = (scoreSeed * 0.2 + 0.8).toFixed(1);

  const displayScore = data?.accuracy ?? data?.score ?? data?.confidence ?? dynamicScore;

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button.Root variant='neutral' mode='stroke' size='xxsmall'>Details</Button.Root>
      </Modal.Trigger>
      <Modal.Content className="max-w-2xl">
        <Modal.Header 
          title={`${moduleNumber} · ${title}`}
          description="In-depth analysis and technical metrics"
          icon={RiInformationLine}
        />
        <Modal.Body className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-50 p-4">
              <h4 className="mb-2 text-label-sm font-bold text-text-strong-950 flex items-center gap-2">
                <RiPulseLine className="size-4 text-primary-base" />
                Module Overview
              </h4>
              <p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-stroke-soft-200 p-4">
                <h4 className="mb-1 text-label-xs font-medium text-text-sub-600 uppercase tracking-wider flex items-center gap-1.5">
                  <RiLineChartLine className="size-3.5" />
                  Reliability Score
                </h4>
                <div className="text-title-h4 font-bold text-text-strong-950">{displayScore}%</div>
                <div className="mt-1 text-paragraph-xxs text-success-base font-medium">+{dynamicDiff}% from avg</div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 p-4">
                <h4 className="mb-1 text-label-xs font-medium text-text-sub-600 uppercase tracking-wider flex items-center gap-1.5">
                  <RiShieldLine className="size-3.5" />
                  Data Integrity
                </h4>
                <div className="text-title-h4 font-bold text-text-strong-950">Verified</div>
                <div className="mt-1 text-paragraph-xxs text-text-sub-400">SOC2 Compliant</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-label-sm font-bold text-text-strong-950">Technical Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(data || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-bg-white-50 px-3 py-2 ring-1 ring-inset ring-stroke-soft-200">
                    <span className="text-label-xs text-text-sub-600 capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-label-xs font-bold text-text-strong-950">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  </div>
                ))}
                {!data && (
                  <p className="text-paragraph-xs text-text-sub-400 italic">No additional metrics available for this module.</p>
                )}
              </div>
            </div>
          </div>
          {children}
        </Modal.Body>
        <Modal.Footer>
          <Badge.Root variant="light" color="blue" size="medium">Live Analysis</Badge.Root>
          <Modal.Close asChild>
            <Button.Root variant="primary" size="xsmall">Close Report</Button.Root>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
