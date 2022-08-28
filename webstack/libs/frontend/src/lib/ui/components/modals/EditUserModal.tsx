/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  InputGroup, InputLeftElement, Input,
  useToast, Button, Text,
} from '@chakra-ui/react';
import { MdPerson } from 'react-icons/md';
import { UserSchema } from '@sage3/shared/types';
import { useAuth } from '@sage3/frontend';
import { useUser } from '../../../hooks';

interface EditUserModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function EditUserModal(props: EditUserModalProps): JSX.Element {
  const { user, update } = useUser();
  const { auth } = useAuth();

  const [name, setName] = useState<UserSchema['name']>(user?.data.name || '');
  const [email, setEmail] = useState<UserSchema['email']>(user?.data.email || '');

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)

  // the input element
  // When the modal panel opens, select the text for quick replacing
  const initialRef = React.useRef<HTMLInputElement>(null);
  // useEffect(() => {
  //   initialRef.current?.select();
  // }, [initialRef.current]);

  const setRef = useCallback((_node: HTMLInputElement) => {
    if (initialRef.current) {
      initialRef.current.select();
    }
  }, []);

  // Keyboard handler: press enter to activate command
  const onSubmit = (e: React.KeyboardEvent) => {
    // Keyboard instead of pressing the button
    if (e.key === 'Enter') {
      updateAccount();
    }
  };

  const updateAccount = () => {
    if (name !== user?.data.name && update) {
      update({ name });
    }
    if (email !== user?.data.email && update) {
      update({ email });
    }
    props.onClose();
  };

  return (
    <Modal isCentered isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User Account</ModalHeader>
        <ModalBody>
          <InputGroup mt={4}>
            <InputLeftElement pointerEvents="none" children={<MdPerson size={'1.5rem'} />} />
            <Input
              ref={initialRef}
              type="string"
              placeholder={user?.data.name}
              _placeholder={{ opacity: 1, color: 'gray.600' }}
              mr={4}
              value={name}
              onChange={handleNameChange}
              onKeyDown={onSubmit}
              isRequired={true}
            />
          </InputGroup>
          <InputGroup mt={4}>
            <InputLeftElement pointerEvents="none" children={<MdPerson size={'1.5rem'} />} />
            <Input
              type="email"
              placeholder={user?.data.email}
              _placeholder={{ opacity: 1, color: 'gray.600' }}
              mr={4}
              value={email}
              onChange={handleEmailChange}
              onKeyDown={onSubmit}
              isRequired={true}
            />
          </InputGroup>
          <Text mt={3} fontSize={"md"}>Authentication: <em>{auth?.provider}</em></Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" onClick={() => updateAccount()} disabled={!name || !email}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
