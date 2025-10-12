import { Suspense } from 'react';
import AuthWarning from '@/components/AuthWarning';

interface AuthRequiredPageProps {
  searchParams: {
    target?: string;
    redirect?: string;
  };
}

export default function AuthRequiredPage({ searchParams }: AuthRequiredPageProps) {
  const targetRoute = searchParams.target;
  const redirectUrl = searchParams.redirect || '/auth/signin';

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