import { Routes, Route } from "react-router";

import "./App.css";

import Main from "./Components/Main/Main";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} exact></Route>
    </Routes>
  );
}

export default App;
