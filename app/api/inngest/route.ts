import { serve } from 'inngest/next';
import { inngest } from '../../../server/utils/inngest';
import { processImageFunction } from '../../../server/functions/process-image';

// Export the serve handler with all registered functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processImageFunction,
  ],
});
