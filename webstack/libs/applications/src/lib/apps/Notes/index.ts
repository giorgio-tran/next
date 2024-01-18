/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { z } from 'zod';
import { Block } from '@blocknote/core';

/**
 * SAGE3 application: Notes
 * created by: Giorgio Tran
 */

const BlockType: z.ZodType<Block<any, any, any>[] | null> = z.any();
export const schema = z.object({
  blocks: BlockType,
});
export type state = z.infer<typeof schema>;

export const init: Partial<state> = {
  blocks: null,
};

export const name = 'Notes';
