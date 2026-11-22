import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface AppDB extends DBSchema {
  kv: { key: string; value: unknown }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | undefined

function getDB() {
  dbPromise ??= openDB<AppDB>('speak-freely', 1, {
    upgrade(db) {
      db.createObjectStore('kv')
    },
  })
  return dbPromise
}

export async function getValue<T>(key: string): Promise<T | undefined> {
  return (await (await getDB()).get('kv', key)) as T | undefined
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  await (await getDB()).put('kv', value, key)
}
