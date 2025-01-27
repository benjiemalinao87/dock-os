import React from "react";
import { Box, Text } from "@chakra-ui/react";
export const Automation: React.FC<{
  onClose: () => void;
}> = ({
  onClose
}) => {
  return <Box p={6}>
      <Text fontSize="2xl">Automation</Text>
    </Box>;
};