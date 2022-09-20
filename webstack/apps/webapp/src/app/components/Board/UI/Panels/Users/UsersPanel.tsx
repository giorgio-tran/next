/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { useEffect } from 'react';
import { Avatar, Box, Tooltip } from '@chakra-ui/react';

import { useUIStore, useUser, initials, StuckTypes } from '@sage3/frontend';
import { sageColorByName } from '@sage3/shared';
import { UserAvatarGroup } from '../../UserAvatarGroup';
import { Panel } from '../Panel';

export interface AvatarProps {
  boardId: string;
  roomId: string;
}

export function UsersPanel(props: AvatarProps) {
  const position = useUIStore((state) => state.avatarMenu.position);
  const setPosition = useUIStore((state) => state.avatarMenu.setPosition);
  const opened = useUIStore((state) => state.avatarMenu.opened);
  const setOpened = useUIStore((state) => state.avatarMenu.setOpened);
  const show = useUIStore((state) => state.avatarMenu.show);
  const setShow = useUIStore((state) => state.avatarMenu.setShow);
  const stuck = useUIStore((state) => state.avatarMenu.stuck);
  const setStuck = useUIStore((state) => state.avatarMenu.setStuck);

  const controllerPosition = useUIStore((state) => state.controller.position);
  // if a menu is currently closed, make it "jump" to the controller
  useEffect(() => {
    if (!show) {
      setPosition({ x: controllerPosition.x + 40, y: controllerPosition.y + 95 });
      setStuck(StuckTypes.Controller);
    }
  }, [show]);
  useEffect(() => {
    if (stuck == StuckTypes.Controller) {
      setPosition({ x: controllerPosition.x + 40, y: controllerPosition.y + 95 });
    }
  }, [controllerPosition]);

  // User information
  const { user } = useUser();

  return (
    <Panel
      title={'Users'}
      opened={opened}
      setOpened={setOpened}
      setPosition={setPosition}
      position={position}
      width={330}
      showClose={true}
      show={show}
      setShow={setShow}
      stuck={stuck}
      setStuck={setStuck}
    >
      <Box alignItems="center" p="1" width="100%" display="flex">
        {/* User Avatar */}
        <Tooltip aria-label="username" hasArrow={true} placement="top-start" label={'You'}>
          <Avatar
            size="sm"
            pointerEvents={'all'}
            name={user?.data.name}
            getInitials={initials}
            backgroundColor={user ? sageColorByName(user.data.color) : ''}
            color="white"
            border="2px solid white"
            mx={1}
          />
        </Tooltip>
        {/* Avatar Group */}
        <UserAvatarGroup boardId={props.boardId} />
      </Box>
    </Panel>
  );
}
