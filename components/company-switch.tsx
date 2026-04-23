import { RiBarChart2Line } from '@remixicon/react';
import { cn } from '@/utils/cn';

export function CompanySwitch({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-3', className)}>
      <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-alpha-10'>
        <RiBarChart2Line className='size-5 text-primary-base' />
      </div>
      <div className='flex-1 space-y-0.5' data-hide-collapsed>
        <div className='text-label-sm text-text-strong-950'>Social Media</div>
        <div className='text-paragraph-xs text-text-sub-600'>Analysis</div>
      </div>
    </div>
  );
}

export function CompanySwitchMobile({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-[18px]', className)}>
      <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-alpha-10'>
        <RiBarChart2Line className='size-6 text-primary-base' />
      </div>
      <div className='flex-1 space-y-0.5'>
        <div className='text-label-md text-text-strong-950'>Social Media</div>
        <div className='text-paragraph-sm text-text-sub-600'>Analysis</div>
      </div>
    </div>
  );
}
