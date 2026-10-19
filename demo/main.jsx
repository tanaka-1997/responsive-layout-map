import React from "react";
import { createRoot } from "react-dom/client";
import { ResponsiveLayoutMap } from "../src/index.js";
import "./demo.css";

function Demo() {
  const [dark, setDark] = React.useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );

  return (
    <main className={"demo" + (dark ? " dark" : "")}>
      <button className="theme" onClick={() => setDark(!dark)}>
        {dark ? "Light" : "Dark"} mode
      </button>
      <ResponsiveLayoutMap />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
