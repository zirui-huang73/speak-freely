import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface AppDB extends DBSchema {
  kv: { key: string; value: unknown }
  recordings: { key: string; value: unknown }
}

type Store = 'kv' | 'recordings'

let dbPromise: Promise<IDBPDatabase<AppDB>> | undefined

function getDB() {
  dbPromise ??= openDB<AppDB>('speak-freely', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) db.createObjectStore('kv')
      if (oldVersion < 2) db.createObjectStore('recordings')
    },
  })
  return dbPromise
}

export async function getFrom<T>(store: Store, key: string): Promise<T | undefined> {
  return (await (await getDB()).get(store, key)) as T | undefined
}

export async function putIn<T>(store: Store, key: string, value: T): Promise<void> {
  await (await getDB()).put(store, value, key)
}

export async function deleteFrom(store: Store, key: string): Promise<void> {
  await (await getDB()).delete(store, key)
}

export async function entries(store: Store): Promise<[string, unknown][]> {
  const db = await getDB()
  const [keys, values] = await Promise.all([db.getAllKeys(store), db.getAll(store)])
  return keys.map((k, i) => [String(k), values[i]])
}

export async function replaceAll(data: Record<Store, [string, unknown][]>): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['kv', 'recordings'], 'readwrite')
  for (const store of ['kv', 'recordings'] as const) {
    const s = tx.objectStore(store)
    await s.clear()
    for (const [key, value] of data[store]) await s.put(value, key)
  }
  await tx.done
}

export const getValue = <T>(key: string) => getFrom<T>('kv', key)
export const setValue = <T>(key: string, value: T) => putIn('kv', key, value)
