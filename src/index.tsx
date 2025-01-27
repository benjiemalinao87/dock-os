import React from "react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { render } from "react-dom";
import { App } from "./App";
render(<ChakraProvider>
    <ColorModeScript initialColorMode="light" />
    <App />
  </ChakraProvider>, document.getElementById("root"));