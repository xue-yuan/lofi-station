import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIONS_PATH = path.resolve(__dirname, "../src/stations.json");

function extractId(url) {
  const regex = /(?:v=|\/live\/|\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function fetchMetadata(url) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error(`Video not found or unavailable (Status: ${res.status})`);
    return await res.json();
  } catch (e) {
    console.error("❌ Error fetching metadata:", e.message);
    return null;
  }
}

async function add(categoryId, url) {
  if (!categoryId || !url) {
    console.log("Usage: node scripts/add-link.js <CATEGORY_ID> <YOUTUBE_URL>");
    console.log('Example: node scripts/add-link.js lofi "https://www.youtube.com/watch?v=ID"');
    return;
  }

  const videoId = extractId(url);
  if (!videoId) {
    console.error("❌ Invalid YouTube URL");
    return;
  }

  console.log(`🔍 Fetching metadata for [${videoId}]...`);
  const metadata = await fetchMetadata(url);
  if (!metadata) return;

  const data = JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8"));

  let existingCategory = null;
  for (const cat of data) {
    if (cat.channels.some((ch) => ch.id === videoId)) {
      existingCategory = cat;
      break;
    }
  }

  if (existingCategory) {
    console.warn(
      `⚠️ Warning: ID [${videoId}] already exists in category [${existingCategory.name}]`,
    );
    return;
  }

  let category = data.find((c) => c.id === categoryId);
  if (!category) {
    console.log(`✨ Creating new category: [${categoryId}]`);
    const name = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    category = {
      id: categoryId,
      name: name,
      description: `New ${name} vibes`,
      channels: [],
    };
    data.push(category);
  }

  const newChannel = {
    id: videoId,
    title: metadata.title,
    author: metadata.author_name,
  };

  category.channels.push(newChannel);
  fs.writeFileSync(STATIONS_PATH, JSON.stringify(data, null, 2));

  console.log(`\n✅ Added to [${category.name}]:`);
  console.log(`   Title:  ${newChannel.title}`);
  console.log(`   Author: ${newChannel.author}`);
}

const [, , categoryId, url] = process.argv;

add(categoryId, url).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
