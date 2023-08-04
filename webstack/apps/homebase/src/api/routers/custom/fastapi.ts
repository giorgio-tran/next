/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { createProxyMiddleware } from 'http-proxy-middleware';

import { config } from '../../../config';

/**
 * Route forwarding the fastapi calls to the fastapi server
 * @returns
 */
export function FastAPIRouter() {
  console.log('FastAPI> router for FastAPI', config.fastapi.url);

  const router = createProxyMiddleware({
    target: 'http://0.0.0.0:81',
    changeOrigin: true,
    pathRewrite: (path) => {
      return path.replace('/api/fastapi', '');
    },
    logLevel: 'warn', // 'debug' | 'info' | 'warn' | 'error' | 'silent'
    logProvider: () => console,
  });

  return router;
}
