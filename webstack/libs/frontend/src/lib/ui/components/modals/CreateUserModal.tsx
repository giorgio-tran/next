/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import React, { useCallback, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
} from '@chakra-ui/react';
import { MdPerson } from 'react-icons/md';
import { UserSchema } from '@sage3/shared/types';
import { randomSAGEColor } from '@sage3/shared';
import { AuthHTTPService } from '../../../auth';

type CreateUserProps = {
  createUser: (user: UserSchema) => void;
}


export function CreateUserModal(props: CreateUserProps): JSX.Element {

  const [name, setName] = useState<UserSchema['name']>('');
  const [email, setEmail] = useState<UserSchema['email']>('');

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)

  // the input element
  // When the modal panel opens, select the text for quick replacing
  const initialRef = React.useRef<HTMLInputElement>(null);

  const setRef = useCallback((_node: HTMLInputElement) => {
    if (initialRef.current) {
      initialRef.current.select();
    }
  }, []);

  // Keyboard handler: press enter to activate command
  const onSubmit = (e: React.KeyboardEvent) => {
    // Keyboard instead of pressing the button
    if (e.key === 'Enter') {
      createAccount();
    }
  };

  function createAccount() {
    if (name && email) {
      const newUser = {
        name,
        email,
        color: randomSAGEColor().name,
        userRole: 'user',
        userType: 'client',
        profilePicture: ''
      } as UserSchema;
      props.createUser(newUser);
    }
  };

  return (
    <Modal isCentered isOpen={true} closeOnOverlayClick={false} onClose={() => { console.log('') }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create User Account</ModalHeader>
        <ModalBody>
          <InputGroup mt={4}>
            <InputLeftElement pointerEvents="none" children={<MdPerson size={'1.5rem'} />} />
            <Input
              ref={initialRef}
              type="string"
              placeholder="Name"
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
              placeholder="Email"
              mr={4}
              value={email}
              onChange={handleEmailChange}
              onKeyDown={onSubmit}
              isRequired={true}
            />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mx={2} onClick={AuthHTTPService.logout}>Cancel</Button>
          <Button colorScheme="green" onClick={() => createAccount()} disabled={!name || !email}>
            Create Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
