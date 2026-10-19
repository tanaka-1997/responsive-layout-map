import React from "react";
import { createRoot } from "react-dom/client";
import { ResponsiveLayoutMap } from "../src/index.js";
import "./demo.css";

createRoot(document.getElementById("root")).render(
  <main className="demo">
    <ResponsiveLayoutMap />
  </main>
);
