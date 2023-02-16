/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import React, {useState, useRef, useEffect} from 'react';
import {useParams} from 'react-router-dom';

// Date manipulation functions for file manager
import {format as formatDate, formatDistanceStrict} from 'date-fns';
import {AssetHTTPService} from '@sage3/frontend';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Box,
  Button,
  Flex,
  useEventListener,
  useDisclosure,
  Portal,
  useColorModeValue,
  useToast,
  Tooltip,
} from '@chakra-ui/react';

// Icons for file types
import {
  MdOutlinePictureAsPdf,
  MdOutlineImage,
  MdOutlineFilePresent,
  MdOndemandVideo,
  MdOutlineStickyNote2
} from 'react-icons/md';

import {
  humanFileSize,
  downloadFile,
  useUser,
  useAuth,
  useAppStore,
  useUIStore,
  useCursorBoardPosition
} from '@sage3/frontend';
import {getExtension} from '@sage3/shared';
import {FileEntry} from './types';
import {setupAppForFile} from './CreateApp';
import './menu.scss';
import {setupApp} from "../../../../background/components";

export type RowFileProps = {
  file: FileEntry;
  clickCB: (p: FileEntry, shift: boolean, modif: boolean) => void;
  dragCB: (e: React.DragEvent<HTMLDivElement>) => void;
};

/**
 * Component diplaying one file in a row
 * Can be selected with a click
 * Change background color on hover
 * @param p FileEntry
 * @returns
 */
export function RowFile({file, clickCB, dragCB}: RowFileProps) {
  // check if user is a guest
  const {user} = useUser();
  const {auth} = useAuth();

  const toast = useToast();
  // Store if the file is selected or not
  const [selected, setSelected] = useState(file.selected);
  const buttonRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [anchorPoint, setAnchorPoint] = useState({x: 0, y: 0});
  // Modal for delete
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure({id: 'delete'});
  // show the context menu
  const [showMenu, setShowMenu] = useState(false);
  const [dragImage, setDragImage] = useState<HTMLImageElement>();
  // How to create some applications
  const createApp = useAppStore((state) => state.create);
  // Room and board
  const {boardId, roomId} = useParams();
  if (!boardId || !roomId) return <></>;
  // UI Store
  const boardPosition = useUIStore((state) => state.boardPosition);
  const {position: cursorPosition} = useCursorBoardPosition();

  const scale = useUIStore((state) => state.scale);

  const setBg = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor
  }

  // Select the file when clicked
  const onSingleClick = (e: MouseEvent): void => {
    // @ts-expect-error
    const ismac = navigator.userAgentData.platform === 'macOS';
    const modifier = ismac ? e.metaKey : e.ctrlKey;
    clickCB(file, e.shiftKey, modifier);
    if (showMenu) setShowMenu(false);
  };

  useEffect(() => {
    setSelected(file.selected);
    // hide context menu
    setShowMenu(false);
  }, [file]);

  const explodeCells = () => {
    if (!user) return;
    const xDrop = Math.floor(-boardPosition.x + window.innerWidth / scale / 2);
    const yDrop = Math.floor(-boardPosition.y + window.innerHeight / scale / 2);
    // Look for the file in the asset store
    const localurl = '/api/assets/static/' + file.filename;
    // Get the content of the file
    fetch(localurl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (spec) {
        const cells = spec.cells;
        let y = yDrop;
        let columnCount = 0;
        const columnHeight = 5;
        let x = xDrop;
        const height = 400;
        const width = 500;
        const spacing = 40;
        const cellColor = setBg()
        cells.forEach((cell: any) => {
          if (cell.cell_type === 'code') {
            const sourceCode = (cell.source as []).join(' ');
            createApp(setupApp('', 'SageCell', x, y, roomId, boardId, {
              w: width,
              h: height
            }, {code: sourceCode, groupColor: cellColor}));
          }
          if (cell.cell_type === 'markdown') {
            createApp(
              setupApp('', 'Stickie', x, y, roomId, boardId, {
                w: width,
                h: height
              }, {text: `markdown ${cell.source}`})
            );
          }
          if (cell.cell_type === 'raw') {
            createApp(
              setupApp('', 'Stickie', x, y, roomId, boardId, {
                w: width,
                h: height
              }, {text: `markdown ${cell.source}`})
            );
          }
          if (cell.cell_type === 'display_data') {
            createApp(
              setupApp(
                '',
                'SageCell',
                x,
                y,
                roomId,
                boardId,
                {w: width, h: height},
                {output: JSON.stringify(cell.data)}
              )
            );
          }
          y = y + height + spacing;
          columnCount++;
          if (columnCount >= columnHeight) {
            columnCount = 0;
            x = x + width + spacing;
            y = yDrop;
          }
        });
      })
  }

  // Context menu selection handler
  const actionClick = async (e: React.MouseEvent<HTMLLIElement>) => {
    const id = e.currentTarget.id;
    if (id === 'down') {
      // download a file
      downloadFile('api/assets/static/' + file.filename, file.originalfilename);
    } else if (id === 'copy') {
      // Copy the file URL to the clipboard
      const publicUrl = window.location.origin + '/api/assets/static/' + file.filename;
      navigator.clipboard.writeText(publicUrl);
      // Notify the user
      toast({
        title: 'Success',
        description: `URL Copied to Clipboard`,
        duration: 3000,
        isClosable: true,
        status: 'success',
      });
    } else if (id === 'del') {
      if (auth?.provider !== 'guest') {
        // Delete a file
        onDeleteOpen();
      } else {
        toast({
          title: 'Guests cannot delete assets',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } else if (id === 'cells') {
      explodeCells()
    }
    // deselect file selection
    setSelected(false);
    // hide context menu
    setShowMenu(false);
  };

  useEffect(() => {
    const button = buttonRef.current;
    button?.addEventListener('click', onSingleClick);

    // Build the drag image for the file
    const img = new Image();
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2FkZDhlNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDBWMHoiLz48cGF0aCBkPSJNMTQgMkg2Yy0xLjEgMC0yIC45LTIgMnYxNmMwIDEuMS45IDIgMiAyaDEyYzEuMSAwIDItLjkgMi0yVjhsLTYtNnptNCAxOEg2VjRoOHY0aDR2MTJ6bS02LTNjLTEuMSAwLTItLjktMi0yVjkuNWMwLS4yOC4yMi0uNS41LS41cy41LjIyLjUuNVYxNWgyVjkuNWEyLjUgMi41IDAgMCAwLTUgMFYxNWMwIDIuMjEgMS43OSA0IDQgNHM0LTEuNzkgNC00di00aC0ydjRjMCAxLjEtLjkgMi0yIDJ6Ii8+PC9zdmc+';
    setDragImage(img);

    return () => {
      button?.removeEventListener('click', onSingleClick);
    };
  }, [divRef]);

  // Context menu handler (right click)
  useEventListener('contextmenu', (e) => {
    // deselect file selection
    setSelected(false);
    // hide context menu
    setShowMenu(false);
    if (divRef.current?.contains(e.target as any)) {
      // capture the cursor position to show the menu
      setAnchorPoint({x: e.pageX, y: e.pageY});
      // show context menu
      setShowMenu(true);
      setSelected(true);
    }
    e.preventDefault();
  });

  // pick an icon based on file type (extension string)
  const whichIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <MdOutlinePictureAsPdf style={{color: 'tomato'}} size={'20px'}/>;
      case 'jpeg':
        return <MdOutlineImage style={{color: 'lightblue'}} size={'20px'}/>;
      case 'mp4':
        return <MdOndemandVideo style={{color: 'lightgreen'}} size={'20px'}/>;
      case 'json':
        return <MdOutlineStickyNote2 style={{color: 'darkgray'}} size={'20px'}/>;
      default:
        return <MdOutlineFilePresent size={'20px'}/>;
    }
  };

  // Generate a human readable string from date
  const modif = formatDate(new Date(file.date), 'MM/dd/yyyy');
  // const added = formatDate(new Date(file.dateAdded), 'MM/dd/yyyy');
  const added = formatDistanceStrict(new Date(file.dateAdded), new Date(), {addSuffix: false});

  // Select the color when item is selected
  const highlight = selected ? 'teal.600' : 'inherit';
  const colorHover = useColorModeValue('gray.400', 'gray.600');
  const hover = selected ? highlight : colorHover;
  const bgColor = useColorModeValue('#EDF2F7', '#4A5568');
  const border = useColorModeValue('1px solid #4A5568', '1px solid #E2E8F0');
  const extension = getExtension(file.type);

  // Add an image to the cursor during the drag
  const dragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragImage) {
      e.dataTransfer.setDragImage(dragImage, cursorPosition.x, cursorPosition.y);
    }
    // call drag callback in the parent
    if (selected) dragCB(e);
    else e.preventDefault();
  };

  // Create an app for a file
  const onDoubleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!user) return;
    // Get around  the center of the board
    const xDrop = Math.floor(-boardPosition.x + window.innerWidth / scale / 2);
    const yDrop = Math.floor(-boardPosition.y + window.innerHeight / scale / 2);

    // Create the app
    const setup = await setupAppForFile(file, xDrop, yDrop, roomId, boardId, user);
    if (setup) createApp(setup);
  };

  return (
    <div ref={divRef}>
      <Flex
        bg={highlight}
        _hover={{background: hover}}
        ref={buttonRef}
        fontFamily="mono"
        alignItems="center"
        draggable={true}
        onDragStart={dragStart}
        onDoubleClick={onDoubleClick}
      >
        <Box w="30px">{whichIcon(extension)}</Box>
        <Tooltip hasArrow label={file.originalfilename} placement="top-start" openDelay={500}>
          <Box flex="1" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
            {file.originalfilename}
          </Box>
        </Tooltip>
        <Box w="100px" textAlign="right">
          {file.ownerName.substring(0, 12) || '-'}
        </Box>
        <Box w="80px" textAlign="right">
          {extension}
        </Box>
        <Box w="100px" textAlign="right">
          {modif}
        </Box>
        <Box w="100px" textAlign="right">
          {added}
        </Box>
        <Box w="90px" textAlign="right" pr={2}>
          {humanFileSize(file.size)}
        </Box>
      </Flex>
      {showMenu ? (
        <Portal>
          <ul
            className="s3contextmenu"
            style={{
              top: anchorPoint.y,
              left: anchorPoint.x,
              background: bgColor,
              border: border,
              fontSize: '0.75rem',
            }}
          >
            <li className="s3contextmenuitem" id={'copy'} onClick={actionClick}>
              Copy URL
            </li>
            <li className="s3contextmenuitem" id={'down'} onClick={actionClick}>
              Download
            </li>
            <li className="s3contextmenuitem" id={'del'} onClick={actionClick}>
              Delete
            </li>
            <li style={{display: extension === "ipynb" ? 'block' : 'none'}} className="s3contextmenuitem" id={'cells'}
                onClick={actionClick}>
              Open in SageCells
            </li>
          </ul>
        </Portal>
      ) : null}

      {/* Delete a file modal */}
      <Modal isCentered isOpen={isDeleteOpen} onClose={onDeleteClose} size={'2xl'} blockScrollOnMount={false}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Delete an Asset</ModalHeader>
          <ModalBody>Are you sure you want to delete "{file.originalfilename}" ?</ModalBody>
          <ModalFooter>
            <Button colorScheme="green" size="sm" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              onClick={() => {
                AssetHTTPService.del(file.id);
                onDeleteClose();
              }}
            >
              Yes, Delete it
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
