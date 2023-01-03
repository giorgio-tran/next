/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { Box } from '@chakra-ui/react';
import { useHexColor, usePresenceStore, useUIStore, useUser, useUsersStore } from '@sage3/frontend';
import { PresenceSchema } from '@sage3/shared/types';
import React from 'react';

type ViewportsProps = {
  boardId: string;
};

export function Viewports(props: ViewportsProps) {
  // Users and Presence Store
  const { user } = useUser();
  const users = useUsersStore((state) => state.users);

  // Presence Information
  const presences = usePresenceStore((state) => state.presences);

  // UI Scale
  const scale = useUIStore((state) => state.scale);

  // Render the Viewports
  return (
    <>
      {/* Draw the  viewports: filter by board and not myself */}
      {presences
        .filter((el) => el.data.boardId === props.boardId)
        .filter((el) => el.data.userId !== user?._id)
        .map((presence) => {
          const u = users.find((el) => el._id === presence.data.userId);
          if (!u) return null;
          const name = u.data.name;
          const color = u.data.color;
          const viewport = presence.data.viewport;
          const isWall = u.data.userType === 'wall';
          return <UserViewportMemo key={'viewport-' + u._id} isWall={isWall} name={name} color={color} viewport={viewport} scale={scale} />;
        })}
    </>
  );
}

type UserViewportProps = {
  name: string;
  color: string;
  viewport: PresenceSchema['viewport'];
  scale: number;
  isWall: boolean;
};

function UserViewport(props: UserViewportProps) {
  // If this is not a wall usertype, then we don't render the viewport
  if (!props.isWall) return null;
  const color = useHexColor(props.color);
  const titleBarHeight = 30;
  return (
    <Box
      borderStyle="solid"
      borderWidth={3 / props.scale}
      borderColor={color}
      borderTop={'none'}
      position="absolute"
      pointerEvents="none"
      left={props.viewport.position.x + 'px'}
      top={props.viewport.position.y - titleBarHeight + 'px'}
      width={props.viewport.size.width + 'px'}
      height={props.viewport.size.height + titleBarHeight + 'px'}
      opacity={0.5}
      borderRadius="8px 8px 8px 8px"
      transition="all 0.5s"
      color="white"
      fontSize="xl"
      pl="2"
      background={`linear-gradient(180deg, ${color} ${titleBarHeight}px, transparent ${titleBarHeight}px, transparent 100%)`}
    >
      Viewport for {props.name}
    </Box>
  );
}

const UserViewportMemo = React.memo(UserViewport);
