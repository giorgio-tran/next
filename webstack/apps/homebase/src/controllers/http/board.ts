/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

/**
 * The BoardAPI for SAGE3
 *
 * Flow Diagram
 * ┌──┐  ┌─────┐  ┌─────────┐  ┌───┐
 * │DB│◄─┤Model│◄─┤ Service │◄─┤API│
 * └──┘  └─────┘  └─────────┘  └───┘
 *
 * @author <a href="mailto:rtheriot@hawaii.edu">Ryan Theriot</a>
 * @version 1.0.0
 */

// External Importrs
import * as express from 'express';

// App Imports
import { BoardService } from '../../services';

/**
 * Board route/api express middleware.
 * @returns {express.Router} returns the express router object
 */
export function boardExpressRouter(): express.Router {
  const router = express.Router();

  // CRUD routes

  // Create a new board: POST /api/boards
  router.post('/', async ({ user, body }, res) => {
    const board = await BoardService.create(body.name, body.description, user.id, body.roomId);
    if (board) res.status(200).send({ success: true, data: board });
    else res.status(500).send({ success: false });
  });

  // Get all the boards: GET /api/boards
  router.get('/', async (req, res) => {
    const boards = await BoardService.readAll();
    if (boards) res.status(200).send({ success: true, data: boards });
    else res.status(500).send({ success: false });
  });

  // Get one board: GET /api/boards/:id
  router.get('/:id', async ({ params }, res) => {
    const board = await BoardService.read(params.id);
    if (board) res.status(200).send({ success: true, data: board });
    else res.status(500).send({ success: false });
  });

  // Update one board: PUT /api/boards/:id
  router.put('/:id', async ({ params, body }, res) => {
    const update = await BoardService.update(params.id, body);
    if (update) res.status(200).send({ success: true });
    else res.status(500).send({ success: false });
  });

  // Delete one board: DELETE /api/boards/:id
  router.delete('/:id', async ({ params }, res) => {
    const del = await BoardService.delete(params.id);
    if (del) res.status(200).send({ success: true });
    else res.status(500).send({ success: false });
  });

  // Custom routes

  // xxx
  router.get('/roomId/:roomId', async ({ params }, res) => {
    const boards = await BoardService.query('roomId', params);
    if (boards) res.status(200).send({ success: true, data: boards });
    else res.status(500).send({ success: false });
  });

  return router;
}
