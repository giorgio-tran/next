/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { useState, useEffect } from 'react';

import {
  Box, Text, Tooltip, Flex, IconButton, VStack, HStack,
  Icon, useColorModeValue, Button, ButtonGroup, Checkbox, Input, Modal, ModalBody,
  ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spacer, useDisclosure,
} from '@chakra-ui/react';
import { MdRestartAlt, MdCode, MdDelete, MdLock, MdLockOpen } from 'react-icons/md';

import { Panel } from '../Panel';
import { useHexColor, useUser, useAppStore, useBoardStore, useUIStore, truncateWithEllipsis } from '@sage3/frontend';

import { z } from 'zod';

const Kschema = z.object({
  kernelSpecs: z.array(z.string()),
  availableKernels: z.array(
    z.object({
      key: z.string(),
      value: z.record(z.string(), z.any()),
    })
  ),
  executeInfo: z.object({
    executeFunc: z.string(),
    params: z.record(z.any()),
  }),
  lastHeartBeat: z.number(),
  online: z.boolean(),
});

type Kstate = z.infer<typeof Kschema>;

const initState: Kstate = {
  kernelSpecs: [],
  availableKernels: [],
  executeInfo: { executeFunc: '', params: {} },
  online: false,
  lastHeartBeat: 0,
};

/**
 * We check the status of the kernel every 15 seconds
 * and if it has been over 20 seconds, we show a warning
 */
const heartBeatTimeCheck = 20; // seconds

export interface KernelsProps {
  roomId: string;
  boardId: string;
}

export function KernelsPanel(props: KernelsProps) {
  // Board Store
  const updateBoard = useBoardStore((state) => state.update);
  const boards = useBoardStore((state) => state.boards);
  const board = boards.find((el) => el._id === props.boardId);
  const boardPosition = useUIStore((state) => state.boardPosition);
  const scale = useUIStore((state) => state.scale);
  // State
  const [s, update] = useState(initState);
  const createApp = useAppStore((state) => state.create);
  // User
  const { user } = useUser();
  const [myKernels, setMyKernels] = useState(s.availableKernels);

  // UI
  const red = useHexColor('red');
  const green = useHexColor('green');
  const headerBackground = useColorModeValue('gray.500', 'gray.900');
  const tableBackground = useColorModeValue('gray.50', 'gray.700');
  const tableDividerColor = useColorModeValue('gray.200', 'gray.600');
  const scrollColor = useHexColor(tableDividerColor);
  const scrollColorFix = useHexColor(tableBackground);
  const teal = useHexColor('teal');

  // Modal window to create a new kernel
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Checkbox private selection
  const [isPrivate, setIsPrivate] = useState(false);
  const [kernelAlias, setKernelAlias] = useState<string>('');
  const [kernelName, setKernelName] = useState<string>('python3');

  useEffect(() => {
    if (!board) return;
    const data = board.data;

    // @ts-ignore
    if (data.online && !s.online) {
      update((prev) => ({ ...prev, online: true }));
    }
    // @ts-ignore
    if (data.kernelSpecs && data.kernelSpecs.length > 0) {
      // @ts-ignore
      update((prev) => ({ ...prev, kernelSpecs: data.kernelSpecs }));
    }
    // @ts-ignore
    if (data.lastHeartBeat) {
      // @ts-ignore
      update((prev) => ({ ...prev, lastHeartBeat: data.lastHeartBeat }));
    }
    // @ts-ignore
    if (data.availableKernels && Array.isArray(data.availableKernels)) {
      // @ts-ignore
      update((prev) => ({ ...prev, availableKernels: data.availableKernels }));
      // @ts-ignore
      setMyKernels(data.availableKernels);
    }
  }, [board]);

  useEffect(() => {
    const checkHeartBeat = setInterval(async () => {
      const response = await fetch('/api/time');
      const time = await response.json();
      const delta = Math.round(Math.abs(time.epoch - s.lastHeartBeat) / 1000);

      if (delta > heartBeatTimeCheck && s.online) {
        update((prev) => ({ ...prev, online: false }));
      }
    }, 15000); // 15 Seconds
    return () => clearInterval(checkHeartBeat);
  }, [s.lastHeartBeat, s.online]);

  const refreshList = () => {
    updateBoard(props.boardId, {
      executeInfo: {
        executeFunc: 'get_available_kernels',
        params: { user_uuid: user?._id },
      },
    });
  };

  useEffect(() => {
    if (!user) return;
    refreshList();
  }, [user]);

  /**
   * Remove the kernel if the user confirms the action
   * @param kernelId the id of the kernel to remove
   *
   * @returns void
   */
  const removeKernel = (kernelId: string) => {
    if (!user || !kernelId) return;
    updateBoard(props.boardId, {
      executeInfo: {
        executeFunc: 'delete_kernel', params: {
          kernel_id: kernelId, user_uuid: user._id,
        },
      },
    });
  };

  /**
   * Restart the kernel
   * @param kernelId the id of the kernel to restart
   *
   * @returns void
   */
  const restartKernel = (kernelId: string) => {
    if (!user || !kernelId) return;
    updateBoard(props.boardId, {
      executeInfo: {
        executeFunc: 'restart_kernel', params: {
          kernel_id: kernelId, user_uuid: user._id
        }
      }
    });
  };

  /**
   * Open SageCell using the kernel
   * @param kernelId the id of the kernel to restart
   *
   * @returns void
   */
  const startSageCell = (kernelId: string, kernelAlias: string) => {
    if (!user) return;

    // Get around  the center of the board
    const xDrop = Math.floor(-boardPosition.x + window.innerWidth / scale / 2);
    const yDrop = Math.floor(-boardPosition.y + window.innerHeight / scale / 2);

    createApp({
      title: `${kernelAlias}`,
      roomId: props.roomId,
      boardId: props.boardId,
      position: { x: xDrop, y: yDrop, z: 0 },
      size: { width: 650, height: 400, depth: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      type: 'SageCell',
      state: {
        code: '',
        language: 'python',
        fontSize: 16,
        theme: 'xcode',
        kernel: kernelId,
        availableKernels: [],
        privateMessage: [],
        output: '',
        executeInfo: { executeFunc: '', params: {} },
      },
      raised: true,
    });
  };

  /**
   * Add a kernel to the list of kernels by sending a request to the backend
   * and updating the state. Defaults to python3 kernel. Expects a kernel alias
   * and a kernel name.
   *
   * @returns  void
   */
  const addKernel = () => {
    if (!user) return;
    updateBoard(props.boardId, {
      executeInfo: {
        executeFunc: 'add_kernel',
        params: {
          kernel_alias: kernelAlias,
          kernel_name: kernelName,
          room_uuid: props.roomId,
          board_uuid: props.boardId,
          owner_uuid: user._id,
          is_private: isPrivate,
        },
      },
    });
    if (isOpen) onClose();
    setKernelAlias('');
    setIsPrivate(false);
  };

  // Triggered on every keystroke
  function changeAlias(e: React.ChangeEvent<HTMLInputElement>) {
    const cleanAlias = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '');
    setKernelAlias(cleanAlias);
  }

  // Keyboard handler: press enter to activate command
  const onSubmit = (e: React.KeyboardEvent) => {
    // Keyboard instead of pressing the button
    if (e.key === 'Enter') {
      addKernel();
    }
  };

  return (
    <>
      <Panel title={'Kernels'} name="kernels" width={750} showClose={true}>
        <Box alignItems="center" pb="1" width="100%" display="flex">
          <VStack w={750} h={'100%'}>

            {/* Header */}
            <VStack
              w={'100%'}
              background={headerBackground}
              pt="1" pb="1"
              zIndex={1}
              overflow="hidden"
              borderRadius="8px 8px 0 0"
              borderBottom={`2px solid ${scrollColorFix}`}
            >
              <Flex w="100%" alignItems="center" justifyContent="center" userSelect={'none'}>
                <Box justifyContent="center" display="flex" flexGrow={0.6} flexBasis={0} color="white">
                  Private
                </Box>
                <Box justifyContent="left" display="flex" flexGrow={0.7} flexBasis={0} color="white">
                  Alias
                </Box>
                <Box justifyContent="left" display="flex" flexGrow={1.2} flexBasis={0} color="white">
                  Kernel Id
                </Box>
                <Box justifyContent="left" display="flex" flexGrow={0.7} flexBasis={0} color="white">
                  Type
                </Box>
                <Box justifyContent="left" display="flex" flexGrow={1} flexBasis={0} color="white">
                  Actions
                </Box>
              </Flex>
            </VStack>

            {/* Kernel List */}
            <VStack
              w={'100%'}
              background={tableBackground}
              m={0} p={0}
              overflowY={'auto'}
              maxHeight={150}
              css={{
                '&::-webkit-scrollbar': {
                  width: '12px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '8px',
                  background: 'transparent',
                  borderRadius: '5px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: scrollColor,
                  borderRadius: '8px',
                  borderRight: `solid ${scrollColorFix} 2px`,
                  borderLeft: `solid ${scrollColorFix} 2px`,
                },
              }}
            >
              {
                // If there are kernels, display them
                myKernels?.map((kernel, idx) => (
                  <Box key={kernel.key} w="100%" height="fit-content">

                    <Flex w="100%" fontFamily="mono" alignItems={"center"} userSelect={'none'} key={kernel.key + idx}>
                      {/* Status Icon */}
                      <Box justifyContent="center" display="flex" flexGrow={0.6} flexBasis={0}>
                        {kernel.value.is_private ? (
                          <Icon as={MdLock} fontSize="20px" color={'red.500'} />
                        ) : (
                          <Icon as={MdLockOpen} fontSize="20px" color="green.500" />
                        )}
                      </Box>
                      {/* Kernel alias */}
                      <Box justifyContent="left" display="flex" flexGrow={0.7} flexBasis={0}>
                        <Text onClick={() => {
                          navigator.clipboard.writeText(kernel.value.kernel_alias);
                        }}
                          fontSize="sm"
                        >
                          {kernel.value.kernel_alias}
                        </Text>
                      </Box>
                      {/* Kernel ID */}
                      <Box justifyContent="left" display="flex" flexGrow={1.2} flexBasis={0}>
                        <Text
                          onClick={() => {
                            navigator.clipboard.writeText(kernel.key);
                          }}
                          fontSize="sm"
                        >
                          <Tooltip label={kernel.key} placement="top" fontSize="xs" hasArrow>
                            {truncateWithEllipsis(kernel.key, 15)}
                          </Tooltip>
                        </Text>
                      </Box>
                      {/* Kernel Type */}
                      <Box justifyContent="left" display="flex" flexGrow={0.7} flexBasis={0}>
                        <Text fontSize="sm">
                          {
                            // show R for ir, Python for python3, etc.}
                            kernel.value.kernel_name === 'ir'
                              ? 'R'
                              : kernel.value.kernel_name === 'python3'
                                ? 'Python'
                                : kernel.value.kernel_name === 'julia-1.8'
                                  ? 'Julia'
                                  : kernel.value.kernel_name
                          }
                        </Text>
                      </Box>
                      {/* Actions */}
                      <Box justifyContent="left" display="flex" flexGrow={1} flexBasis={0}>
                        <Flex alignItems="right">
                          <Tooltip label={'Open a SageCell'} placement="top" fontSize="md" hasArrow>
                            <IconButton
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                startSageCell(kernel.key, kernel.value.kernel_alias);
                              }}
                              aria-label="Open a SageCell"
                              icon={<MdCode color={teal} size="22px" />}
                            />
                          </Tooltip>
                          <Tooltip label={'Restart Kernel'} placement="top" fontSize="sm" hasArrow>
                            <IconButton
                              mx={5} // this provides spacing between the buttons
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                restartKernel(kernel.key);
                              }}
                              aria-label="Restart Kernel"
                              icon={<MdRestartAlt color={teal} size="20px" />}
                            />
                          </Tooltip>
                          <Tooltip label="Delete kernel" aria-label="Delete kernel" placement="top" fontSize="sm" hasArrow>
                            <IconButton
                              m={0}
                              variant="ghost"
                              size="sm"
                              aria-label="Delete Kernel"
                              onClick={() => {
                                removeKernel(kernel.key);
                              }}
                              icon={<MdDelete color={red} size="20px" />}
                            />
                          </Tooltip>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                ))
              }
            </VStack>

            <Tooltip label={s.online ? 'Python Online' : 'Python Offline'} aria-label="Proxy Status" placement="top" fontSize="md" hasArrow>
              <Box
                width="20px"
                height="20px"
                position="absolute"
                right="4"
                top="8"
                borderRadius="100%"
                zIndex={5}
                backgroundColor={s.online ? green : red}
              ></Box>
            </Tooltip>

            <HStack>
              <Button size="xs" colorScheme="teal" onClick={onOpen}>
                Create New Kernel
              </Button>

              <ButtonGroup isAttached size="xs" colorScheme="teal">
                <Tooltip placement="top" hasArrow={true} label={'Refresh List of Kernels'} openDelay={400}>
                  <Button size="xs" onClick={refreshList}>
                    Refresh Kernel List
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </HStack>

          </VStack>
        </Box>
      </Panel>

      <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Kernel</ModalHeader>
          <ModalBody>
            Type
            <Select
              size="md"
              value={kernelName}
              placeholder="Select Kernel Type"
              width="100%"
              onChange={(e) => {
                setKernelName(e.target.value);
              }}
              mt="1"
            >
              {s.online && s.kernelSpecs.length > 0 ? (
                s.kernelSpecs.map((kernel) => (
                  <option key={kernel} value={kernel}>
                    {kernel === 'ir' ? 'R' : kernel === 'python3' ? 'Python' : kernel === 'julia-1.8' ? 'Julia' : kernel}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No kernels available
                </option>
              )}
            </Select>
            <Spacer my="4" />
            Alias
            <Input
              placeholder="Enter kernel alias..."
              variant="outline"
              size="md"
              mt="1"
              value={kernelAlias}
              onChange={changeAlias}
              onPaste={(event) => {
                event.stopPropagation();
              }}
              onKeyDown={onSubmit}
            />
            <Spacer my="4" />
            Private
            <Checkbox
              checked={isPrivate}
              borderRadius={2}
              verticalAlign={'middle'}
              colorScheme="teal"
              p={0}
              ml={1}
              onChange={() => setIsPrivate(!isPrivate)}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr="2" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={addKernel}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
}