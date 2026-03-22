import { Suspense } from 'react';
import AuthWarning from '@/components/AuthWarning';

interface AuthRequiredPageProps {
  searchParams: Promise<{
    target?: string;
    redirect?: string;
  }>;
}

export default async function AuthRequiredPage({ searchParams }: AuthRequiredPageProps) {
  const params = await searchParams;
  const targetRoute = params.target;
  const redirectUrl = params.redirect || '/auth/signin';

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    }>
      <AuthWarning
        targetRoute={targetRoute}
        redirectUrl={redirectUrl}
        countdown={10}
        allowCancel={true}
      />
    </Suspense>
  );
}
