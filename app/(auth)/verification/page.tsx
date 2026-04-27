'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import { RiMailCheckLine } from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as DigitInput from '@/components/ui/digit-input';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as LinkButton from '@/components/ui/link-button';

export default function PageVerification() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [digitInputValue, setDigitInputValue] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: digitInputValue,
      });

      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/');
      }
    } catch (err: any) {
      console.error('Error:', err.errors[0]?.longMessage);
      setError(err.errors[0]?.longMessage || 'Verification failed');
    }
  };

  return (
    <>
      <div className='flex flex-col items-center space-y-2'>
        {/* icon */}
        <div
          className={cn(
            'relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-20',
            // bg
            'before:absolute before:inset-0 before:rounded-full',
            'before:bg-gradient-to-b before:from-primary-base before:to-transparent before:opacity-10',
          )}
        >
          <div
            className='relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 lg:size-14'
            style={{
              boxShadow:
                '0 0 0 1px rgba(183, 83, 16, 0.04), 0 1px 1px 0.5px rgba(183, 83, 16, 0.04), 0 3px 3px -1.5px rgba(183, 83, 16, 0.02), 0 6px 6px -3px rgba(183, 83, 16, 0.04), 0 12px 12px -6px rgba(183, 83, 16, 0.04), 0px 24px 24px -12px rgba(183, 83, 16, 0.04), 0px 48px 48px -24px rgba(183, 83, 16, 0.04), inset 0px -1px 1px -0.5px rgba(183, 83, 16, 0.06)',
            }}
          >
            <RiMailCheckLine className='size-6 text-warning-base lg:size-7' />
          </div>
        </div>

        <div className='space-y-1 text-center'>
          <div className='font-inter-var text-title-h6 lg:text-title-h5'>
            Enter Verification Code
          </div>
          <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
            We’ve sent a code to your email
          </div>
        </div>
      </div>

      {error && (
        <div className='text-center text-error-base text-paragraph-sm'>
          {error}
        </div>
      )}

      <Divider.Root variant='line-spacing' />

      <form onSubmit={handleVerify} className='flex flex-col gap-6 w-full'>
        <DigitInput.Root
          numInputs={6}
          onChange={(value) => setDigitInputValue(value)}
          value={digitInputValue}
          shouldAutoFocus
        />

        <FancyButton.Root type='submit' variant='primary'>Verify</FancyButton.Root>
      </form>

      <div className='flex flex-col items-center gap-1 text-center'>
        <span className='text-paragraph-sm text-text-sub-600'>
          Experiencing issues receiving the code?
        </span>
        <LinkButton.Root variant='black' underline>
          Resend code
        </LinkButton.Root>
      </div>
    </>
  );
}
