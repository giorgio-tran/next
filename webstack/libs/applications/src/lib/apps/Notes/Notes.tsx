/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { useAppStore } from '@sage3/frontend';
import { Button } from '@chakra-ui/react';
import { App, AppGroup } from '../../schema';

import { state as AppState } from './index';
import { AppWindow } from '../../components';

import { BlockNoteView, useBlockNote } from '@blocknote/react';
import { BlockNoteEditor, Block } from '@blocknote/core';
import '@blocknote/react/style.css';
import { useState } from 'react';

// Styling
import './styling.css';
import React from 'react';

/* App component for Notes */

function AppComponent(props: App): JSX.Element {
  const s = props.data.state as AppState;

  const updateState = useAppStore((state) => state.updateState);

  const [blocks, setBlocks] = useState<Block<any, any, any>[] | null>(null);
  const editor: BlockNoteEditor = useBlockNote({
    initialContent: s.blocks ? JSON.parse(JSON.stringify(s.blocks)) : undefined,
    onEditorContentChange: (editor) => {
      updateState(props._id, { blocks: editor.topLevelBlocks });
      // setBlocks(editor.topLevelBlocks);
    },
  });

  return (
    <AppWindow app={props}>
      <div style={{ overflowY: 'auto' }}>
        {/* <h1> blocks : {s.blocks}</h1> */}
        <BlockNoteView editor={editor} theme={'dark'} />
        <pre>{JSON.stringify(s.blocks, null, 2)}</pre>
      </div>
    </AppWindow>
  );
}

/* App toolbar component for the app Notes */
function ToolbarComponent(props: App): JSX.Element {
  const s = props.data.state as AppState;
  const updateState = useAppStore((state) => state.updateState);

  return (
    <>
      <Button colorScheme="green">Action</Button>
    </>
  );
}

/**
 * Grouped App toolbar component, this component will display when a group of apps are selected
 * @returns JSX.Element | null
 */
const GroupedToolbarComponent = (props: { apps: AppGroup }) => {
  return null;
};

export default { AppComponent, ToolbarComponent, GroupedToolbarComponent };
