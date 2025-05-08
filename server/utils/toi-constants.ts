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


export const DressingRoomToTOIStatusMapper = {
  "Sizing Item": [TOI_STATUS.PROCESSING_STARTED, TOI_STATUS.DOWNLOADING_IMAGES],
  "Item Sized": [TOI_STATUS.PROCESSING_IMAGES],
  "Adorning": [TOI_STATUS.CALLING_OPENAI, TOI_STATUS.RECEIVED_OPENAI_IMAGE],
  "Mirror Check": [TOI_STATUS.PROCESSING_OPENAI_RESPONSE],
  "Final Adjustments": [TOI_STATUS.UPLOADING_RESULT],
  "Click To Reveal": [TOI_STATUS.COMPLETED],
  "Gone": [TOI_STATUS.ERROR],
}

// invert in variable TOIToDressingRoomStatusMapper. for eahc value in the array of values, map the value to the key
export const TOIToDressingRoomStatusMapper = Object.fromEntries(
  Object.entries(DressingRoomToTOIStatusMapper).flatMap(([key, values]) =>
    values.map((value) => [value, key])
  )
);
