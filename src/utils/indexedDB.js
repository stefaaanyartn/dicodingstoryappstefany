import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    },
});

const IndexedDB = {
async putStories(stories) {
            const storiesWithBlob = [];
    for (const story of stories) {
        try {
        const imageResponse = await fetch(story.photoUrl);
         const imageBlob = await imageResponse.blob();
         storiesWithBlob.push({ ...story, imageBlob });
        } catch (err) {
        console.warn('Gagal ambil gambar untuk story', story.id, err);
        storiesWithBlob.push(story);
        }
    }

    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const story of storiesWithBlob) {
         store.put(story); 
    }

 await tx.done;
 },

    async getAllStories() {
        const db = await dbPromise;
        return db.getAll(STORE_NAME);
    },

  async clearStories() {
  try {
    const db = await dbPromise;
    console.log('[IndexedDB] DB:', db);
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    console.log('[IndexedDB] Clearing store:', STORE_NAME);
    await store.clear();

    await tx.done;
    console.log('[IndexedDB] Clear successful');
  } catch (e) {
    console.error('[IndexedDB] Error clearing store:', e);
    throw e;
  }
}

};

export default IndexedDB;
