import type { Config } from "@react-router/dev/config";

/**
 * ========================================
 * REACT ROUTER CONFIGURATION
 * ========================================
 * 
 * Configuration for React Router v7 with Sentry integration.
 * This file configures build settings and server-side rendering options.
 */
export default {
  // ===== RENDERING CONFIGURATION =====
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  
  // ===== BUILD HOOKS =====
  // Optional: Add Sentry build integration when needed
  // buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
  //   // Sentry build integration can be added here if needed
  // },
} satisfies Config;
