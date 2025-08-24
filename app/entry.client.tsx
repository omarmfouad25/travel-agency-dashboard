import * as Sentry from "@sentry/react-router";
 import { startTransition, StrictMode } from "react";
 import { hydrateRoot } from "react-dom/client";
 import { HydratedRouter } from "react-router/dom";

/**
 * ========================================
 * SENTRY CONFIGURATION - DEVELOPMENT OPTIMIZED
 * ========================================
 * 
 * This configuration is optimized for development:
 * ✅ Error tracking and reporting (always enabled)
 * ✅ Session Replay for debugging user interactions
 * ❌ Performance monitoring/tracing (DISABLED in development)
 * ❌ Distributed tracing (DISABLED in development)
 * ❌ Browser tracing integration (DISABLED in development)
 * 
 * Benefits in development:
 * - Cleaner console output
 * - Better development performance
 * - Less noise in Sentry dashboard
 * - Focus on error tracking and session replay
 */
Sentry.init({
 // Your project's DSN (Data Source Name) - connects to your Sentry project
 dsn: "https://4fea2b028808d46d0cdf3af40e3c5980@o4509889777369088.ingest.de.sentry.io/4509896149631056",
 
 // Adds request headers and IP for users, for more info visit:
 // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
 sendDefaultPii: true,
 
 // ===== PERFORMANCE MONITORING + SESSION REPLAY INTEGRATIONS =====
 integrations: [
   // Browser tracing integration - DISABLED IN DEVELOPMENT to reduce noise
   // Only enable in production for performance monitoring
   ...(import.meta.env.MODE !== 'development' ? [
     Sentry.browserTracingIntegration({
       // Automatically instrument React Router navigation
       enableInp: true, // Enable Interaction to Next Paint (INP) tracking
     })
   ] : []),
   // Capture console errors and warnings
   Sentry.captureConsoleIntegration({
     levels: ['error', 'warn']
   }),
   // ===== SESSION REPLAY INTEGRATION =====
   // Records user interactions, clicks, scrolls, and page changes
   Sentry.replayIntegration({
     // Mask all text content by default for privacy
     maskAllText: false, // Set to true in production for privacy
     // Block all media (images, videos) by default
     blockAllMedia: false, // Set to true in production for privacy
     // Additional privacy settings
     maskAllInputs: true, // Always mask input fields for security
     // Network request/response recording
     networkDetailAllowUrls: [
       // Record network details for these URLs (useful for debugging API calls)
       /localhost/,
       /appwrite/,
       /googleapis/,
     ],
   }),
 ],

 // ===== PERFORMANCE SAMPLING CONFIGURATION =====
 // DISABLE TRACING IN DEVELOPMENT - Set to 0.0 to disable performance monitoring during dev
 // This reduces noise and improves development performance
 tracesSampleRate: import.meta.env.MODE === 'development' ? 0.0 : 0.1, // No tracing in dev, 10% in production
 
 // ===== DISTRIBUTED TRACING CONFIGURATION =====
 // DISABLE DISTRIBUTED TRACING IN DEVELOPMENT to reduce noise
 // Control for which URLs distributed tracing should be enabled
 tracePropagationTargets: import.meta.env.MODE === 'development' ? [] : [
   "localhost", 
   /^https:\/\/.*\.appwrite\..*/, // Appwrite API calls
   /^https:\/\/people\.googleapis\.com/, // Google People API calls
   /^https:\/\/.*\.nunutour\..*/, // Your domain (if you have one)
   // Add your production API endpoints here
 ],

 // ===== ENVIRONMENT CONFIGURATION =====
 environment: import.meta.env.MODE, // 'development' or 'production'
 
 // ===== SESSION REPLAY SAMPLING RATES =====
 // These settings control how often sessions are recorded
 // Using higher rates in development for testing purposes
 replaysSessionSampleRate: import.meta.env.MODE === 'development' ? 1.0 : 0.1, // 100% in dev, 10% in production
 replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
 
 // ===== SESSION REPLAY DEBUG =====
 // Enable debug logging to see when replays are being recorded
 debug: import.meta.env.MODE === 'development',
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
