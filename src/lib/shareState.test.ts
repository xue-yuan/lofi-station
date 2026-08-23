import { describe, expect, it } from "vite-plus/test";
import { buildShareQuery, parseShareState, type ParseOptions } from "./shareState";

const options: ParseOptions = {
  isValidStation: (id) => ["lofi", "jazz"].includes(id),
  isValidChannel: (id) => ["abc123", "xyz789"].includes(id),
  isValidTheme: (id) => ["coffee", "night"].includes(id),
  isValidSound: (id) => ["rain", "thunder", "fire"].includes(id),
};

describe("parseShareState", () => {
  it("reads a full link", () => {
    expect(
      parseShareState(
        "?station=lofi&channel=abc123&theme=coffee&ambient=rain:60,thunder:35",
        options,
      ),
    ).toEqual({
      stationId: "lofi",
      channelId: "abc123",
      theme: "coffee",
      ambient: { rain: 0.6, thunder: 0.35 },
    });
  });

  it("drops parameters that name things which do not exist", () => {
    expect(
      parseShareState("?station=nope&channel=nope&theme=nope&ambient=nope:50", options),
    ).toEqual({});
  });

  it("keeps the valid half of a partly stale link", () => {
    expect(parseShareState("?station=jazz&channel=deleted", options)).toEqual({
      stationId: "jazz",
    });
  });

  it("clamps ambient levels into range", () => {
    expect(parseShareState("?ambient=rain:500,thunder:-20", options).ambient).toEqual({
      rain: 1,
      thunder: 0,
    });
  });

  it("skips malformed ambient pairs without discarding the rest", () => {
    expect(
      parseShareState("?ambient=rain:60,,broken,fire:abc,thunder:10", options).ambient,
    ).toEqual({
      rain: 0.6,
      thunder: 0.1,
    });
  });

  it("rejects ids containing unexpected characters", () => {
    expect(parseShareState("?theme=<script>", options).theme).toBeUndefined();
    expect(parseShareState("?station=lofi%20jazz", options).stationId).toBeUndefined();
  });

  it("returns an empty state for an empty query", () => {
    expect(parseShareState("", options)).toEqual({});
    expect(parseShareState("?", options)).toEqual({});
  });
});

describe("buildShareQuery", () => {
  it("serialises ambient levels as integer percentages", () => {
    expect(buildShareQuery({ stationId: "lofi", ambient: { rain: 0.6, thunder: 0.35 } })).toBe(
      "?station=lofi&ambient=rain%3A60%2Cthunder%3A35",
    );
  });

  it("omits silent tracks so links stay short", () => {
    expect(buildShareQuery({ ambient: { rain: 0.5, thunder: 0, fire: 0 } })).toBe(
      "?ambient=rain%3A50",
    );
  });

  it("omits the ambient parameter entirely for a silent mix", () => {
    expect(buildShareQuery({ stationId: "lofi", ambient: { rain: 0, fire: 0 } })).toBe(
      "?station=lofi",
    );
  });

  it("returns an empty string when there is nothing to share", () => {
    expect(buildShareQuery({})).toBe("");
  });

  it("round-trips through parseShareState", () => {
    const state = {
      stationId: "lofi",
      channelId: "abc123",
      theme: "night",
      ambient: { rain: 0.6, thunder: 0.35 },
    };
    expect(parseShareState(buildShareQuery(state), options)).toEqual(state);
  });
});
