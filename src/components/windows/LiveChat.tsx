import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Avatar,
  Flex,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Tooltip,
  SimpleGrid,
  Progress,
  IconButton,
  ChevronDown,
  ChevronUp,
  User,
  Tags,
  StickyNote,
  BarChart2,
  Target,
  UserPlus,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Ban,
  Phone,
  Mail,
  Wand2,
  Loader2,
  GripVertical,
  Search,
  Mic,
  Smile,
  ImageIcon,
  Paperclip,
  Calendar,
  FileText,
  Headphones,
  X,
  Send,
} from '@chakra-ui/react';
import {
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon,
  SortDesc as SortDescIcon,
  Mic as MicIcon,
  Smile as SmileIcon,
  Image as ImageIconIcon,
  Paperclip as PaperclipIcon,
  Calendar as CalendarIcon,
  FileText as FileTextIcon,
  Headphones as HeadphonesIcon,
  Send as SendIcon,
  X as XIcon,
  ChevronUp as ChevronUpIcon,
  User as UserIcon,
  Tags as TagsIcon,
  StickyNote as StickyNoteIcon,
  BarChart2 as BarChart2Icon,
  Target as TargetIcon,
  UserPlus as UserPlusIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  RefreshCw as RefreshCwIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Ban as BanIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Wand2 as Wand2Icon,
  Loader2 as Loader2Icon,
  GripVertical as GripVerticalIcon,
} from 'lucide-react';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isNew?: boolean;
  newCount?: number;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
  activeChats: number;
}

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status: string;
  from?: string;
  to?: string;
}

const API_URL = 'https://dock-os-production.up.railway.app';

export const LiveChat: React.FC<{
  onClose: () => void;
}> = ({
  onClose
}) => {
  const {
    colorMode
  } = useColorMode();
  const [selectedUser, setSelectedUser] = useState<string>("sarah");
  const [message, setMessage] = useState("");
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedView, setSelectedView] = useState<string>("profile");
  const [chatStatus, setChatStatus] = useState<string>("open");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = colorMode === "dark";
  const bgColor = isDark ? "gray.800" : "white";
  const textColor = isDark ? "white" : "gray.800";
  const borderColor = isDark ? "gray.700" : "gray.200";
  const selectedBg = isDark ? "gray.700" : "blue.50";
  const [contentView, setContentView] = useState<JSX.Element | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    product: "",
    leadSource: ""
  });
  const [agents] = useState<Agent[]>([{
    id: "allison",
    name: "Allison Parker",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    status: "available",
    activeChats: 2
  }, {
    id: "lyndel",
    name: "Lyndel Smith",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    status: "available",
    activeChats: 1
  }, {
    id: "guktork",
    name: "Guktork Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    status: "busy",
    activeChats: 3
  }]);
  const [assignedAgent, setAssignedAgent] = useState<Agent | null>(null);
  const users: ChatUser[] = [{
    id: "sarah",
    name: "Sarah Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    lastMessage: "Thanks for your help with the project!",
    time: "2m ago",
    isNew: true,
    newCount: 2
  }, {
    id: "michael",
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    lastMessage: "When can we schedule a meeting?",
    time: "15m ago"
  }, {
    id: "emily",
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    lastMessage: "The latest update looks great!",
    time: "1h ago"
  }];
  const toast = useToast();
  const triggers = {
    "/ai": "Transform to AI response",
    "/formal": "Make text more formal",
    "/friendly": "Make text more friendly",
    "/fix": "Fix grammar and spelling",
    "/expand": "Expand this message"
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both a message and phone number',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/messages`, {
        to: phoneNumber,
        content: newMessage,
      });

      setNewMessage('');
      toast({
        title: 'Success',
        description: 'Message sent successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return <Flex h="100%" bg={bgColor}>
      <Box w="280px" minW="280px" borderRight="1px" borderColor={borderColor} h="100%">
        <VStack h="100%" spacing={0}>
          <Box p={4} w="100%" borderBottom="1px" borderColor={borderColor} position="relative">
            <Box position="absolute" top={2} left={2} cursor="move" className="drag-handle" p={1} borderRadius="md" _hover={{
            bg: isDark ? "gray.700" : "gray.100"
          }}>
              <GripVerticalIcon size={16} color={isDark ? "gray.400" : "gray.500"} style={{
              cursor: "move"
            }} />
            </Box>
            <Flex justify="space-between" mb={4} pl={8}>
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon size={18} color={isDark ? "white" : "gray"} />
                </InputLeftElement>
                <Input placeholder="Search conversations" />
              </InputGroup>
              <IconButton aria-label="Add Contact" icon={<UserPlusIcon size={18} />} variant="ghost" size="sm" ml={2} onClick={() => setShowAddContact(true)} />
            </Flex>
            <HStack>
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline" minW="160px" bg={isDark ? "gray.700" : "white"} color={isDark ? "white" : "gray.800"} borderColor={isDark ? "gray.600" : "gray.200"} _hover={{
                bg: isDark ? "gray.600" : "gray.50"
              }}>
                  <HStack spacing={2}>
                    {assignedAgent ? <>
                        <Avatar size="xs" src={assignedAgent.avatar} name={assignedAgent.name} />
                        <Text fontSize="sm" noOfLines={1}>
                          {assignedAgent.name}
                        </Text>
                      </> : <Text fontSize="sm">All Conversations</Text>}
                  </HStack>
                </MenuButton>
                <MenuList bg={isDark ? "gray.700" : "white"} borderColor={isDark ? "gray.600" : "gray.200"}>
                  <MenuItem onClick={() => setAssignedAgent(null)} fontWeight={!assignedAgent ? "bold" : "normal"} bg={isDark ? "gray.700" : "white"} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.600" : "gray.100"
                }}>
                    All Conversations
                  </MenuItem>
                  <MenuItem onClick={() => setAssignedAgent(null)} icon={<UserPlusIcon size={14} />} bg={isDark ? "gray.700" : "white"} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.600" : "gray.100"
                }}>
                    Unassigned
                  </MenuItem>
                  <MenuItem onClick={() => setAssignedAgent(agents[0])} icon={<UserIcon size={14} />} bg={isDark ? "gray.700" : "white"} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.600" : "gray.100"
                }}>
                    Assigned to me
                  </MenuItem>
                  <Divider borderColor={isDark ? "gray.600" : "gray.200"} />
                  <MenuGroup title="Assigned to" color={isDark ? "gray.400" : "gray.500"}>
                    {agents.map(agent => <MenuItem key={agent.id} onClick={() => setAssignedAgent(agent)} isDisabled={agent.status === "offline"} bg={isDark ? "gray.700" : "white"} color={isDark ? "white" : "gray.800"} _hover={{
                    bg: isDark ? "gray.600" : "gray.100"
                  }} _disabled={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                    _hover: {
                      bg: isDark ? "gray.700" : "white"
                    }
                  }}>
                        <HStack spacing={2}>
                          <Avatar size="xs" src={agent.avatar} name={agent.name} />
                          <Text fontSize="sm">{agent.name}</Text>
                          <Badge size="sm" colorScheme={agent.status === "available" ? "green" : "orange"} ml="auto" bg={isDark ? `${agent.status === "available" ? "green" : "orange"}.600` : undefined}>
                            {agent.activeChats} chats
                          </Badge>
                        </HStack>
                      </MenuItem>)}
                  </MenuGroup>
                </MenuList>
              </Menu>
              <IconButton aria-label="Sort" icon={<SortDescIcon size={18} />} size="sm" variant="ghost" />
            </HStack>
          </Box>
          <Box overflowY="auto" w="100%" flex="1">
            <Box position="relative" flex={1} overflow="hidden">
              <Box position="absolute" top={0} left={0} right={0} bottom={0} overflowY="auto" css={{
              "&::-webkit-scrollbar": {
                width: "4px"
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.05)"
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                borderRadius: "2px",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
                }
              }
            }}>
                {users.map(user => <Box key={user.id} p={4} cursor="pointer" bg={selectedUser === user.id ? selectedBg : "transparent"} _hover={{
                bg: selectedUser === user.id ? selectedBg : isDark ? "gray.700" : "gray.50"
              }} onClick={() => setSelectedUser(user.id)} borderBottom="1px" borderColor={borderColor} transition="background-color 0.2s">
                    <HStack spacing={3}>
                      <Avatar size="md" src={user.avatar} name={user.name} />
                      <Box flex={1}>
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontWeight="medium" color={textColor}>
                            {user.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {user.time}
                          </Text>
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {user.lastMessage}
                          </Text>
                          {user.isNew && <Badge colorScheme="blue" rounded="full">
                              {user.newCount} NEW
                            </Badge>}
                        </Flex>
                      </Box>
                    </HStack>
                  </Box>)}
              </Box>
            </Box>
          </Box>
        </VStack>
      </Box>
      <Flex flex={1} direction="column" minW="400px" h="100%">
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Text color={textColor}>
              {users.find(u => u.id === selectedUser)?.name}
            </Text>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" colorScheme={chatStatus === "open" ? "green" : chatStatus === "done" ? "blue" : chatStatus === "pending" ? "orange" : "gray"} leftIcon={chatStatus === "open" ? <CheckCircleIcon size={16} /> : chatStatus === "done" ? <RefreshCwIcon size={16} /> : chatStatus === "pending" ? <ClockIcon size={16} /> : <AlertCircleIcon size={16} />}>
                {chatStatus === "open" ? "Move to Done" : chatStatus === "done" ? "Reopen" : chatStatus === "pending" ? "Move to Done" : "Change Status"}
              </MenuButton>
              <MenuList bg={isDark ? "gray.800" : "white"}>
                {chatStatus === "open" && <>
                    <MenuItem icon={<ClockIcon size={16} />} onClick={() => setChatStatus("pending")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Move to Pending
                    </MenuItem>
                    <MenuItem icon={<CheckCircleIcon size={16} />} onClick={() => setChatStatus("done")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Move to Done
                    </MenuItem>
                    <MenuItem icon={<AlertTriangleIcon size={16} />} onClick={() => setChatStatus("invalid")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Mark as Invalid
                    </MenuItem>
                    <MenuItem icon={<BanIcon size={16} />} onClick={() => setChatStatus("spam")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Mark as Spam
                    </MenuItem>
                  </>}
                {chatStatus === "done" && <>
                    <MenuItem icon={<RefreshCwIcon size={16} />} onClick={() => setChatStatus("open")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Reopen
                    </MenuItem>
                    <MenuItem icon={<ClockIcon size={16} />} onClick={() => setChatStatus("pending")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Move to Pending
                    </MenuItem>
                    <MenuItem icon={<AlertTriangleIcon size={16} />} onClick={() => setChatStatus("invalid")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Mark as Invalid
                    </MenuItem>
                    <MenuItem icon={<BanIcon size={16} />} onClick={() => setChatStatus("spam")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Mark as Spam
                    </MenuItem>
                  </>}
                {chatStatus === "pending" && <>
                    <MenuItem icon={<CheckCircleIcon size={16} />} onClick={() => setChatStatus("done")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Move to Done
                    </MenuItem>
                    <MenuItem icon={<RefreshCwIcon size={16} />} onClick={() => setChatStatus("open")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Move to Open
                    </MenuItem>
                    <MenuItem icon={<AlertTriangleIcon size={16} />} onClick={() => setChatStatus("invalid")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Mark as Invalid
                    </MenuItem>
                    <MenuItem icon={<BanIcon size={16} />} onClick={() => setChatStatus("spam")} color={isDark ? "white" : "gray.800"} _hover={{
                  bg: isDark ? "gray.700" : "gray.100"
                }}>
                      Mark as Spam
                    </MenuItem>
                  </>}
              </MenuList>
            </Menu>
          </Flex>
        </Box>
        <Box flex={1} overflowY="auto" p={4}>
          <VStack spacing={4} align="stretch" w="100%" pb={4}>
            {messages.map((message) => (
              <HStack
                key={message.id}
                alignSelf={message.direction === 'outbound' ? 'flex-end' : 'flex-start'}
                bg={message.direction === 'outbound' ? 'blue.500' : 'gray.200'}
                color={message.direction === 'outbound' ? 'white' : 'black'}
                p={3}
                borderRadius="lg"
                maxW="80%"
              >
                <Avatar
                  size="sm"
                  name={message.direction === 'outbound' ? 'Me' : 'Them'}
                />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">{message.content}</Text>
                  <Text fontSize="xs" opacity={0.8}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </VStack>
              </HStack>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>
        <Box p={4} borderTop="1px" borderColor={borderColor}>
          <HStack spacing={4}>
            <Input
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              colorScheme="blue"
              onClick={handleSendMessage}
              isLoading={loading}
              leftIcon={<SendIcon size={20} />}
            >
              Send
            </Button>
          </HStack>
        </Box>
      </Flex>
      <Box w="280px" minW="280px" borderLeft="1px" borderColor={borderColor} h="100%">
        <VStack h="100%" spacing={0}>
          <Flex p={4} w="100%" justify="space-between" align="center" borderBottom="1px" borderColor={borderColor}>
            <HStack spacing={1}>
              <IconButton aria-label="Profile" icon={<UserIcon size={20} />} variant="ghost" size="sm" color={selectedView === "profile" ? "blue.500" : textColor} onClick={() => setSelectedView("profile")} />
              <Tooltip label="Labels" hasArrow>
                <IconButton aria-label="Labels" icon={<TagsIcon size={20} />} variant="ghost" size="sm" color={selectedView === "labels" ? "blue.500" : textColor} onClick={() => {
                setSelectedView("labels");
                setContentView(<VStack spacing={4} align="stretch" p={4}>
                        <Text fontSize="lg" fontWeight="medium" mb={2}>
                          Quick Labels
                        </Text>
                        <SimpleGrid columns={2} spacing={2}>
                          <Button size="sm" leftIcon={<TagsIcon size={14} />} variant="outline">
                            High Priority
                          </Button>
                          <Button size="sm" leftIcon={<ClockIcon size={14} />} variant="outline">
                            Follow Up
                          </Button>
                          <Button size="sm" leftIcon={<AlertCircleIcon size={14} />} variant="outline">
                            Urgent
                          </Button>
                          <Button size="sm" leftIcon={<CheckCircleIcon size={14} />} variant="outline">
                            Resolved
                          </Button>
                        </SimpleGrid>
                        <Divider />
                        <Text fontSize="sm" color="gray.500" mb={2}>
                          Recent Labels
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          <Badge colorScheme="blue" p={2}>
                            VIP Customer
                          </Badge>
                          <Badge colorScheme="green" p={2}>
                            Technical Issue
                          </Badge>
                          <Badge colorScheme="purple" p={2}>
                            Billing Question
                          </Badge>
                        </VStack>
                      </VStack>);
              }} />
              </Tooltip>
              <Tooltip label="Notes" hasArrow>
                <IconButton aria-label="Notes" icon={<StickyNoteIcon size={20} />} variant="ghost" size="sm" color={selectedView === "notes" ? "blue.500" : textColor} onClick={() => {
                setSelectedView("notes");
                setContentView(<VStack spacing={4} align="stretch" p={4}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="lg" fontWeight="medium">
                            Quick Notes
                          </Text>
                          <Button size="sm" colorScheme="blue">
                            New Note
                          </Button>
                        </HStack>
                        <Textarea placeholder="Type your note here..." rows={4} />
                        <Button size="sm" leftIcon={<FileTextIcon size={14} />}>
                          Save Note
                        </Button>
                        <Divider />
                        <Text fontSize="sm" color="gray.500">
                          Recent Notes
                        </Text>
                        <VStack align="stretch" spacing={3}>
                          {[{
                      text: "Customer requested demo",
                      date: "2 hours ago"
                    }, {
                      text: "Follow up on pricing",
                      date: "Yesterday"
                    }, {
                      text: "Scheduled meeting for next week",
                      date: "2 days ago"
                    }].map((note, i) => <Box key={i} p={3} borderWidth="1px" borderRadius="md">
                              <Text fontSize="sm">{note.text}</Text>
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                {note.date}
                              </Text>
                            </Box>)}
                        </VStack>
                      </VStack>);
              }} />
              </Tooltip>
              <Tooltip label="Active Campaign" hasArrow>
                <IconButton aria-label="Active Campaign" icon={<BarChart2Icon size={20} />} variant="ghost" size="sm" color={selectedView === "campaign" ? "blue.500" : textColor} onClick={() => {
                setSelectedView("campaign");
                setContentView(<VStack spacing={4} align="stretch" p={4}>
                        <Text fontSize="lg" fontWeight="medium" mb={2}>
                          Campaign Overview
                        </Text>
                        <SimpleGrid columns={2} spacing={4}>
                          <Box p={4} borderWidth="1px" borderRadius="md">
                            <Text fontSize="sm" color="gray.500">
                              Total Sent
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              1,234
                            </Text>
                          </Box>
                          <Box p={4} borderWidth="1px" borderRadius="md">
                            <Text fontSize="sm" color="gray.500">
                              Open Rate
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              67%
                            </Text>
                          </Box>
                        </SimpleGrid>
                        <Box>
                          <Text mb={2}>Campaign Progress</Text>
                          <Progress value={75} size="lg" colorScheme="blue" borderRadius="md" />
                        </Box>
                      </VStack>);
              }} />
              </Tooltip>
              <Tooltip label="Past Appointments" hasArrow>
                <IconButton aria-label="Past Appointments" icon={<CalendarIcon size={20} />} variant="ghost" size="sm" color={selectedView === "appointments" ? "blue.500" : textColor} onClick={() => {
                setSelectedView("appointments");
                setContentView(<VStack spacing={4} align="stretch" p={4}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="lg" fontWeight="medium">
                            Appointments
                          </Text>
                          <Button size="sm" colorScheme="blue">
                            Schedule New
                          </Button>
                        </HStack>
                        <VStack align="stretch" spacing={3}>
                          {[{
                      title: "Product Demo",
                      date: "Today, 2:00 PM",
                      status: "upcoming"
                    }, {
                      title: "Follow-up Call",
                      date: "Tomorrow, 10:00 AM",
                      status: "scheduled"
                    }, {
                      title: "Technical Review",
                      date: "Next Week",
                      status: "pending"
                    }].map((apt, i) => <Box key={i} p={3} borderWidth="1px" borderRadius="md">
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{apt.title}</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {apt.date}
                                  </Text>
                                </VStack>
                                <Badge colorScheme={apt.status === "upcoming" ? "green" : "blue"}>
                                  {apt.status}
                                </Badge>
                              </HStack>
                            </Box>)}
                        </VStack>
                      </VStack>);
              }} />
              </Tooltip>
              <Tooltip label="Opportunities" hasArrow>
                <IconButton aria-label="Opportunities" icon={<TargetIcon size={20} />} variant="ghost" size="sm" color={selectedView === "opportunities" ? "blue.500" : textColor} onClick={() => {
                setSelectedView("opportunities");
                setContentView(<VStack spacing={4} align="stretch" p={4}>
                        <Text fontSize="lg" fontWeight="medium" mb={2}>
                          Active Opportunities
                        </Text>
                        <SimpleGrid columns={2} spacing={4} mb={4}>
                          <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                            <Text fontSize="sm" color="gray.600">
                              Total Value
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              $45,000
                            </Text>
                          </Box>
                          <Box p={4} borderWidth="1px" borderRadius="md" bg="green.50">
                            <Text fontSize="sm" color="gray.600">
                              Win Rate
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              78%
                            </Text>
                          </Box>
                        </SimpleGrid>
                        <VStack align="stretch" spacing={3}>
                          <Box p={4} borderWidth="1px" borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="medium">Enterprise Deal</Text>
                              <Badge colorScheme="yellow">In Progress</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500" mb={2}>
                              Value: $30,000
                            </Text>
                            <Progress value={60} size="sm" colorScheme="yellow" />
                          </Box>
                          <Box p={4} borderWidth="1px" borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="medium">Team Plan</Text>
                              <Badge colorScheme="green">Won</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500" mb={2}>
                              Value: $15,000
                            </Text>
                            <Progress value={100} size="sm" colorScheme="green" />
                          </Box>
                        </VStack>
                      </VStack>);
              }} />
              </Tooltip>
            </HStack>
            <IconButton aria-label="Close details" icon={<XIcon size={20} />} variant="ghost" size="sm" onClick={onClose} />
          </Flex>
          <Box flex={1} overflowY="auto" w="100%" p={6}>
            <Box position="relative" flex={1} overflow="hidden">
              <Box position="absolute" top={0} left={0} right={0} bottom={0} overflowY="auto" px={6} py={4} css={{
              "&::-webkit-scrollbar": {
                width: "4px"
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: isDark ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.05)"
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                borderRadius: "2px",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
                }
              },
              scrollbarWidth: "thin",
              scrollbarColor: isDark ? "rgba(255, 255, 255, 0.1) rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.05)"
            }}>
                {selectedView === "profile" ? <VStack spacing={6} w="100%" pb={4}>
                    <VStack>
                      <Avatar size="xl" src={users[0].avatar} name={users[0].name} />
                      <Text fontSize="xl" fontWeight="medium" color={textColor}>
                        {users[0].name}
                      </Text>
                      <HStack>
                        <Badge>CUSTOMER</Badge>
                        <Badge colorScheme="green">OPEN</Badge>
                      </HStack>
                    </VStack>
                    <VStack align="stretch" w="100%" spacing={4}>
                      <Box>
                        <Text fontWeight="medium" mb={2} color={textColor}>
                          Contact Information
                        </Text>
                        <VStack align="stretch" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            Email: sarah.wilson@example.com
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Phone: +1 (555) 123-4567
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Location: San Francisco, CA
                          </Text>
                        </VStack>
                      </Box>
                    </VStack>
                  </VStack> : <Box pb={4}>
                    {selectedView === "labels" && <VStack spacing={4} align="stretch">
                        <Text fontWeight="medium" color={textColor}>
                          Labels
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="green" p={2} borderRadius="full">
                            VIP Customer
                          </Badge>
                          <Badge colorScheme="purple" p={2} borderRadius="full">
                            Enterprise
                          </Badge>
                          <Badge colorScheme="blue" p={2} borderRadius="full">
                            Priority
                          </Badge>
                          <Badge colorScheme="orange" p={2} borderRadius="full">
                            Follow-up
                          </Badge>
                        </HStack>
                      </VStack>}
                    {selectedView === "notes" && <VStack spacing={4} align="stretch">
                        <Text fontWeight="medium" color={textColor}>
                          Notes
                        </Text>
                        <Box p={3} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                          <Text fontSize="sm" color="gray.700">
                            Customer requested a follow-up demo next week.
                            Interested in enterprise features.
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            Added by John - 2 days ago
                          </Text>
                        </Box>
                        <Box p={3} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                          <Text fontSize="sm" color="gray.700">
                            Discussed pricing options. Will send proposal by
                            Friday.
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            Added by Sarah - 1 week ago
                          </Text>
                        </Box>
                      </VStack>}
                    {selectedView === "campaign" && <VStack spacing={4} align="stretch">
                        <Text fontWeight="medium" color={textColor}>
                          Active Campaigns
                        </Text>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium">
                            Q4 Enterprise Outreach
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Status: In Progress
                          </Text>
                          <Progress value={75} size="sm" colorScheme="blue" mt={2} />
                        </Box>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium">
                            Product Update Newsletter
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Status: Scheduled
                          </Text>
                          <Progress value={20} size="sm" colorScheme="blue" mt={2} />
                        </Box>
                      </VStack>}
                    {selectedView === "appointments" && <VStack spacing={4} align="stretch">
                        <Text fontWeight="medium" color={textColor}>
                          Past Appointments
                        </Text>
                        <Box p={3} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium">Product Demo</Text>
                          <Text fontSize="sm" color="gray.500">
                            August 15, 2023 - 2:00 PM
                          </Text>
                          <Badge colorScheme="green" mt={2}>
                            Completed
                          </Badge>
                        </Box>
                        <Box p={3} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium">Initial Consultation</Text>
                          <Text fontSize="sm" color="gray.500">
                            July 28, 2023 - 11:00 AM
                          </Text>
                          <Badge colorScheme="green" mt={2}>
                            Completed
                          </Badge>
                        </Box>
                      </VStack>}
                    {selectedView === "opportunities" && <VStack spacing={4} align="stretch">
                        <Text fontWeight="medium" color={textColor}>
                          Opportunities
                        </Text>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium">
                            Enterprise License Upgrade
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Value: $50,000
                          </Text>
                          <Badge colorScheme="yellow" mt={2}>
                            In Progress
                          </Badge>
                          <Progress value={60} size="sm" colorScheme="yellow" mt={2} />
                        </Box>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="medium">Additional Team Seats</Text>
                          <Text fontSize="sm" color="gray.500">
                            Value: $12,000
                          </Text>
                          <Badge colorScheme="green" mt={2}>
                            Won
                          </Badge>
                          <Progress value={100} size="sm" colorScheme="green" mt={2} />
                        </Box>
                      </VStack>}
                  </Box>}
              </Box>
            </Box>
          </Box>
        </VStack>
      </Box>
      <Modal isOpen={showAddContact} onClose={() => setShowAddContact(false)} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>Add New Contact</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input placeholder="Enter first name" value={newContact.firstName} onChange={e => setNewContact({
                ...newContact,
                firstName: e.target.value
              })} />
              </FormControl>
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input placeholder="Enter last name" value={newContact.lastName} onChange={e => setNewContact({
                ...newContact,
                lastName: e.target.value
              })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <PhoneIcon size={16} />
                  </InputLeftElement>
                  <Input placeholder="Enter phone number" value={newContact.phone} onChange={e => setNewContact({
                  ...newContact,
                  phone: e.target.value
                })} />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <MailIcon size={16} />
                  </InputLeftElement>
                  <Input type="email" placeholder="Enter email" value={newContact.email} onChange={e => setNewContact({
                  ...newContact,
                  email: e.target.value
                })} />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Product</FormLabel>
                <Select placeholder="Select product" value={newContact.product} onChange={e => setNewContact({
                ...newContact,
                product: e.target.value
              })}>
                  <option value="product1">Product 1</option>
                  <option value="product2">Product 2</option>
                  <option value="product3">Product 3</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Lead Source</FormLabel>
                <Select placeholder="Select lead source" value={newContact.leadSource} onChange={e => setNewContact({
                ...newContact,
                leadSource: e.target.value
              })}>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setShowAddContact(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" leftIcon={<UserPlusIcon size={16} />} onClick={() => {
            setShowAddContact(false);
            setNewContact({
              firstName: "",
              lastName: "",
              phone: "",
              email: "",
              product: "",
              leadSource: ""
            });
          }}>
              Add Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>;
};