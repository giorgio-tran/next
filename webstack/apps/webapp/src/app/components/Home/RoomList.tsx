/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { ChangeEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';

import { Board, Room } from '@sage3/shared/types';
import { CreateRoomModal, RoomCard, useHexColor, usePresenceStore, useRoomStore } from '@sage3/frontend';
import { useUser, useAuth } from '@sage3/frontend';
import { MdAdd, MdSearch, MdSort } from 'react-icons/md';

type RoomListProps = {
  onRoomClick: (room: Room | undefined) => void;
  selectedRoom: Room | undefined;
  rooms: Room[];
  boards: Board[];

  onBackClick: () => void;
  onBoardClick: (board: Board) => void;
};

export function RoomList(props: RoomListProps) {
  // Me
  const { user } = useUser();
  const { auth } = useAuth();
  // Data stores
  const storeError = useRoomStore((state) => state.error);
  const clearError = useRoomStore((state) => state.clearError);
  const deleteRoom = useRoomStore((state) => state.delete);
  const presences = usePresenceStore((state) => state.presences);

  // UI elements
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const borderHex = useHexColor(borderColor);
  const backgroundColor = useColorModeValue('transparent', 'gray.900');

  const toast = useToast();
  const [filterBoards, setFilterBoards] = useState<Room[] | null>(null);
  const [search, setSearch] = useState('');

  const [newRoomModal, setNewRoomModal] = useState(false);
  const [sortBy, setSortBy] = useState<'Name' | 'Updated' | 'Created'>('Name');

  function sortByName(a: Room, b: Room) {
    return a.data.name.localeCompare(b.data.name);
  }

  function sortByUpdated(a: Room, b: Room) {
    return a._updatedAt > b._updatedAt ? -1 : 1;
  }

  function sortByCreated(a: Room, b: Room) {
    return a._createdAt > b._createdAt ? -1 : 1;
  }

  let sortFunction = sortByName;
  if (sortBy === 'Updated') sortFunction = sortByUpdated;
  if (sortBy === 'Created') sortFunction = sortByCreated;

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as any);
  };

  useEffect(() => {
    if (storeError) {
      // Display a message
      toast({ description: 'Error - ' + storeError, duration: 3000, isClosable: true });
      // Clear the error
      clearError();
    }
  }, [storeError]);

  // Filter boards with the search string
  function handleFilterBoards(event: any) {
    setSearch(event.target.value);
    const filBoards = props.rooms.filter((room) => room.data.name.toLowerCase().includes(event.target.value.toLowerCase()));
    setFilterBoards(filBoards);
    if (event.target.value === '') {
      setFilterBoards(null);
    }
  }

  return (
    <Box textAlign="center" display="flex" flexDir="column" height="100%" width="100%" maxWidth="1200">
      <Box
        textAlign="center"
        display="flex"
        flexDir="column"
        alignItems="center"
        width="100%"
        borderBottom="solid 1px"
        borderColor={borderColor}
        pb="2"
      >
        <Box whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" fontSize={'4xl'}>
          <Text>Rooms</Text>
        </Box>
        <Box display="flex" justifyContent={'space-between'} width="100%">
          <Box flexGrow={1} mr="4" display="flex" alignItems={'baseline'}>
            <Box>
              <Tooltip label="Create a New Room" placement="top" hasArrow={true} openDelay={400}>
                <Button borderRadius="md" fontSize="3xl" disabled={auth?.provider === 'guest'} onClick={() => setNewRoomModal(true)}>
                  <MdAdd />
                </Button>
              </Tooltip>
            </Box>
            <Box flexGrow={1} ml="4">
              <InputGroup>
                <Input
                  my="2"
                  value={search}
                  variant="outline"
                  onChange={handleFilterBoards}
                  placeholder="Search Rooms..."
                  _placeholder={{ opacity: 1 }}
                />
                <InputRightElement pointerEvents="none" transform={`translateY(8px)`} fontSize="1.4em" children={<MdSearch />} />{' '}
              </InputGroup>
            </Box>
          </Box>
          <Box>
            <InputGroup>
              <Select mt="2" onChange={handleSortChange} icon={<MdSort />}>
                <option value="Name"> Name</option>
                <option value="Updated">Updated</option>
                <option value="Created">Created</option>
              </Select>
            </InputGroup>
          </Box>
        </Box>
      </Box>

      <Box
        overflowY="scroll"
        overflowX="hidden"
        pr="2"
        mb="2"
        borderColor={borderColor}
        mt="6"
        height="100%"
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: borderHex,
            borderRadius: '8px',
          },
        }}
      >
        <SimpleGrid minChildWidth="100%" spacingY={8} height="100%">
          {(filterBoards ? filterBoards : props.rooms)
            // show only public rooms or mine
            .filter((a) => a.data.isListed || a.data.ownerId === user?._id)
            .sort(sortFunction)
            .map((room) => {
              return (
                <RoomCard
                  key={room._id}
                  room={room}
                  boards={props.boards.filter((board) => board.data.roomId === room._id)}
                  userCount={presences.filter((p) => p.data.roomId === room._id).length}
                  selected={props.selectedRoom ? room._id === props.selectedRoom._id : false}
                  onEnter={() => props.onRoomClick(room)}
                  onEdit={() => console.log('edit room')}
                  onDelete={() => deleteRoom(room._id)}
                  onBackClick={() => props.onRoomClick(undefined)}
                  onBoardClick={props.onBoardClick}
                ></RoomCard>
              );
            })}
        </SimpleGrid>
      </Box>

      <CreateRoomModal isOpen={newRoomModal} onClose={() => setNewRoomModal(false)}></CreateRoomModal>
    </Box>
  );
}
