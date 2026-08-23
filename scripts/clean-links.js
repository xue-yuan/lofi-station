import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIONS_PATH = path.resolve(__dirname, "../src/stations.json");

function clean() {
  console.log("🧹 Cleaning up broken links...");

  if (!fs.existsSync(STATIONS_PATH)) {
    console.error("File not found:", STATIONS_PATH);
    return;
  }

  const data = JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8"));
  let removedTotal = 0;

  const cleanedData = data.map((category) => {
    const brokenChannels = category.channels.filter((ch) => ch.broken);
    const remainingChannels = category.channels.filter((ch) => !ch.broken);

    if (brokenChannels.length > 0) {
      console.log(`\n📂 [${category.name}]`);
      brokenChannels.forEach((ch) => {
        console.log(`  🗑️ Removing: ${ch.title} (${ch.id})`);
      });
      removedTotal += brokenChannels.length;
    }

    return {
      ...category,
      channels: remainingChannels,
    };
  });

  if (removedTotal > 0) {
    fs.writeFileSync(STATIONS_PATH, JSON.stringify(cleanedData, null, 2));
    console.log(`\n✅ Success! Total ${removedTotal} links removed.`);
  } else {
    console.log("\n✨ No broken links found. Nothing to clean.");
  }
}

clean();
