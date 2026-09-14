// Convert the 21 Quaternius individual characters (self-contained glTF with a
// base64 buffer) into binary GLB files for OfficeWeb, and emit a manifest.
// The source files already carry the humanoid rig bone names (Hips, UpperLeg.L,
// LowerLeg.L, Foot.L, UpperArm.L, LowerArm.L, Wrist.L, ...) plus all 24
// animations, so the conversion is a byte-faithful glTF -> GLB repack.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "AssetSources", "Characters", "Quaternius");
const OUT = join(ROOT, "OfficeWeb", "public", "assets", "characters");

const SOURCES = [
  { gender: "man", pack: "UltimateModularMen", characters: [
    ["Adventurer", "adventurer", "冒险家"],
    ["Beach", "beach", "沙滩度假"],
    ["Casual_2", "casual_2", "休闲套装"],
    ["Casual_Hoodie", "casual_hoodie", "连帽卫衣"],
    ["Farmer", "farmer", "农夫"],
    ["King", "king", "国王"],
    ["Punk", "punk", "朋克"],
    ["Spacesuit", "spacesuit", "宇航服"],
    ["Suit", "suit", "西装"],
    ["Swat", "swat", "特警"],
    ["Worker", "worker", "工人"],
  ] },
  { gender: "woman", pack: "UltimateModularWomen", characters: [
    ["Adventurer", "adventurer", "冒险家"],
    ["Casual", "casual", "休闲"],
    ["Formal", "formal", "正装"],
    ["Medieval", "medieval", "中世纪"],
    ["Punk", "punk", "朋克"],
    ["SciFi", "scifi", "科幻"],
    ["Soldier", "soldier", "士兵"],
    ["Suit", "suit", "西装"],
    ["Witch", "witch", "女巫"],
    ["Worker", "worker", "工人"],
  ] },
];

/** Repack a self-contained glTF JSON document into a binary GLB buffer. */
function gltfToGlb(jsonText) {
  const json = JSON.parse(jsonText);
  const buffers = json.buffers;
  if (!Array.isArray(buffers) || buffers.length !== 1)
    throw new Error("expected exactly one buffer");
  const match = /^data:([^;]+);base64,(.*)$/s.exec(buffers[0].uri || "");
  if (!match) throw new Error("buffer is not an embedded base64 data URI");
  const bin = Buffer.from(match[2], "base64");
  if (bin.length !== buffers[0].byteLength)
    throw new Error(
      `buffer length mismatch: declared ${buffers[0].byteLength}, decoded ${bin.length}`,
    );
  delete buffers[0].uri;

  const jsonBytes = Buffer.from(JSON.stringify(json), "utf8");
  const padJson = (4 - (jsonBytes.length % 4)) % 4;
  const binBytes = Buffer.concat([
    bin,
    Buffer.alloc((4 - (bin.length % 4)) % 4),
  ]);

  const total = 12 + 8 + jsonBytes.length + padJson + 8 + binBytes.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);

  const jsonChunk = Buffer.alloc(8 + jsonBytes.length + padJson);
  jsonChunk.writeUInt32LE(jsonBytes.length + padJson, 0);
  jsonChunk.writeUInt32LE(0x4e4f534a, 4); // "JSON"
  jsonBytes.copy(jsonChunk, 8);
  for (let i = 0; i < padJson; i++) jsonChunk[8 + jsonBytes.length + i] = 0x20;

  const binChunk = Buffer.alloc(8 + binBytes.length);
  binChunk.writeUInt32LE(binBytes.length, 0);
  binChunk.writeUInt32LE(0x004e4942, 4); // "BIN\0"
  binBytes.copy(binChunk, 8);

  return Buffer.concat([header, jsonChunk, binChunk]);
}

function run() {
  mkdirSync(OUT, { recursive: true });
  const manifest = [];
  for (const { gender, pack, characters } of SOURCES) {
    const dir = join(SRC, pack, "Individual Characters", "glTF");
    for (const [name, slug, label] of characters) {
      const id = `${gender}_${slug}`;
      const srcPath = join(dir, `${name}.gltf`);
      if (!existsSync(srcPath))
        throw new Error(`missing source: ${srcPath}`);
      const glb = gltfToGlb(readFileSync(srcPath, "utf8"));
      const glbName = `${id}.glb`;
      writeFileSync(join(OUT, glbName), glb);
      manifest.push({
        id,
        gender,
        name,
        label,
        glb: `/assets/characters/${glbName}`,
        thumb: `/assets/characters/thumbnails/${id}.png`,
      });
      console.log(`${id}\t${(glb.length / 1024).toFixed(0)} KB`);
    }
  }
  writeFileSync(
    join(OUT, "characters.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(`wrote ${manifest.length} characters to ${OUT}`);
}

run();
