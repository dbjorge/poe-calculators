import * as React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter, Link, Route, Routes } from "react-router-dom";
import styles from "./App.module.css";
import { RollingMagmaCalculator } from "./RollingMagmaCalculator";

const TopNav: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul>
        <li className={styles.navHome}>
          <Link to="/">PoE Calculators</Link>
        </li>
        <li>
          <Link to="/rolling-magma">Rolling Magma</Link>
        </li>
      </ul>
    </nav>
  );
};
TopNav.displayName = "TopNav";

const Home: React.FC = () => {
  return (
    <>
      <h1>PoE Calculators</h1>
      <p>
        This is a collection of calculators for Path of Exile. Choose a tool
        above.
      </p>
    </>
  );
};
Home.displayName = "Home";

const App: React.FC = () => {
  return (
    // Using HashRouter instead of BrowserRouter for GitHub Pages compat
    <HashRouter>
      <TopNav />
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
