import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIONS_PATH = path.resolve(__dirname, "../src/stations.json");
const REPORT_PATH = path.resolve(__dirname, "../reports/broken-links-report.md");

const API_KEY = process.env.YOUTUBE_API_KEY;
const BATCH_SIZE = 50;
const OEMBED_DELAY_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

async function checkViaDataApi(ids) {
  const results = new Map();

  for (const batch of chunk(ids, BATCH_SIZE)) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "status,snippet");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", API_KEY);

    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Data API request failed (${response.status}): ${body.slice(0, 200)}`);
      return null;
    }

    const payload = await response.json();
    const found = new Set();

    for (const item of payload.items ?? []) {
      found.add(item.id);
      const status = item.status ?? {};

      if (status.uploadStatus === "rejected" || status.uploadStatus === "deleted") {
        results.set(item.id, { ok: false, reason: `upload status: ${status.uploadStatus}` });
      } else if (status.privacyStatus === "private") {
        results.set(item.id, { ok: false, reason: "private video" });
      } else if (status.embeddable === false) {
        results.set(item.id, { ok: false, reason: "embedding disabled by the uploader" });
      } else {
        results.set(item.id, { ok: true });
      }
    }

    for (const id of batch) {
      if (!found.has(id)) results.set(id, { ok: false, reason: "video not found" });
    }
  }

  return results;
}

async function checkViaOembed(ids) {
  const results = new Map();

  for (const id of ids) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    try {
      const response = await fetch(url);
      results.set(id, response.ok ? { ok: true } : { ok: false, reason: "video unavailable" });
    } catch (error) {
      console.error(`Error checking ${id}:`, error.message);
      results.set(id, { ok: false, reason: `request failed: ${error.message}` });
    }
    await sleep(OEMBED_DELAY_MS);
  }

  return results;
}

function buildReport(brokenEntries, method, total) {
  if (brokenEntries.length === 0) {
    return [
      "✨ All YouTube links are healthy! No action required.",
      "",
      `Checked ${total} channels via ${method}.`,
    ].join("\n");
  }

  const lines = [
    "The automated health check has identified the following broken YouTube links:",
    "",
    ...brokenEntries.map(
      ({ channel, reason }) =>
        `- [${channel.title}](https://www.youtube.com/watch?v=${channel.id}) (\`${channel.id}\`) — ${reason}`,
    ),
    "",
    "These have been marked as `broken: true` in `src/stations.json` to exclude them from the player.",
    "",
    `Checked ${total} channels via ${method}.`,
  ];

  if (method === "oEmbed") {
    lines.push(
      "",
      "> ⚠️ Running without `YOUTUBE_API_KEY`. oEmbed cannot detect videos that",
      "> disallow embedding, which surface as player errors 101/150. Set the",
      "> secret to enable the full check.",
    );
  }

  return lines.join("\n");
}

async function run() {
  console.log("🚀 Starting YouTube Health Check...");

  const data = JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8"));
  const channels = data.flatMap((category) => category.channels);
  const ids = channels.map((channel) => channel.id);

  let method = "YouTube Data API";
  let results = API_KEY ? await checkViaDataApi(ids) : null;

  if (!results) {
    if (API_KEY) {
      console.warn("⚠️ Falling back to oEmbed after a Data API failure.");
    } else {
      console.warn("⚠️ YOUTUBE_API_KEY is not set; falling back to oEmbed.");
      console.warn("   oEmbed cannot detect embedding restrictions (errors 101/150).");
    }
    method = "oEmbed";
    results = await checkViaOembed(ids);
  }

  const brokenEntries = [];

  for (const category of data) {
    console.log(`\nChecking category: ${category.name}`);
    for (const channel of category.channels) {
      const result = results.get(channel.id) ?? { ok: false, reason: "no result" };
      const label = channel.title.substring(0, 40);

      if (result.ok) {
        console.log(`  ✅ [${channel.id}] ${label}`);
        if (channel.broken) delete channel.broken;
      } else {
        console.log(`  ❌ [${channel.id}] ${label} — ${result.reason}`);
        channel.broken = true;
        brokenEntries.push({ channel, reason: result.reason });
      }
    }
  }

  console.log(
    brokenEntries.length > 0
      ? `\nFound ${brokenEntries.length} broken links. Updating JSON...`
      : "\n✨ All links are healthy!",
  );
  fs.writeFileSync(STATIONS_PATH, `${JSON.stringify(data, null, 2)}\n`);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, buildReport(brokenEntries, method, ids.length));
  console.log("✅ Report generated in reports/broken-links-report.md");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
