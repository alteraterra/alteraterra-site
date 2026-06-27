import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

interface InvokeOptions {
  // Support both the new {path, body} shape and the legacy {url, data} shape.
  path?: string;
  url?: string;
  method?: string;
  body?: unknown;
  data?: unknown;
  timeout?: number;
}

export const client = {
  apiCall: {
    invoke: async ({ path, url, method = 'POST', body, data, timeout }: InvokeOptions) => {
      // Prefer explicit path/body; fall back to legacy url/data.
      let requestUrl = path ?? url ?? '';
      // Strip a leading /api prefix when present, since axios baseURL already includes it.
      if (requestUrl.startsWith('/api/')) {
        requestUrl = requestUrl.slice(4);
      }
      const res = await api.request({
        url: requestUrl,
        method,
        data: body ?? data,
        timeout,
      });
      return res.data;
    },
  },
};
