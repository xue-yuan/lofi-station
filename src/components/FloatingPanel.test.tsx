import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createSignal } from "solid-js";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import FloatingPanel from "./FloatingPanel";

afterEach(cleanup);

const setViewport = (isDesktop: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: isDesktop,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
};

const renderPanel = (isOpen = true, onClose = vi.fn()) => {
  const [open, setOpen] = createSignal(isOpen);
  const [tab, setTab] = createSignal("one");
  const result = render(() => (
    <FloatingPanel
      isOpen={open()}
      onClose={onClose}
      label="Test panel"
      icon={<span>icon</span>}
      tabs={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
      activeTab={tab()}
      onSelectTab={setTab}
    >
      <button type="button">inner action</button>
    </FloatingPanel>
  ));
  return { ...result, setOpen, tab, onClose };
};

describe("FloatingPanel", () => {
  it("exposes a labelled dialog", () => {
    setViewport(true);
    renderPanel();
    expect(screen.getByRole("dialog", { name: "Test panel" })).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    setViewport(true);
    const onClose = vi.fn();
    renderPanel(true, onClose);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not react to Escape while closed", () => {
    setViewport(true);
    const onClose = vi.fn();
    renderPanel(false, onClose);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("marks a closed panel inert so its buttons leave the tab order", () => {
    setViewport(true);
    const { setOpen } = renderPanel(true);
    const dialog = screen.getByRole("dialog", { name: "Test panel" });
    expect(dialog.hasAttribute("inert")).toBe(false);

    setOpen(false);
    expect(dialog.hasAttribute("inert")).toBe(true);
  });

  it("switches tabs through the callback", () => {
    setViewport(true);
    const { tab } = renderPanel();
    fireEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(tab()).toBe("two");
  });

  it("positions itself absolutely on desktop", () => {
    setViewport(true);
    renderPanel();
    const dialog = screen.getByRole("dialog", { name: "Test panel" });
    expect(dialog.style.left).not.toBe("");
    expect(dialog.style.top).not.toBe("");
  });

  it("drops inline coordinates on mobile so the sheet layout applies", () => {
    setViewport(false);
    renderPanel();
    const dialog = screen.getByRole("dialog", { name: "Test panel" });
    expect(dialog.style.left).toBe("");
    expect(dialog.style.top).toBe("");
  });

  it("renders its children on mobile, where the panel used to be hidden", () => {
    setViewport(false);
    renderPanel();
    expect(screen.getByRole("button", { name: "inner action" })).toBeInTheDocument();
  });
});
