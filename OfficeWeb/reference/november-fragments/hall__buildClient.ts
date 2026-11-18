  | { action: 'duplicate'; id: string; version: number }\
  | { action: 'duplicateMany' | 'removeMany'; items: { id: string; version: number }[] }\
  | { action: 'addMany'; items: { part: PartFields; cinemaContent?: unknown }[] }\
export type BuildAnswer = World & { changed?: WorldPart; previous?: WorldPart; model?: WorldModel };\
export type BuildAnswer = World & { changed?: WorldPart; previous?: WorldPart; model?: WorldModel; created?: { part: WorldPart; cinemaContent?: unknown }[] };\
