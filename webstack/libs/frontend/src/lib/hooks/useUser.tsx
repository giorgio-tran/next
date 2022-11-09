/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

/**
 * User Provider
 * @file User Provider
 * @author <a href="mailto:rtheriot@hawaii.edu">Ryan Theriot</a>
 * @version 1.0.0
 */

import { User, UserSchema } from '@sage3/shared/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { APIHttp, SocketAPI } from '../api';
import { useAuth } from './useAuth';

const UserContext = createContext({
  user: undefined as User | undefined,
  loading: true,
  update: null as ((updates: Partial<UserSchema>) => Promise<void>) | null,
  create: null as ((user: UserSchema) => Promise<void>) | null,
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider(props: React.PropsWithChildren<Record<string, unknown>>) {
  const { auth } = useAuth();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userSub: (() => void) | null = null;

    async function fetchUser() {
      if (!auth) return;
      // Unsubscribe from previous user

      // Check if user account exists
      const userResponse = await APIHttp.GET<UserSchema, User>(`/users/${auth.id}`);

      // If account exists, set the user context and subscribe to updates
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data[0]);
        // Unsubscribe if already subscribed
        if (userSub) userSub();
        // Subscribe to user updates
        const route = `/users/${auth.id}`;
        userSub = await SocketAPI.subscribe<UserSchema>(route, (message) => {
          const doc = message.doc as User;
          switch (message.type) {
            case 'CREATE': {
              setUser(doc);
              break;
            }
            case 'UPDATE': {
              setUser(doc);
              break;
            }
            case 'DELETE': {
              setUser(undefined);
            }
          }
        });
        setLoading(false);
      } else {
        setUser(undefined);
        setLoading(false);
      }
    }

    fetchUser();

    return () => {
      if (userSub) {
        userSub();
        userSub = null;
      }
    };
  }, [auth]);

  /**
   * Create a new user account
   * @param user User to create
   */
  const create = useCallback(
    async (user: UserSchema): Promise<void> => {
      if (auth) {
        const userResponse = await APIHttp.POST<UserSchema, User>('/users/create', user);
        if (userResponse.data) {
          setUser(userResponse.data[0]);
        }
      }
    },
    [auth]
  );

  /**
   * Update the current user
   * @param updates Updates to apply to the user
   * @returns
   */
  const update = useCallback(
    async (updates: Partial<UserSchema>): Promise<void> => {
      if (user) {
        await APIHttp.PUT<UserSchema>(`/users/${user._id}`, updates);
        return;
      }
      return;
    },
    [user]
  );

  return <UserContext.Provider value={{ user, loading, update, create }}>{props.children}</UserContext.Provider>;
}
