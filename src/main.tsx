import { createRoot } from "react-dom/client";
import { App } from "./App";

// No StrictMode: the reused WebGL/scroll engine (Phase C) is sensitive to the
// double-invoked effects StrictMode adds in dev, and we want dev to mirror prod.
createRoot(document.getElementById("root")!).render(<App />);
