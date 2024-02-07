/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { useAppStore } from '@sage3/frontend';
import { Box, Button, Select, Textarea } from '@chakra-ui/react';
import { App, AppGroup } from '../../schema';

import { state as AppState } from './index';
import { AppWindow } from '../../components';

import { useState, useEffect, useRef } from 'react';

// Styling
import './styling.css';

/* App component for SAGELINK */

function AppComponent(props: App): JSX.Element {
  const s = props.data.state as AppState;
  const updateState = useAppStore((state) => state.updateState);
  const fetchboardApps = useAppStore((state) => state.fetchBoardApps);
  const updateStateBatch = useAppStore((state) => state.updateStateBatch);
  const originalData = useRef<any[]>([]);

  const [apps, setApps] = useState<App[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stateController, setStateController] = useState<any>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const getApps = async () => {
      const res = await fetchboardApps(props.data.boardId);
      console.log(res);
      setApps(res as App[]);
      const states = res?.map((app) => {
        return {
          id: app._id,
          state: app.data.state,
        };
      });
      console.log('states', states);
    };
    getApps();
  }, []);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log(e);
    const formData = new FormData(e.target as typeof e.target & HTMLFormElement);
    console.log('formdata', formData);
    console.log('submit');
  };

  const changeSelectedStates = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ps = [];
    for (const app of stateController) {
      originalData.current.push({ id: app._id, updates: {[`${app.stateKey}`]: app.stateValue }});
      console.log("originalData", originalData.current);
      ps.push({ id: app._id, updates: { [`${app.stateKey}`]: text } });
    }
    updateStateBatch(ps);
  };

  const restoreOriginalStates = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    updateStateBatch(originalData.current);
  }

  return (
    <AppWindow app={props}>
      <Box padding="3">
        <h1>SAGELINK</h1>
        {/* <form onSubmit={handleSubmit}>
          <div> Option 1 </div>
          <Select name="option1">
            {apps.map((app) => {
              return <option value={app._id}>{app.data.type}</option>;
            })}
          </Select>
          <div> Option 2 </div>
          <Select name="option2">
            {apps.map((app) => {
              return <option value={app._id}>{app.data.type}</option>;
            })}
          </Select>
          <div>
            <Button>+</Button>
          </div>
          <Button marginBottom="4" type="submit">
            Submit
          </Button>
        </form> */}
        <Box>All Items On board</Box>
        <Box display="flex" flexDirection="column" flexWrap="wrap">
          {apps.map((app) => {
            return (
              <Box key={app._id} border="1px solid" padding="2" marginY="2">
                <div>
                  {app._id} - {app.data.type}
                </div>
                <hr />
                <Box>
                  {Object.entries(app.data.state).map((state) => {
                    return (
                      <Button
                        onClick={() => {
                          console.log('stateController', stateController);
                          setStateController([...stateController, { _id: app._id, stateKey: state[0], stateValue: state[1] }]);
                        }}
                      >
                        {state[0]}: {JSON.stringify(state[1])}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
        <Box marginY="10">
          <Box>Selected Apps/States</Box>
          <Box>{JSON.stringify(stateController)}</Box>
        </Box>
        <form onSubmit={changeSelectedStates}>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit">Submit Changes</Button>
        </form>
          <Button onClick={restoreOriginalStates}>Reset to Original Values</Button>
      </Box>
    </AppWindow>
  );
}

/* App toolbar component for the app SAGELINK */
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
