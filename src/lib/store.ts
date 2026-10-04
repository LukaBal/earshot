// Persists parsed plays in this browser's IndexedDB — nothing leaves the device.
import type { Play } from "./history";

const DB_NAME = "earshot";
const STORE = "history";
const KEY = "plays";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result as T);
        };
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export async function loadPlays(): Promise<Play[]> {
  try {
    return (await run<Play[] | undefined>("readonly", (s) => s.get(KEY))) ?? [];
  } catch {
    return []; // private window / storage blocked — just start empty
  }
}

export function savePlays(plays: Play[]) {
  return run<void>("readwrite", (s) => s.put(plays, KEY));
}

export function clearPlays() {
  return run<void>("readwrite", (s) => s.delete(KEY));
}
