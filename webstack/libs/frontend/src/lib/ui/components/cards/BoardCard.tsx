/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { Box, Button, Tooltip, Text, Icon, useDisclosure, useColorModeValue, useToast, IconButton, border } from '@chakra-ui/react';
import { MdPerson, MdLock, MdContentCopy, MdEdit, MdExitToApp, MdPreview, MdRemoveRedEye, MdSettings } from 'react-icons/md';

import { SBDocument } from '@sage3/sagebase';
import { sageColorByName } from '@sage3/shared';
import { BoardSchema } from '@sage3/shared/types';
import { EnterBoardModal } from '../modals/EnterBoardModal';
import { useUser } from '../../../hooks';
import { EditBoardModal } from '../modals/EditBoardModal';

export type BoardCardProps = {
  board: SBDocument<BoardSchema>;
  userCount: number;
  onSelect: () => void;
  onDelete: () => void;
  selected: boolean;
};

/**
 * Board card
 *
 * @export
 * @param {BoardCardProps} props
 * @returns
 */
export function BoardCard(props: BoardCardProps) {
  const { user } = useUser();

  // Is it my board?
  const yours = user?._id === props.board.data.ownerId;

  // Custom text
  const heading = yours ? 'Your' : 'This';

  // Custom color
  const borderColor = useColorModeValue('#718096', '#A0AEC0');
  const boardColor = sageColorByName(props.board.data.color);

  // Edit Modal Disclousure
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();

  // Enter Modal Disclosure
  const { isOpen: isOpenEnter, onOpen: onOpenEnter, onClose: onCloseEnter } = useDisclosure();

  // Copy the board id to the clipboard
  const toast = useToast();
  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(props.board._id);
    toast({
      title: 'Success',
      description: `BoardID Copied to Clipboard`,
      duration: 3000,
      isClosable: true,
      status: 'success',
    });
  };

  const handleEnterBoard = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEnter();
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEdit();
  };

  return (
    <>
      <EnterBoardModal
        id={props.board._id}
        roomId={props.board.data.roomId}
        name={props.board.data.name}
        isPrivate={props.board.data.isPrivate}
        privatePin={props.board.data.privatePin}
        isOpen={isOpenEnter}
        onClose={onCloseEnter}
      />
      <EditBoardModal board={props.board} isOpen={isOpenEdit} onClose={onCloseEdit} onOpen={onOpenEdit} />
      <Box
        borderWidth="2px"
        borderRadius="md"
        overflow="hidden"
        height="80px"
        my="2"
        pt="2"
        border={`solid ${props.selected ? boardColor : borderColor} 2px`}
        transition="transform .2s"
        style={{
          background: `linear-gradient(${props.selected ? boardColor : borderColor} 10%, transparent 10% ) no-repeat`,
        }}
        _hover={{
          transform: 'scale(1.05)',
        }}
        cursor="pointer"
        onClick={props.onSelect}
      >
        <Box px="2" display="flex" flexDirection="row" justifyContent="space-between" alignContent="center">
          <Box display="flex" flexDirection="column">
            <Text fontSize="2xl">{props.board.data.name}</Text>
            <Text fontSize="1xl">{props.board.data.description}</Text>
          </Box>

          <Box display="flex" mt="2" alignItems="center" flexShrink="3">
            <Tooltip label={`${heading} board is protected`} placement="top-start" hasArrow openDelay={200}>
              <div>{props.board.data.isPrivate ? <Icon aria-label="protected" as={MdLock} boxSize={8} color={boardColor} /> : null}</div>
            </Tooltip>

            <Tooltip label="Enter Board" openDelay={400} placement="top-start" hasArrow>
              <IconButton
                onClick={handleEnterBoard}
                color={props.selected ? boardColor : borderColor}
                aria-label="Preview Board"
                fontSize="3xl"
                variant="ghost"
                _hover={{ transform: 'scale(1.3)', opacity: 0.75 }}
                transition="transform .2s"
                icon={<MdExitToApp />}
              />
            </Tooltip>
            <Tooltip label="Copy Board ID into clipboard" openDelay={400} placement="top-start" hasArrow>
              <IconButton
                onClick={handleCopyId}
                color={props.selected ? boardColor : borderColor}
                aria-label="Board Copy ID"
                fontSize="3xl"
                variant="ghost"
                _hover={{ transform: 'scale(1.3)', opacity: 0.75 }}
                transition="transform .2s"
                icon={<MdContentCopy />}
              />
            </Tooltip>
            {yours ? (
              <Tooltip label="Edit Board" openDelay={400} placement="top-start" hasArrow>
                <IconButton
                  onClick={handleOpenSettings}
                  color={props.selected ? boardColor : borderColor}
                  aria-label="Board Edit"
                  fontSize="3xl"
                  variant="ghost"
                  _hover={{ transform: 'scale(1.3)', opacity: 0.75 }}
                  transition="transform .2s"
                  icon={<MdSettings />}
                />
              </Tooltip>
            ) : null}

            <Box width="50px" display="flex" alignItems="center" justifyContent="right">
              <Text fontSize="1xl" mx="2">
                {props.userCount}
              </Text>
              <MdPerson size="18" />
            </Box>
            <Box as="span" ml="2" color="gray.600" fontSize="sm"></Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
