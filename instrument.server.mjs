/**
 * ========================================
 * SENTRY SERVER-SIDE INSTRUMENTATION
 * ========================================
 * 
 * This file must be imported before any other modules to ensure
 * Sentry can properly instrument server-side code and capture errors.
 * 
 * It's loaded via NODE_OPTIONS in package.json scripts.
 */
import * as Sentry from "@sentry/node";

// Initialize Sentry on the server-side
Sentry.init({
  // Your project's DSN - same as client-side
  dsn: "https://4fea2b028808d46d0cdf3af40e3c5980@o4509889777369088.ingest.de.sentry.io/4509896149631056",
  
  // ===== SERVER-SIDE INTEGRATIONS =====
  integrations: [
    // HTTP integration for request/response tracking
    Sentry.httpIntegration(),
    // Console integration for server logs
    Sentry.consoleIntegration(),
  ],

  // ===== PERFORMANCE CONFIGURATION =====
  // Server-side performance sampling - DISABLED IN DEVELOPMENT
  tracesSampleRate: process.env.NODE_ENV === "development" ? 0.0 : 0.1, // No tracing in dev, 10% in production

  // ===== ENVIRONMENT CONFIGURATION =====
  environment: process.env.NODE_ENV || "development",
  
  // ===== SERVER-SIDE SPECIFIC SETTINGS =====
  // Capture unhandled rejections and exceptions
  captureUnhandledRejections: true,
  captureUncaughtExceptions: true,
  
  // ===== REQUEST DATA CONFIGURATION =====
  // Include request data in error reports
  sendDefaultPii: true,
  
  // ===== DEBUG CONFIGURATION =====
  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
});

// Export for potential use in other server files
export default Sentry;
