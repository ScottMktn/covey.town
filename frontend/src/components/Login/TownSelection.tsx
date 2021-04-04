import React, { useCallback, useEffect, useState } from 'react';
import assert from "assert";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';
import { CoveyTownInfo, TownJoinResponse, } from '../../classes/TownsServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface TownSelectionProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>
}

enum RelationshipStatus {
  Single = "single",
  Taken = "taken",
}

interface User {
  userID: string,
  username: string,
  password: string,
  isPublic: boolean,
  email?: string,
  bio?: string,
  hobbies?: string,
  firstName?: string,
  lastName?: string,
  dob?: string,
  relationshipStatus?: RelationshipStatus
}

export default function TownSelection({ doLogin }: TownSelectionProps): JSX.Element {
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<CoveyTownInfo[]>();
  const { connect } = useVideoContext();
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  // registration fields
  const [userName, setUserName] = useState<string>(Video.instance()?.userName || '');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  const [hobbies, setHobbies] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>(RelationshipStatus.Single);

  // login fields
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const updateTownListings = useCallback(() => {
    // console.log(apiClient);
    apiClient.listTowns()
      .then((towns) => {
        setCurrentPublicTowns(towns.towns
          .sort((a, b) => b.currentOccupancy - a.currentOccupancy)
        );
      })
  }, [setCurrentPublicTowns, apiClient]);
  useEffect(() => {
    updateTownListings();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer)
    };
  }, [updateTownListings]);

  const handleJoin = useCallback(async (coveyRoomID: string) => {
    try {
      if (!userName || userName.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please select a username',
          status: 'error',
        });
        return;
      }
      if (!coveyRoomID || coveyRoomID.length === 0) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        });
        return;
      }
      const initData = await Video.setup(userName, coveyRoomID);

      const loggedIn = await doLogin(initData);
      if (loggedIn) {
        assert(initData.providerVideoToken);
        await connect(initData.providerVideoToken);
      }
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  }, [doLogin, userName, connect, toast]);

  const handleCreate = async () => {
    if (!userName || userName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username before creating a town',
        status: 'error',
      });
      return;
    }
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    try {
      const newTownInfo = await apiClient.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic
      });
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage =
          <p>This town will NOT be publicly listed. To re-enter it, you will need to use this
            ID: {newTownInfo.coveyTownID}</p>;
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: <>{privateMessage}Please record these values in case you need to change the
          room:<br />Town ID: {newTownInfo.coveyTownID}<br />Town Editing
          Password: {newTownInfo.coveyTownPassword}</>,
        status: 'success',
        isClosable: true,
        duration: null,
      })
      await handleJoin(newTownInfo.coveyTownID);
    } catch (err) {
      toast({
        title: 'Unable to connect to Towns Service',
        description: err.toString(),
        status: 'error'
      })
    }
  };

  return (
    <>
      <form>
        <Stack>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Register Or Login</Heading>
            <FormControl mt={2}>
              <Accordion allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Register
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <FormControl isRequired>
                      <FormLabel htmlFor="userName">Username</FormLabel>
                      <Input name="userName" placeholder="Username"
                        value={userName}
                        onChange={event => setUserName(event.target.value)}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <Input name="password" placeholder="Password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input name="email" placeholder="Email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="bio">Biography</FormLabel>
                      <Input name="bio" placeholder="Biography"
                        value={bio}
                        onChange={event => setBio(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="hobbies">Hobbies</FormLabel>
                      <Input name="hobbies" placeholder="Hobbies"
                        value={hobbies}
                        onChange={event => setHobbies(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <Input name="firstName" placeholder="First Name"
                        value={firstName}
                        onChange={event => setFirstName(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <Input name="lastName" placeholder="Last Name"
                        value={lastName}
                        onChange={event => setLastName(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="dob">Date Of Birth</FormLabel>
                      <Input name="dob" placeholder="MM/DD/YYYY"
                        value={dob}
                        onChange={event => setDob(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="relationshipStatus">Relationship Status</FormLabel>
                      <Input name="relationshipStatus" placeholder="Change This"
                        value={relationshipStatus}
                        onChange={event => setRelationshipStatus(RelationshipStatus.Single)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="isPublic">Made Information Public?</FormLabel>
                      <Input name="isPublic" placeholder="No"
                        value="no"
                        onChange={event => setIsPublic(false)}
                      />
                    </FormControl>
                    <Button mt={2} data-testid="registerUser" onClick={() => console.log("Register")}>Register</Button>
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Login
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input name="email" placeholder="Email Address"
                        value={loginEmail}
                        onChange={event => setLoginEmail(event.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <Input name="password" placeholder="Password"
                        value={loginPassword}
                        onChange={event => setLoginPassword(event.target.value)}
                      />
                    </FormControl>
                    <Button mt={2} data-testid="loginUser" onClick={() => console.log("Login")}>Login</Button>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </FormControl>
          </Box>
          <Box p="4" borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="lg">Your User Profile</Heading>
            <FormControl>
              <Input autoFocus name="name" placeholder="Your name"
                value={userName}
                disabled
              />
              <Input autoFocus name="name" placeholder="Your name"
                value={password}
                disabled
              />
              <Input autoFocus name="name" placeholder="Your name"
                value={email}
                disabled
              />
            </FormControl>
          </Box>
          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Create a New Town</Heading>
            <Flex p="4">
              <Box flex="1">
                <FormControl>
                  <FormLabel htmlFor="townName">New Town Name</FormLabel>
                  <Input name="townName" placeholder="New Town Name"
                    value={newTownName}
                    onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box><Box>
                <FormControl>
                  <FormLabel htmlFor="isPublic">Publicly Listed</FormLabel>
                  <Checkbox id="isPublic" name="isPublic" isChecked={newTownIsPublic}
                    onChange={(e) => {
                      setNewTownIsPublic(e.target.checked)
                    }} />
                </FormControl>
              </Box>
              <Box>
                <Button data-testid="newTownButton" onClick={handleCreate}>Create</Button>
              </Box>
            </Flex>
          </Box>
          <Heading p="4" as="h2" size="lg">-or-</Heading>

          <Box borderWidth="1px" borderRadius="lg">
            <Heading p="4" as="h2" size="lg">Join an Existing Town</Heading>
            <Box borderWidth="1px" borderRadius="lg">
              <Flex p="4"><FormControl>
                <FormLabel htmlFor="townIDToJoin">Town ID</FormLabel>
                <Input name="townIDToJoin" placeholder="ID of town to join, or select from list"
                  value={townIDToJoin}
                  onChange={event => setTownIDToJoin(event.target.value)} />
              </FormControl>
                <Button data-testid='joinTownByIDButton'
                  onClick={() => handleJoin(townIDToJoin)}>Connect</Button>
              </Flex>

            </Box>

            <Heading p="4" as="h4" size="md">Select a public town to join</Heading>
            <Box maxH="500px" overflowY="scroll">
              <Table>
                <TableCaption placement="bottom">Publicly Listed Towns</TableCaption>
                <Thead><Tr><Th>Room Name</Th><Th>Room ID</Th><Th>Activity</Th></Tr></Thead>
                <Tbody>
                  {currentPublicTowns?.map((town) => (
                    <Tr key={town.coveyTownID}><Td role='cell'>{town.friendlyName}</Td><Td
                      role='cell'>{town.coveyTownID}</Td>
                      <Td role='cell'>{town.currentOccupancy}/{town.maximumOccupancy}
                        <Button onClick={() => handleJoin(town.coveyTownID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy}>Connect</Button></Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
