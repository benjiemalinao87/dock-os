import React, { useEffect, useState } from "react";
import { Box, Button, Text, VStack, HStack, Progress } from "@chakra-ui/react";
import { Play, Pause, RotateCcw } from "lucide-react";
export const Tools: React.FC<{
  onClose: () => void;
}> = ({
  onClose
}) => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsBreak(!isBreak);
      setTime(isBreak ? 25 * 60 : 5 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, time, isBreak]);
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTime(25 * 60);
    setIsBreak(false);
  };
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return <Box p={6} color="gray.800">
      <Text fontSize="2xl" mb={6} fontWeight="bold">
        Pomodoro Timer
      </Text>
      <VStack spacing={6}>
        <Text fontSize="6xl" fontWeight="bold">
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </Text>
        <Progress value={time / (isBreak ? 5 * 60 : 25 * 60) * 100} w="100%" borderRadius="full" size="sm" colorScheme="blue" />
        <HStack spacing={4}>
          <Button leftIcon={isActive ? <Pause size={20} /> : <Play size={20} />} onClick={toggleTimer} colorScheme="blue">
            {isActive ? "Pause" : "Start"}
          </Button>
          <Button leftIcon={<RotateCcw size={20} />} onClick={resetTimer} variant="outline" colorScheme="blue">
            Reset
          </Button>
        </HStack>
        <Text fontWeight="medium">
          {isBreak ? "Break Time!" : "Focus Time"}
        </Text>
      </VStack>
    </Box>;
};