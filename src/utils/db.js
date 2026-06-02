import { openDB } from 'idb';

const DB_NAME = 'dishub_cards';
const STORE = 'cards';

function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' });
    },
  });
}

export async function saveCard(card) {
  const db = await getDB();
  await db.put(STORE, card);
}

export async function getAllCards() {
  const db = await getDB();
  const all = await db.getAll(STORE);
  return all.sort((a, b) => b.id - a.id);
}

export async function removeCard(id) {
  const db = await getDB();
  await db.delete(STORE, id);
}
