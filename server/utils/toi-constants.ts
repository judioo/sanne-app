/**
 * Constants for Try On Image (TOI) processing statuses
 * Used across the application to track the status of image processing jobs
 */

export const TOI_STATUS = {
  // Initial statuses
  PROCESSING_STARTED: 'processing-started',
  
  // Image downloading and processing
  DOWNLOADING_IMAGES: 'downloading-images',
  PROCESSING_IMAGES: 'processing-images',
  
  // OpenAI integration
  CALLING_OPENAI: 'calling-openai',
  RECEIVED_OPENAI_IMAGE: 'received-openai-image',
  PROCESSING_OPENAI_RESPONSE: 'processing-openai-response',
  
  // UploadThing integration
  UPLOADING_RESULT: 'uploading-result',
  
  // Final statuses
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

// Type for status values
export type TOIStatus = typeof TOI_STATUS[keyof typeof TOI_STATUS];

// Type for TOI job payloads with status
export interface TOIJobPayload {
  status: TOIStatus;
  productId: number;
  md5sum: string;
  timestamp: number;
  error?: string;
  url?: string;
}
