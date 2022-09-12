/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { initialValues } from '@sage3/applications/initialValues';
import { AppName, AppState } from '@sage3/applications/schema';
import { AlfredComponent, processContentURL, useAppStore, useBoardStore, usePresenceStore, useUIStore, useUser } from '@sage3/frontend';
import { useCallback } from 'react';

type props = {
  boardId: string;
  roomId: string;
};

export function Alfred(props: props) {
  // Boards
  const boards = useBoardStore((state) => state.boards);
  const board = boards.find((el) => el._id === props.boardId);

  // UI
  const boardPosition = useUIStore((state) => state.boardPosition);
  const displayUI = useUIStore((state) => state.displayUI);
  const hideUI = useUIStore((state) => state.hideUI);

  // Apps
  const apps = useAppStore((state) => state.apps);
  const createApp = useAppStore((state) => state.create);
  const deleteApp = useAppStore((state) => state.delete);

  // User
  const { user } = useUser();
  const presences = usePresenceStore((state) => state.presences);

  // Function to create a new app
  const newApplication = (appName: AppName) => {
    if (!user) return;

    const x = Math.floor(boardPosition.x + window.innerWidth / 2 - 400 / 2);
    const y = Math.floor(boardPosition.y + window.innerHeight / 2 - 400 / 2);
    createApp({
      name: appName,
      description: appName + '>',
      roomId: props.roomId,
      boardId: props.boardId,
      position: { x, y, z: 0 },
      size: { width: 400, height: 400, depth: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      type: appName,
      state: { ...(initialValues[appName] as AppState) },
      ownerId: user._id || '',
      minimized: false,
      raised: true,
    });
  };

  // Alfred quick bar response
  const alfredAction = useCallback(
    (term: string) => {
      if (!user) return;

      // Get the position of the cursor
      const me = presences.find((el) => el.data.userId === user._id && el.data.boardId === props.boardId);
      const pos = me?.data.cursor || { x: 100, y: 100, z: 0 };
      const width = 400;
      const height = 400;
      pos.x -= width / 2;
      pos.y -= height / 2;
      // Decompose the search
      const terms = term.split(' ');

      if (terms[0] === 'app') {
        // app shortcuts
        const name = terms[1];
        if (name === 'Webview' || name === 'Screenshare' || name === 'Clock') {
          newApplication(name);
        }
      } else if (terms[0] === 'w' || terms[0] === 'web' || terms[0] === 'webview') {
        let loc = terms[1];
        if (!loc.startsWith('http://') && !loc.startsWith('https://')) {
          loc = 'https://' + loc;
        }
        createApp({
          name: 'Webview',
          description: 'Webview',
          roomId: props.roomId,
          boardId: props.boardId,
          position: pos,
          size: { width, height, depth: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          type: 'Webview',
          ownerId: user?._id,
          state: { webviewurl: processContentURL(loc) },
          minimized: false,
          raised: true,
        });
      } else if (terms[0] === 'g' || terms[0] === 'goo' || terms[0] === 'google') {
        const rest = terms.slice(1).join('+');
        const searchURL = 'https://www.google.com/search?q=' + rest;
        createApp({
          name: 'Webview',
          description: 'Webview',
          roomId: props.roomId,
          boardId: props.boardId,
          position: pos,
          size: { width, height, depth: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          type: 'Webview',
          ownerId: user?._id,
          state: { webviewurl: processContentURL(searchURL) },
          minimized: false,
          raised: true,
        });
      } else if (terms[0] === 's' || terms[0] === 'n' || terms[0] === 'stick' || terms[0] === 'stickie' || terms[0] === 'note') {
        const content = terms.slice(1).join(' ');
        createApp({
          name: 'Stickie',
          description: 'Stckie>',
          roomId: props.roomId,
          boardId: props.boardId,
          position: pos,
          size: { width, height, depth: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          type: 'Stickie',
          state: { ...(initialValues['Stickie'] as AppState), text: content },
          ownerId: user._id,
          minimized: false,
          raised: true,
        });
      } else if (terms[0] === 'c' || terms[0] === 'cell') {
        const content = terms.slice(1).join(' ');
        console.log('Create cell', content);
      } else if (terms[0] === 'showui') {
        // Show all the UI elements
        displayUI();
      } else if (terms[0] === 'hideui') {
        // Hide all the UI elements
        hideUI();
      } else if (terms[0] === 'clear' || terms[0] === 'clearall' || terms[0] === 'closeall') {
        apps.forEach((a) => deleteApp(a._id));
      }
    },
    [user, apps, props.boardId, presences]
  );

  return <AlfredComponent onAction={alfredAction} />;
}
