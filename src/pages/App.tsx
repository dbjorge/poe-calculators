import * as React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter, Link, Route, Routes } from "react-router-dom";
import { RollingMagmaCalculator } from "./RollingMagmaCalculator";

const Home: React.FC = () => {
  return (
    <>
      <h1><Link to="/">PoE Calculators</Link></h1>
      <ul>
        <li>
          <Link to="/rolling-magma">Rolling Magma</Link>
        </li>
      </ul>
    </>
  );
};
Home.displayName = "Home";

const App: React.FC = () => {
  return (
    // Using HashRouter instead of BrowserRouter for GitHub Pages compat
    <HashRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/rolling-magma" element={<RollingMagmaCalculator />} />
      </Routes>
    </HashRouter>
  );
};
App.displayName = "App";

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(<App />);
