import "@testing-library/jest-dom";
import React from "react";
import { TextEncoder, TextDecoder } from "util";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js cache utilities
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "CLIENT",
      },
    },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock server actions
jest.mock("@/server/reviewActions", () => ({
  createReview: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
  getReviews: jest.fn(),
  getReviewStats: jest.fn(),
}));

// Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement("img", props);
  },
}));

// Setup ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Setup matchMedia mock (safe for node + jsdom)
const matchMediaTarget = typeof window !== "undefined" ? window : (globalThis as unknown as Record<string, unknown>);

if (!matchMediaTarget.matchMedia) {
  matchMediaTarget.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// Polyfill encoding APIs used by Next internals
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  // @ts-expect-error -- TextDecoder existe via util em ambiente de teste Node
  global.TextDecoder = TextDecoder;
}
