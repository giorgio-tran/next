/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { Avatar, Box, Tooltip, AvatarGroup, GridItem, Grid } from '@chakra-ui/react';

import { usePresenceStore, useUser, useUsersStore, initials, useHexColor, useUIStore } from '@sage3/frontend';
import { useEffect, useState } from 'react';

type AvatarGroupProps = {
  boardId: string;
};

export function UserAvatarGroup(props: AvatarGroupProps) {
  // Get current user
  const { user } = useUser();
  // UI Stuff
  const setBoardPosition = useUIStore((state) => state.setBoardPosition);
  const setScale = useUIStore((state) => state.setScale);
  const scale = useUIStore((state) => state.scale);

  // Get all users
  const users = useUsersStore((state) => state.users);
  // Get presences of users
  let presences = usePresenceStore((state) => state.presences);
  // Filter out the users who are not present on the board and is not the current user
  presences = presences.filter((el) => el.data.boardId === props.boardId && el._id !== user?._id);

  // Combine users and presences
  const userPresence = presences.map((el) => {
    const user = users.find((user) => user._id === el._id);
    if (user) {
      return {
        presence: el,
        user: user,
      };
    } else {
      return null;
    }
  });

  // Sort walls to top
  userPresence.sort((a, b) => {
    const aType = a?.user.data.userType === 'wall' ? 0 : 1;
    const bType = b?.user.data.userType === 'wall' ? 0 : 1;
    return aType - bType;
  })

  function handleAvatarClick(user: typeof userPresence[0]) {
    if (user) {
      const type = user.user.data.userType;
      if (type === 'client') {
        const cx = -user.presence.data.cursor.x;
        const cy = -user.presence.data.cursor.y;
        const wx = window.innerWidth / scale / 2;
        const wy = window.innerHeight / scale / 2;

        setBoardPosition({ x: cx + wx, y: cy + wy });
      } else if (type == 'wall') {
        const vx = -user.presence.data.viewport.position.x;
        const vy = -user.presence.data.viewport.position.y;
        const vw = -user.presence.data.viewport.size.width;
        const vh = -user.presence.data.viewport.size.height;
        const vcx = vx + vw / 2;
        const vcy = vy + vh / 2;

        const ww = window.innerWidth;
        const wh = window.innerHeight;

        const s = Math.min(ww / -vw, wh / -vh);
        const cx = vcx + ww / s / 2;
        const cy = vcy + wh / s / 2;

        setScale(s);
        setBoardPosition({ x: cx, y: cy });
      }
    }
  }

  return (
    <Grid templateColumns="repeat(10, 0fr)" gap={2}>
      {userPresence.map((el) => {
        if (el == null) return;
        const color = useHexColor(el.user.data.color);
        const isWall = el.user.data.userType === 'wall';
        return (
          <GridItem w="100%" h="10" key={'userpanel-' + el.user._id}>
            <Tooltip
              key={el.presence.data.userId}
              aria-label="username"
              hasArrow={true}
              placement="top"
              label={el.user.data.name}
              shouldWrapChildren={true}
            >
              <Avatar
                name={el.user.data.name}
                getInitials={initials}
                backgroundColor={color || 'orange'}
                size="sm"
                color="white"
                showBorder={true}
                borderRadius={isWall ? '0%' : '100%'}
                borderWidth={'1px'}
                borderColor="whiteAlpha.600"
                onClick={() => handleAvatarClick(el)}
                cursor="pointer"
              />
            </Tooltip>
          </GridItem>
        );
      })}
    </Grid>
  );
}
