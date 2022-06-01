/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

/**
 * Express API Router.
 * @file API Routes Loader
 * @author <a href="mailto:rtheriot@hawaii.edu">Ryan Theriot</a>
 * @version 1.0.0
 */

// Externam imports
import * as express from 'express';

// App imports
import { boardExpressRouter, roomExpressRouter, userExpressRouter, appExpressRouter, assetExpressRouter } from '../http';

// Lib Imports
import { SAGEBase } from '@sage3/sagebase';

/**
 * API Loader function
 * @export
 * @param {any} io  The Socket.io object instance created in main.ts.
 * @returns {express.Router} returns the express router object
 */
export function expressAPIRouter(): express.Router {
  // Express routing
  const router = express.Router();

  // Authenticate all API Routes
  router.use(SAGEBase.Auth.authenticate);

  router.use('/assets', assetExpressRouter());

  router.use('/apps', appExpressRouter());

  router.use('/boards', boardExpressRouter());

  router.use('/rooms', roomExpressRouter());

  router.use('/users', userExpressRouter());

  return router;
}
