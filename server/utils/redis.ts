import { Redis } from '@upstash/redis';

const toiJobs = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });   

  export interface toiPayload {
    jobId: string;
    debug?: boolean;
    [key: string]: any;
  }

  // Define the QueryCache function with a generic type
export const QueryCache = <T>() => {
    let statePayload: T | {} = {};
  
    return {
      set: async (params: T & toiPayload) => {
        if (params.debug) {
          // @ts-ignore
          return await toiJobs.set(params.jobId, {
            updatedAt: Date.now(),
            ...params,
          });
        }
        statePayload = { ...statePayload, ...params };
        await toiJobs.set(params.jobId, {
          updatedAt: Date.now(),
          ...statePayload,
        });
      },
      get: async (jobId: string): Promise<T | toiPayload | null> => {
        return await toiJobs.get(jobId);
      },
      delete: async (jobId: string) => {
        return await toiJobs.del(jobId);
      }
    };
  };
