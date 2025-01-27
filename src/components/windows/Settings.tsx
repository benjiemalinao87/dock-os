import React from "react";
import { Box, VStack, Text, Select, Button, useToast } from "@chakra-ui/react";
import { Music } from "lucide-react";
const backgrounds = {
  nature: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  ocean: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
  forest: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
  gradient: "linear-gradient(to right, #2193b0, #6dd5ed)"
};
export const Settings: React.FC<{
  onClose: () => void;
}> = ({
  onClose
}) => {
  const toast = useToast();
  const handleBackgroundChange = (value: string) => {
    document.body.style.backgroundImage = value === "gradient" ? backgrounds[value] : `url(${backgrounds[value]})`;
    toast({
      title: "Background updated",
      status: "success",
      duration: 2000
    });
  };
  return <Box p={6} color="gray.800">
      <Text fontSize="2xl" mb={6} fontWeight="bold">
        Settings
      </Text>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text mb={2} fontWeight="medium">
            Background Theme
          </Text>
          <Select placeholder="Select background" onChange={e => handleBackgroundChange(e.target.value)} bg="white">
            <option value="nature">Calm Nature</option>
            <option value="ocean">Ocean Waves</option>
            <option value="forest">Forest</option>
            <option value="gradient">Gradient</option>
          </Select>
        </Box>
        <Box>
          <Text mb={2} fontWeight="medium">
            Background Sound
          </Text>
          <Select placeholder="Select sound" bg="white">
            <option value="rain">Rain Sounds</option>
            <option value="waves">Ocean Waves</option>
            <option value="forest">Forest Ambience</option>
            <option value="lofi">Lo-Fi Beats</option>
          </Select>
        </Box>
        <Button leftIcon={<Music size={20} />} variant="solid" colorScheme="blue" onClick={() => {
        toast({
          title: "Coming Soon",
          description: "Background music feature will be available soon!",
          status: "info",
          duration: 2000
        });
      }}>
          Play Background Music
        </Button>
      </VStack>
    </Box>;
};