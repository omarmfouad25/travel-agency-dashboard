import * as Sentry from "@sentry/react-router";

Sentry.init({
  dsn: "https://4fea2b028808d46d0cdf3af40e3c5980@o4509889777369088.ingest.de.sentry.io/4509896149631056",

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
