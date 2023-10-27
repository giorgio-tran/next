/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { useColorModeValue, IconButton, Box, Text, useDisclosure } from '@chakra-ui/react';
import { EnterBoardModal, useHexColor, useUser } from '@sage3/frontend';
import { Board } from '@sage3/shared/types';
import { MdLock, MdStar, MdExitToApp, MdStarOutline, MdLockOpen } from 'react-icons/md';

export function BoardRow(props: { board: Board; selected: boolean; onClick: (board: Board) => void; usersPresent: number }) {
  const { user, saveBoard, removeBoard } = useUser();

  const borderColorValue = useColorModeValue(props.board.data.color, props.board.data.color);
  const borderColor = useHexColor(borderColorValue);
  const borderColorGray = useColorModeValue('gray.300', 'gray.700');
  const borderColorG = useHexColor(borderColorGray);

  const linearBGColor = useColorModeValue(
    `linear-gradient(178deg, #ffffff, #fbfbfb, #f3f3f3)`,
    `linear-gradient(178deg, #303030, #252525, #262626)`
  );

  const savedBoards = user?.data.savedBoards || [];
  const isFavorite = user && savedBoards.includes(props.board._id);
  const isPrivate = props.board.data.isPrivate;

  const handleFavorite = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const boardId = props.board._id;
    if (user && removeBoard && saveBoard) {
      savedBoards.includes(boardId) ? removeBoard(boardId) : saveBoard(boardId);
    }
  };

  // Disclosure
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Enter Board
  const handleEnterBoard = (ev: any) => {
    ev.stopPropagation();
    onOpen();
  };

  return (
    <Box
      background={linearBGColor}
      p="1"
      px="2"
      display="flex"
      justifyContent={'space-between'}
      alignItems={'center'}
      onClick={() => props.onClick(props.board)}
      borderRadius="md"
      boxSizing="border-box"
      border={`solid 1px ${props.selected ? borderColor : 'transpanent'}`}
      borderLeft={props.selected ? `${borderColor} solid 8px` : ''}
      _hover={{ cursor: 'pointer', border: `solid 1px ${borderColor}`, borderLeft: props.selected ? `${borderColor} solid 8px` : '' }}
      transition={'all 0.2s ease-in-out'}
    >
      <EnterBoardModal board={props.board} isOpen={isOpen} onClose={onClose} />
      <Box display="flex" flexDir="column" width="240px">
        <Box overflow="hidden" textOverflow={'ellipsis'} whiteSpace={'nowrap'} mr="2" fontSize="lg" fontWeight={'bold'}>
          {props.board.data.name}
        </Box>
        <Box overflow="hidden" textOverflow={'ellipsis'} whiteSpace={'nowrap'} mr="2" fontSize="xs">
          {props.board.data.description}
        </Box>
      </Box>
      <Box display="flex" gap="2px">
        <IconButton
          size="sm"
          variant={'ghost'}
          aria-label="enter-board"
          fontSize="xl"
          colorScheme="teal"
          icon={<Text>{props.usersPresent}</Text>}
        ></IconButton>

        <IconButton
          size="sm"
          variant={'ghost'}
          colorScheme="teal"
          aria-label="enter-board"
          fontSize="xl"
          icon={isPrivate ? <MdLock /> : <MdLockOpen />}
        ></IconButton>

        <IconButton
          size="sm"
          variant={'ghost'}
          colorScheme="teal"
          aria-label="enter-board"
          fontSize="xl"
          onClick={handleFavorite}
          icon={isFavorite ? <MdStar /> : <MdStarOutline />}
        ></IconButton>
        <IconButton
          size="sm"
          variant={'ghost'}
          colorScheme="teal"
          aria-label="enter-board"
          fontSize="xl"
          onClick={handleEnterBoard}
          icon={<MdExitToApp />}
        ></IconButton>
      </Box>
    </Box>
  );
}
