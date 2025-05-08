import { Inngest } from 'inngest';

// Create the Inngest client
export const inngest = new Inngest({ 
  id: 'sanne-app',
  eventKey: process.env.INNGEST_EVENT_KEY || '',
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
