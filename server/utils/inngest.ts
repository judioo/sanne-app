import { Inngest } from 'inngest';

// Log environment information for debugging
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  console.log(`[Inngest Config] Running in ${process.env.NODE_ENV} mode`);
  console.log(`[Inngest Config] Event key available: ${Boolean(process.env.INNGEST_EVENT_KEY)}`);
  console.log(`[Inngest Config] Signing key available: ${Boolean(process.env.INNGEST_SIGNING_KEY)}`);
}

// Create a client with your Inngest credentials
export const inngest = new Inngest({
  id: 'assured-scraper',
  // Enable dev mode for better logging
  dev: true,
  // Always pass the event key (working in both dev and prod)
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Add better error handling
  logger: {
    debug: (msg) => console.log(`[Inngest Debug] ${msg}`),
    info: (msg) => console.log(`[Inngest Info] ${msg}`),
    warn: (msg) => console.warn(`[Inngest Warning] ${msg}`),
    error: (msg, err) => console.error(`[Inngest Error] ${msg}`, err),
  },
});

// Define event types
export interface ProcessImageEvent {
  name: 'image/process';
  data: {
    image: string;
    imgMD5: string;
    productId: number;
    TOIJobId: string;
  };
}
