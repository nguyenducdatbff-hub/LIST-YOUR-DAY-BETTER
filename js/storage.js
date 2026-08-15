/**
 * Storage Module - LocalStorage + IndexedDB for reliable offline persistence
 */

const Storage = (() => {
  const DB_NAME = 'AestheticTodoDB';
  const DB_VERSION = 1;
  const STORE_MEDIA = 'media_store';

  let dbPromise = null;

  // Initialize IndexedDB for heavy assets (custom images, avatars)
  function initDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          db.createObjectStore(STORE_MEDIA);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
    return dbPromise;
  }

  // Save large base64/blob into IndexedDB
  async function saveMedia(key, value) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MEDIA, 'readwrite');
        const store = tx.objectStore(STORE_MEDIA);
        store.put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveMedia failed, falling back to LocalStorage', err);
      try {
        localStorage.setItem(`media_${key}`, value);
      } catch (e) {
        console.error('Storage quota exceeded', e);
      }
    }
  }

  // Retrieve media from IndexedDB
  async function getMedia(key) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_MEDIA, 'readonly');
        const store = tx.objectStore(STORE_MEDIA);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || localStorage.getItem(`media_${key}`));
        request.onerror = () => resolve(localStorage.getItem(`media_${key}`));
      });
    } catch (err) {
      return localStorage.getItem(`media_${key}`);
    }
  }

  // LocalStorage JSON helpers
  function get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.error(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving key ${key} to localStorage:`, e);
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing key ${key}:`, e);
    }
  }

  return {
    get,
    set,
    remove,
    saveMedia,
    getMedia
  };
})();
