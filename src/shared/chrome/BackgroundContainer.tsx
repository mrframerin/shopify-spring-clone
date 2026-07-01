/** The fixed, full-viewport color layer that sits behind all page content. */
export function BackgroundContainer() {
  return (
    <div
      id="background-container"
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-lvh overflow-clip bg-b100 isolate"
    />
  );
}
