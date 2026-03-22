import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessDebugEndpoints } from "@/lib/security/debug-access";

export async function GET(request: NextRequest) {
  if (!canAccessDebugEndpoints(request.headers)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      success: true,
      isAuthenticated: !!session?.user?.id,
      user: session?.user?.id
        ? {
            id: session.user.id,
            role: session.user.role,
          }
        : null,
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
