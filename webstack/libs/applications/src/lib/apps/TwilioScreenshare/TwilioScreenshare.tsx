/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

// Chakra and React imports
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Text,
  SimpleGrid,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Image,
  ButtonGroup,
} from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react';

import { App } from '../../schema';
import { state as AppState } from './index';
import { AppWindow } from '../../components';

// SAGE imports
import { useAppStore, useUser, useTwilioStore, useUsersStore, useHexColor } from '@sage3/frontend';
import { genId } from '@sage3/shared';

// Twilio Imports
import { LocalVideoTrack } from 'twilio-video';

type ElectronSource = {
  appIcon: null | string;
  display_id: string;
  id: string;
  name: string;
  thumbnail: string;
};
const screenShareTimeLimit = 60 * 60 * 1000; // 1 hour

/* App component for Twilio */
function AppComponent(props: App): JSX.Element {
  const s = props.data.state as AppState;

  // Current User
  const { user } = useUser();
  const yours = user?._id === props._createdBy;

  // Twilio Store
  const room = useTwilioStore((state) => state.room);
  const tracks = useTwilioStore((state) => state.tracks);
  const stopStreamId = useTwilioStore((state) => state.stopStreamId);

  // App Store
  const updateState = useAppStore((state) => state.updateState);
  const update = useAppStore((state) => state.update);
  const deleteApp = useAppStore((state) => state.delete);

  // Video and HTML Ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // UI
  const red = useHexColor('red');
  const teal = useHexColor('teal');

  // Electron media sources
  const [electronSources, setElectronSources] = useState<ElectronSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<ElectronSource | null>(null);

  // Modal window
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State of the current time
  const [serverTimeDifference, setServerTimeDifference] = useState(0);
  const [expirationTime, setExpirationTime] = useState<string>('Checking Time...');

  // The user that is sharing only sets the selTrack
  const [selTrack, setSelTrack] = useState<LocalVideoTrack | null>(null);

  useEffect(() => {
    // If the user changes the dimensions of the shared window, resize the app
    const updateDimensions = (track: any) => {
      if (track.dimensions.width && track.dimensions.height) {
        const aspect = track.dimensions.width / track.dimensions.height;
        let w = props.data.size.width;
        let h = props.data.size.height;
        aspect > 1 ? (h = w / aspect) : (w = h / aspect);
        updateState(props._id, { aspectRatio: aspect });
        update(props._id, { size: { width: w, height: h, depth: props.data.size.depth } });
      }
    };
    if (selTrack) {
      selTrack.addListener('dimensionsChanged', updateDimensions);
    }
    return () => {
      if (selTrack) {
        selTrack.removeListener('dimensionsChanged', updateDimensions);
      }
    };
  }, [selTrack, props.data.size.width, props.data.size.height]);

  // Get server time
  useEffect(() => {
    async function getServerTime() {
      const response = await fetch('/api/time');
      const time = await response.json();
      setServerTimeDifference(Date.now() - time.epoch);
    }
    getServerTime();
  }, []);

  // Update the time on an interval every 30secs
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() + serverTimeDifference;
      const createdAt = props._createdAt + serverTimeDifference;
      const timeLeft = screenShareTimeLimit - (now - createdAt);
      const minutes = Math.floor(timeLeft / 1000 / 60);
      setExpirationTime(minutes + 'm');
    }, 1000);
    return () => clearInterval(interval);
  }, [serverTimeDifference]);

  useEffect(() => {
    if (room && yours) {
      shareScreen();
    }
  }, [room]);

  const shareScreen = async () => {
    stopStream();
    if (room && videoRef.current) {
      // Load electron and the IPCRender
      if (isElectron()) {
        try {
          const electron = window.require('electron');
          const ipcRenderer = electron.ipcRenderer;
          // Get sources from the main process
          ipcRenderer.on('set-source', async (evt: any, sources: any) => {
            // Check all sources and list for screensharing
            const allSources = [] as ElectronSource[]; // Make separate object to pass into the state
            for (const source of sources) {
              allSources.push(source);
            }
            setElectronSources(allSources);
            onOpen();
          });
          ipcRenderer.send('request-sources');
        } catch (err) {
          deleteApp(props._id);
        }
      } else {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 } });

          videoRef.current.srcObject = stream;
          videoRef.current.play();
          const videoId = genId();
          const screenTrack = new LocalVideoTrack(stream.getTracks()[0], { name: videoId, logLevel: 'off' });

          room.localParticipant.publishTrack(screenTrack);
          await updateState(props._id, { videoId });
          setSelTrack(screenTrack);
        } catch (err) {
          deleteApp(props._id);
        }
      }
    }
  };

  const stopStream = () => {
    if (room) {
      const videoId = s.videoId;
      const track = Array.from(room.localParticipant.videoTracks.values()).find((el) => el.trackName === videoId);
      track?.unpublish();
      track?.track.stop();
      updateState(props._id, { videoId: '' });
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (stopStreamId === props._id) {
      stopStream();
      deleteApp(props._id);
    }
  }, [stopStreamId]);

  useEffect(() => {
    if (yours) return;
    tracks.forEach((track) => {
      if (track.name === s.videoId && videoRef.current) {
        track.attach(videoRef.current);
      }
    });
  }, [tracks, s.videoId]);

  useEffect(() => {
    stopStream();
    if (yours) update(props._id, { title: `${user.data.name}` });
    return () => {
      stopStream();
    };
  }, []);

  const handleCancel = () => {
    stopStream();
    onClose();
    deleteApp(props._id);
  };

  const selectElectronSource = (source: ElectronSource) => {
    setSelectedSource(source);
  };

  const electronShareHandle = async () => {
    if (selectedSource && room && videoRef.current) {
      selectedSource.id;
      const mediaDevices = navigator.mediaDevices as any;
      const stream = await mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
          },
        },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      const videoId = genId();
      const screenTrack = new LocalVideoTrack(stream.getTracks()[0], { name: videoId, logLevel: 'off' });
      room.localParticipant.publishTrack(screenTrack);
      await updateState(props._id, { videoId });
      setSelTrack(screenTrack);
      onClose();
    }
  };

  return (
    <AppWindow app={props} lockAspectRatio={s.aspectRatio}>
      <>
        <Box backgroundColor="black" width="100%" height="100%">
          <video ref={videoRef} className="video-container" width="100%" height="100%"></video>
        </Box>

        <Text position="absolute" left={0} bottom={0} m={1} size="sm" fontWeight={'bold'} color={red}>
          {expirationTime}
        </Text>

        <Modal isOpen={isOpen} onClose={onClose} size="xl" blockScrollOnMount={false} closeOnOverlayClick={false} closeOnEsc={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Select Screenshare Source</ModalHeader>
            <ModalBody maxHeight="60vh" overflowY="scroll">
              <Tabs isFitted>
                <TabList mb="1em">
                  <Tab>Screens</Tab>
                  <Tab>Windows</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <SimpleGrid columns={3} spacing={10}>
                      {electronSources
                        .filter((el) => el.display_id !== '')
                        .map((source, idx: number) => (
                          <Box
                            display="flex"
                            flexDir="column"
                            justifyItems="center"
                            borderRadius="md"
                            border={selectedSource && selectedSource.id === source.id ? 'solid teal 2px' : ''}
                            borderColor={teal}
                            height="100%"
                            width="100%"
                            p="1"
                            key={idx}
                            onClick={() => selectElectronSource(source)}
                          >
                            <Box width="100%">
                              <Text overflow="hidden" fontSize="sm" width="100%" height="20px">
                                Screen: {source.display_id}
                              </Text>
                            </Box>
                            <img height="200px" width="200px" src={source.thumbnail} alt="" />
                          </Box>
                        ))}
                    </SimpleGrid>
                  </TabPanel>
                  <TabPanel>
                    <SimpleGrid columns={3} spacing={10}>
                      {electronSources
                        .filter((el) => el.display_id === '')
                        .map((source, idx: number) => (
                          <Box
                            display="flex"
                            flexDir="column"
                            justifyItems="center"
                            borderRadius="md"
                            border={selectedSource && selectedSource.id === source.id ? 'solid teal 2px' : ''}
                            borderColor={teal}
                            height="100%"
                            width="100%"
                            p="1"
                            key={idx}
                            onClick={() => selectElectronSource(source)}
                          >
                            <Box width="100%">
                              <Text overflow="hidden" fontSize="sm" width="100%" height="20px">
                                {source.name}
                              </Text>
                            </Box>
                            <Image src={source.thumbnail} alt="" objectFit="contain" />
                          </Box>
                        ))}
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="red" mr="2" onClick={handleCancel}>
                Cancel
              </Button>
              <Button colorScheme="teal" disabled={!selectedSource} onClick={electronShareHandle}>
                Share
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    </AppWindow>
  );
}

/**
 * Check if browser is Electron based on the userAgent.
 * NOTE: this does a require check, UNLIKE web view app.
 *
 * @returns true or false.
 */
function isElectron() {
  const w = window as any; // eslint-disable-line
  return typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.includes('Electron') && w.require;
}

/* App toolbar component for the app Twilio */

function ToolbarComponent(props: App): JSX.Element {
  // Current User
  const { user } = useUser();
  const yours = user?._id === props._createdBy;

  // Twilio Store
  const stopStream = useTwilioStore((state) => state.setStopStream);
  return (
    <>
      <ButtonGroup>
        {yours ? (
          <Button onClick={() => stopStream(props._id)} colorScheme="red" size="xs">
            Stop Stream
          </Button>
        ) : null}
      </ButtonGroup>
    </>
  );
}

export default { AppComponent, ToolbarComponent };
