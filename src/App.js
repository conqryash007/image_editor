import { Routes, Route } from "react-router";

import "./App.css";

import Main from "./Components/Main/Main";
import Generator from "./Components/Generator/Generator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} exact></Route>
      <Route path="/generator" element={<Generator />} exact></Route>
    </Routes>
  );
}

export default App;
