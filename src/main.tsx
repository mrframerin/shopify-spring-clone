import { createRoot } from "react-dom/client";
import { App } from "./App";

// Styling: web fonts, then the Tailwind entry (@theme + generated utilities), then the
// design layer. `design.css` is imported separately — not @imported into app.css — so
// it bypasses Tailwind's Lightning CSS pass, which would otherwise strip modern
// declarations like `text-box`.
import "./styles/fonts.css";
import "./styles/app.css";
import "./styles/design.css";

// No StrictMode: its dev-only double-invoke of effects would create the WebGL
// background scene twice on the same node, and the render loop / GL context don't
// tolerate that. Production behaviour is unaffected (StrictMode is dev-only).
createRoot(document.getElementById("root")!).render(<App />);
