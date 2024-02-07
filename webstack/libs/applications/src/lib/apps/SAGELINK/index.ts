/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { z } from 'zod';

/**
 * SAGE3 application: SAGELINK
 * created by: Giorgio Tran
 */

export const schema = z.object({
  linkstate: z.number(),
});
export type state = z.infer<typeof schema>;

export const init: Partial<state> = {
  linkstate: 12,
};

export const name = 'SAGELINK';
