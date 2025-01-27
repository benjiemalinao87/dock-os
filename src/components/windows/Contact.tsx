import React from "react";
import { Box, Text } from "@chakra-ui/react";
export const Contact: React.FC<{
  onClose: () => void;
}> = ({
  onClose
}) => {
  return <Box p={6}>
      <Text fontSize="2xl">Contact</Text>
    </Box>;
};