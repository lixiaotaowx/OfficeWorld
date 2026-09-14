// Character catalog: the 21 Quaternius avatars bundled under
// /assets/characters, exported by tools/export_web_characters.mjs. Keep the ids
// in sync with that script and with the CHARACTER_IDS set in server.mjs.
export type Gender = "man" | "woman";

export interface CharacterDef {
  /** Stable id used for the GLB file, socket messages and storage. */
  id: string;
  gender: Gender;
  /** Source asset name from the Quaternius pack. */
  name: string;
  /** Short Chinese label shown in the picker. */
  label: string;
  glb: string;
  thumb: string;
}

export const CHARACTERS: CharacterDef[] = [
  // Men — Ultimate Modular Men pack.
  { id: "man_adventurer", gender: "man", name: "Adventurer", label: "冒险家", glb: "/assets/characters/man_adventurer.glb", thumb: "/assets/characters/thumbnails/man_adventurer.png" },
  { id: "man_beach", gender: "man", name: "Beach", label: "沙滩度假", glb: "/assets/characters/man_beach.glb", thumb: "/assets/characters/thumbnails/man_beach.png" },
  { id: "man_casual_2", gender: "man", name: "Casual_2", label: "休闲套装", glb: "/assets/characters/man_casual_2.glb", thumb: "/assets/characters/thumbnails/man_casual_2.png" },
  { id: "man_casual_hoodie", gender: "man", name: "Casual_Hoodie", label: "连帽卫衣", glb: "/assets/characters/man_casual_hoodie.glb", thumb: "/assets/characters/thumbnails/man_casual_hoodie.png" },
  { id: "man_farmer", gender: "man", name: "Farmer", label: "农夫", glb: "/assets/characters/man_farmer.glb", thumb: "/assets/characters/thumbnails/man_farmer.png" },
  { id: "man_king", gender: "man", name: "King", label: "国王", glb: "/assets/characters/man_king.glb", thumb: "/assets/characters/thumbnails/man_king.png" },
  { id: "man_punk", gender: "man", name: "Punk", label: "朋克", glb: "/assets/characters/man_punk.glb", thumb: "/assets/characters/thumbnails/man_punk.png" },
  { id: "man_spacesuit", gender: "man", name: "Spacesuit", label: "宇航服", glb: "/assets/characters/man_spacesuit.glb", thumb: "/assets/characters/thumbnails/man_spacesuit.png" },
  { id: "man_suit", gender: "man", name: "Suit", label: "西装", glb: "/assets/characters/man_suit.glb", thumb: "/assets/characters/thumbnails/man_suit.png" },
  { id: "man_swat", gender: "man", name: "Swat", label: "特警", glb: "/assets/characters/man_swat.glb", thumb: "/assets/characters/thumbnails/man_swat.png" },
  { id: "man_worker", gender: "man", name: "Worker", label: "工人", glb: "/assets/characters/man_worker.glb", thumb: "/assets/characters/thumbnails/man_worker.png" },
  // Women — Ultimate Modular Women pack.
  { id: "woman_adventurer", gender: "woman", name: "Adventurer", label: "冒险家", glb: "/assets/characters/woman_adventurer.glb", thumb: "/assets/characters/thumbnails/woman_adventurer.png" },
  { id: "woman_casual", gender: "woman", name: "Casual", label: "休闲", glb: "/assets/characters/woman_casual.glb", thumb: "/assets/characters/thumbnails/woman_casual.png" },
  { id: "woman_formal", gender: "woman", name: "Formal", label: "正装", glb: "/assets/characters/woman_formal.glb", thumb: "/assets/characters/thumbnails/woman_formal.png" },
  { id: "woman_medieval", gender: "woman", name: "Medieval", label: "中世纪", glb: "/assets/characters/woman_medieval.glb", thumb: "/assets/characters/thumbnails/woman_medieval.png" },
  { id: "woman_punk", gender: "woman", name: "Punk", label: "朋克", glb: "/assets/characters/woman_punk.glb", thumb: "/assets/characters/thumbnails/woman_punk.png" },
  { id: "woman_scifi", gender: "woman", name: "SciFi", label: "科幻", glb: "/assets/characters/woman_scifi.glb", thumb: "/assets/characters/thumbnails/woman_scifi.png" },
  { id: "woman_soldier", gender: "woman", name: "Soldier", label: "士兵", glb: "/assets/characters/woman_soldier.glb", thumb: "/assets/characters/thumbnails/woman_soldier.png" },
  { id: "woman_suit", gender: "woman", name: "Suit", label: "西装", glb: "/assets/characters/woman_suit.glb", thumb: "/assets/characters/thumbnails/woman_suit.png" },
  { id: "woman_witch", gender: "woman", name: "Witch", label: "女巫", glb: "/assets/characters/woman_witch.glb", thumb: "/assets/characters/thumbnails/woman_witch.png" },
  { id: "woman_worker", gender: "woman", name: "Worker", label: "工人", glb: "/assets/characters/woman_worker.glb", thumb: "/assets/characters/thumbnails/woman_worker.png" },
];

export type CharacterId = (typeof CHARACTERS)[number]["id"];

const BY_ID = new Map<string, CharacterDef>(CHARACTERS.map((c) => [c.id, c]));

/** Characters grouped by gender, in catalog order. */
export const CHARACTERS_BY_GENDER: Record<Gender, CharacterDef[]> = {
  man: CHARACTERS.filter((c) => c.gender === "man"),
  woman: CHARACTERS.filter((c) => c.gender === "woman"),
};

/** The avatar worn by new visitors and whenever a stored id is unknown. */
export const DEFAULT_CHARACTER: CharacterId = "woman_casual";

/** Look up a character, falling back to the default when the id is unknown. */
export function getCharacter(id: string | null | undefined): CharacterDef {
  return BY_ID.get(id ?? "") ?? BY_ID.get(DEFAULT_CHARACTER)!;
}

/** Validate a value from the network or storage into a usable character id. */
export function resolveCharacterId(id: unknown): CharacterId {
  return BY_ID.has(String(id)) ? (String(id) as CharacterId) : DEFAULT_CHARACTER;
}
