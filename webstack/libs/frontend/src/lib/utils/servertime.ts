/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { apiUrls } from '../config';

export async function serverTime(): Promise<{ epoch: number }> {
  const response = await fetch(apiUrls.misc.getTime);
  const time = await response.json();
  return time;
}
