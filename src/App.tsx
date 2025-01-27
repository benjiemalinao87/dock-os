import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Dock } from "./components/Dock";
import { WindowManager } from "./components/WindowManager";
export function App() {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [background, setBackground] = useState("https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");
  return <Box w="100%" h="100vh" bgImage={background} bgSize="cover" bgPosition="center" position="relative" overflow="hidden">
      <WindowManager activeWindow={activeWindow} onClose={() => setActiveWindow(null)} />
      <Dock activeWindow={activeWindow} onWindowChange={setActiveWindow} />
    </Box>;
}