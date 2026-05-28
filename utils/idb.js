export const saveFileToIDB = (file, key = 'jdEnhancedFile') => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('coresumeDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('files');
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('files')) {
         // Should not happen, but just in case
         return resolve(false);
      }
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.put(file, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = (err) => reject(err);
    };
    request.onerror = (err) => reject(err);
  });
};

export const loadFileFromIDB = (key = 'jdEnhancedFile') => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('coresumeDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('files');
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('files')) {
         return resolve(null);
      }
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getReq = store.get(key);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = (err) => reject(err);
    };
    request.onerror = (err) => reject(err);
  });
};
