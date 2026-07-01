import { createRoot } from "react-dom/client";
import { App } from "./App";

// Styling: web fonts, then the Tailwind entry (@theme + generated utilities), then the
// design layer. `design.css` is imported separately — not @imported into app.css — so
// it bypasses Tailwind's Lightning CSS pass, which would otherwise strip modern
// declarations like `text-box`.
import "./styles/fonts.css";
import "./styles/app.css";
import "./styles/design.css";

// No StrictMode: the embedded WebGL/scroll engine is sensitive to the double-invoked
// effects StrictMode adds in dev, and we want dev to behave the same as production.
createRoot(document.getElementById("root")!).render(<App />);
