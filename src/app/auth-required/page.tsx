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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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