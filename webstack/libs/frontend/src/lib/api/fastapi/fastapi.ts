/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { KernelInfo } from '@sage3/shared/types';

export const fastAPIRoute = '/api/fastapi';

/**
 * Get all the kernels
 * @returns An array of all the kernels
 */
async function fetchKernels(): Promise<KernelInfo[]> {
  const response = await fetch(`${fastAPIRoute}/collection`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const kernels = await response.json();
  return kernels;
}

/**
 * Get the kernel with the given id
 * @param kernelId a kernel id
 * @returns
 */
async function fetchKernel(kernelId: string): Promise<KernelInfo> {
  const response = await fetch(`${fastAPIRoute}/collection`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const kernels = await response.json();
  const kernel = kernels.find((kernel: KernelInfo) => kernel.kernel_id === kernelId);
  return kernel;
}

/**
 * Check if the SAGE FastAPI server is online
 * @returns true if the SAGE FastAPI server is online, false otherwise
 */
async function checkStatus(): Promise<boolean> {
  let online = true;
  try {
    const response = await fetch(`${fastAPIRoute}/heartbeat`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    online = response.ok;
  } catch (error) {
    if (error instanceof DOMException) {
      console.log('Aborted');
    }
    if (error instanceof Error) {
      console.log('Error');
    }
    if (error instanceof TypeError) {
      console.log('The SAGE Kernel server appears to be offline.');
    }
    return false;
  }
  return online;
}

/**
 * Create a new kernel with the given information
 * @param kernelInfo Information about the kernel to create
 * @returns
 */
async function createKernel(kernelInfo: KernelInfo): Promise<boolean> {
  try {
    const response = await fetch(`${fastAPIRoute}/kernels/${kernelInfo.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...kernelInfo }),
    });
    return response.ok;
  } catch (error) {
    if (error instanceof DOMException) {
      console.log('Aborted');
    }
    if (error instanceof Error) {
      console.log('Error');
    }
    if (error instanceof TypeError) {
      console.log('The SAGE Kernel server appears to be offline.');
    }
    return false;
  }
}

/**
 * Execute the given code on the kernel with the given id
 * @param code The code to execute
 * @param kernelId The id the kernel to execute the code on
 * @param userId the id of the user executing the code
 * @returns
 */
async function executeCode(code: string, kernelId: string, userId: string): Promise<{ ok: boolean; msg_id: string }> {
  const response = await fetch(`${fastAPIRoute}/execute/${kernelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      session: userId,
    }),
  });
  const ok = response.ok;
  if (!ok) {
    return { ok, msg_id: '' };
  } else {
    const data = await response.json();
    return { ok, msg_id: data.msg_id };
  }
}

/**
 * Interrupt the kernel with the given id
 * @param kernelId The id of the kernel to interrupt
 * @returns
 */
async function interruptKernel(kernelId: string): Promise<any> {
  const response = await fetch(`${fastAPIRoute}/interrupt/${kernelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return data;
}

export const FastAPI = { interruptKernel, executeCode, createKernel, fetchKernel, fetchKernels, checkStatus };
