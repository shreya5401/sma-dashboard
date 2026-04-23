export function LoadingOverlay() {
  return (
    <div className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-bg-white-0/80'>
      <div className='size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent' />
    </div>
  );
}
