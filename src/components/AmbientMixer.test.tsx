import { beforeEach, afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import AmbientMixer from "./AmbientMixer";
import { clearMix } from "../stores/ambientStore";
import { setMusicMuted, setMuted, playerState } from "../stores/playerStore";
import { PRESETS, presetMix } from "../ambient";

const slider = (name: string) => screen.getByLabelText(`${name} volume`) as HTMLInputElement;

const percentFor = (name: string) => {
  const row = screen.getByText(name).closest("div")!;
  return row.textContent?.match(/(\d+)%/)?.[1];
};

beforeEach(() => {
  localStorage.clear();
  clearMix();
  setMusicMuted(false);
  setMuted(false);
});
afterEach(cleanup);

describe("AmbientMixer presets", () => {
  it("writes the sliders when a preset is applied", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    const rainyNight = PRESETS.find((p) => p.id === "rainy-night")!;
    const expected = presetMix(rainyNight);

    fireEvent.click(screen.getByRole("button", { name: "Rainy Night" }));

    expect(Number(slider("Rain").value)).toBeCloseTo(expected.rain, 2);
    expect(Number(slider("Thunder").value)).toBeCloseTo(expected.thunder, 2);
    expect(Number(slider("Campfire").value)).toBe(0);
  });

  it("leaves the sliders editable afterwards - a preset is a starting point", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Rainy Night" }));

    fireEvent.input(slider("Rain"), { target: { value: "0.2" } });

    expect(Number(slider("Rain").value)).toBeCloseTo(0.2, 2);
    expect(Number(slider("Thunder").value)).toBeCloseTo(0.35, 2);
  });

  it("stops marking a preset active once the mix is edited", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    const chip = screen.getByRole("button", { name: "Rainy Night" });

    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");

    fireEvent.input(slider("Rain"), { target: { value: "0.05" } });
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("clears every track", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Storm" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(Number(slider("Rain").value)).toBe(0);
    expect(Number(slider("Thunder").value)).toBe(0);
  });

  it("hides Clear when nothing is playing", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("persists the mix", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Campfire" }));

    const stored = JSON.parse(localStorage.getItem("lofi_ambient_volumes")!);
    expect(stored.fire).toBeCloseTo(0.6, 2);
  });

  it("shows the level as a percentage", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    fireEvent.input(slider("Rain"), { target: { value: "0.42" } });
    expect(percentFor("Rain")).toBe("42");
  });
});

describe("ambient store seeding", () => {
  it("prefers a shared link's mix over stored levels", async () => {
    vi.resetModules();
    localStorage.setItem("lofi_ambient_volumes", JSON.stringify({ rain: 0.9 }));
    vi.stubGlobal("location", {
      search: "?ambient=thunder:40",
      pathname: "/",
      origin: "http://localhost",
    });

    const { ambientMix } = await import("../stores/ambientStore");
    expect(ambientMix.thunder).toBeCloseTo(0.4, 2);
    expect(ambientMix.rain).toBe(0);

    vi.unstubAllGlobals();
  });
});

describe("ambient-only toggle", () => {
  it("mutes the music without muting the ambient mix", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);

    fireEvent.click(screen.getByLabelText(/Ambient Only/i));

    expect(playerState.isMusicMuted).toBe(true);
    expect(playerState.isMuted).toBe(false);
  });

  it("warns when it would leave nothing audible", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText(/Ambient Only/i));

    expect(screen.getByText(/Nothing is playing/i)).toBeInTheDocument();
  });

  it("drops the warning once a track is raised", () => {
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText(/Ambient Only/i));
    fireEvent.click(screen.getByRole("button", { name: "Rainy Night" }));

    expect(screen.queryByText(/Nothing is playing/i)).not.toBeInTheDocument();
  });

  it("reflects the stored state when reopened", () => {
    setMusicMuted(true);
    render(() => <AmbientMixer isOpen onClose={() => {}} />);
    expect(screen.getByLabelText(/Ambient Only/i)).toBeChecked();
  });
});

describe("audio routing", () => {
  const captureAudio = () => {
    const created: HTMLAudioElement[] = [];
    const RealAudio = window.Audio;
    vi.stubGlobal(
      "Audio",
      class extends RealAudio {
        constructor(src?: string) {
          super(src);
          created.push(this as unknown as HTMLAudioElement);
        }
      },
    );
    return created;
  };

  afterEach(() => vi.unstubAllGlobals());

  it("keeps the ambient mix audible while the music is muted", () => {
    const created = captureAudio();
    render(() => <AmbientMixer isOpen onClose={() => {}} />);

    fireEvent.input(slider("Rain"), { target: { value: "0.7" } });
    fireEvent.click(screen.getByLabelText(/Ambient Only/i));

    const loudest = Math.max(...created.map((a) => a.volume));
    expect(loudest).toBeCloseTo(0.7, 2);
  });

  it("still silences the ambient mix on master mute", () => {
    const created = captureAudio();
    render(() => <AmbientMixer isOpen onClose={() => {}} />);

    fireEvent.input(slider("Rain"), { target: { value: "0.7" } });
    setMuted(true);

    expect(Math.max(...created.map((a) => a.volume))).toBe(0);
    setMuted(false);
  });
});
