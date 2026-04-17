import Dexie, { type EntityTable } from "dexie";
import { type MezaTag } from "./types";

const db = new Dexie("MezastarCompanion") as Dexie & {
  tags: EntityTable<MezaTag, "id">;
};

db.version(1).stores({
  tags: "++id, pokemonName, collectionNumber, grade, energy, scannedAt, *types",
});

export { db };
