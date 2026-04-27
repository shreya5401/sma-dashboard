'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailLine,
  RiUserAddLine,
} from '@remixicon/react';

import { cn } from '@/utils/cn';
import * as Divider from '@/components/ui/divider';
import * as FancyButton from '@/components/ui/fancy-button';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as SocialButton from '@/components/ui/social-button';

import IconApple from '~/icons/brands/apple.svg';
import IconGoogle from '~/icons/brands/google.svg';
import IconLinkedin from '~/icons/brands/linkedin.svg';

function PasswordInput(
  props: React.ComponentPropsWithoutRef<typeof Input.Input>,
) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input.Root>
      <Input.Wrapper>
        <Input.Icon as={RiLock2Line} />
        <Input.Input
          type={showPassword ? 'text' : 'password'}
          placeholder='••••••••••'
          {...props}
        />
        <button type='button' onClick={() => setShowPassword((s) => !s)}>
          {showPassword ? (
            <RiEyeOffLine className='size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300' />
          ) : (
            <RiEyeLine className='size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300' />
          )}
        </button>
      </Input.Wrapper>
    </Input.Root>
  );
}

export default function PageRegister() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      router.push('/verification');
    } catch (err: any) {
      console.error('Error:', err.errors[0]?.longMessage);
      setError(err.errors[0]?.longMessage || 'An error occurred during sign up');
    }
  };

  const handleOAuth = (provider: 'oauth_apple' | 'oauth_google' | 'oauth_linkedin_oidc') => {
    if (!isLoaded) return;
    signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
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
            <RiUserAddLine className='size-6 text-warning-base lg:size-7' />
          </div>
        </div>

        <div className='space-y-1 text-center'>
          <div className='font-inter-var text-title-h6 lg:text-title-h5'>
            Create a new account
          </div>
          <div className='text-paragraph-sm text-text-sub-600 lg:text-paragraph-md'>
            Enter your details to register.
          </div>
        </div>
      </div>

      {error && (
        <div className='text-center text-error-base text-paragraph-sm'>
          {error}
        </div>
      )}

      <div className='grid w-full auto-cols-fr grid-flow-col gap-3'>
        <SocialButton.Root
          mode='stroke'
          brand='apple'
          className='text-social-apple'
          onClick={() => handleOAuth('oauth_apple')}
        >
          <SocialButton.Icon as={IconApple} />
        </SocialButton.Root>
        <SocialButton.Root 
          mode='stroke' 
          brand='google'
          onClick={() => handleOAuth('oauth_google')}
        >
          <SocialButton.Icon as={IconGoogle} />
        </SocialButton.Root>
        <SocialButton.Root 
          mode='stroke' 
          brand='linkedin'
          onClick={() => handleOAuth('oauth_linkedin_oidc')}
        >
          <SocialButton.Icon as={IconLinkedin} />
        </SocialButton.Root>
      </div>

      <Divider.Root variant='line-text'>OR</Divider.Root>

      <form onSubmit={handleSignUp} className='space-y-6'>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label.Root htmlFor='fullname'>
              Full Name <Label.Asterisk />
            </Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='fullname'
                  type='text'
                  placeholder='James Brown'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className='space-y-1'>
            <Label.Root htmlFor='email'>
              Email Address <Label.Asterisk />
            </Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiMailLine} />
                <Input.Input
                  id='email'
                  type='email'
                  placeholder='hello@alignui.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className='space-y-1'>
            <Label.Root htmlFor='password'>
              Password <Label.Asterisk />
            </Label.Root>
            <PasswordInput 
              id='password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <Hint.Root>
              <Hint.Icon as={RiInformationFill} />
              Must contain 1 uppercase letter, 1 number, min. 8 characters.
            </Hint.Root>
          </div>
        </div>

        <FancyButton.Root type='submit' variant='primary' size='medium'>
          Register
        </FancyButton.Root>
      </form>
    </>
  );
}
