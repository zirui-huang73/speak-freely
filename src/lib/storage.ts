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

export const getValue = <T>(key: string) => getFrom<T>('kv', key)
export const setValue = <T>(key: string, value: T) => putIn('kv', key, value)
