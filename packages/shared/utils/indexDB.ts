type StoreKeys = 'ideTabs';

const DB_NAME = 'MAGIC_PLAY_STORAGE';
const storeObjectDict: Record<StoreKeys, { name: string; keyPath: string; fields: string[] }> = {
  ideTabs: { name: 'ideTabs', keyPath: 'id', fields: [] },
};
let databaseInstance: IDBDatabase | null = null;

function initDB() {
  if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.");
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = function () {
      reject('Open IndexedDB Error!');
    };
    request.onsuccess = function () {
      databaseInstance = request.result;
      resolve(databaseInstance);
    };

    request.onupgradeneeded = function () {
      // 此版本数据库不存在，自动创建
      databaseInstance = request.result;
      // 新建表格
      for (const key in storeObjectDict) {
        if (!databaseInstance.objectStoreNames.contains(key)) {
          const objectStore = databaseInstance.createObjectStore(key, {
            keyPath: storeObjectDict[key as StoreKeys].keyPath,
          });
          for (const field of storeObjectDict[key as StoreKeys].fields) {
            objectStore.createIndex(field, field, { unique: field === storeObjectDict[key as StoreKeys].keyPath });
          }
        }
      }
      if (request.transaction) {
        request.transaction.oncomplete = function () {
          resolve(databaseInstance);
        };
      }
    };
  });
}

function getData(objectStoreKey: StoreKeys, keyValue: IDBValidKey) {
  return Promise.resolve()
    .then(() => {
      if (databaseInstance) {
        return databaseInstance;
      }
      return initDB();
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        const request = (databaseInstance as IDBDatabase)
          .transaction([objectStoreKey])
          .objectStore(objectStoreKey)
          .get(keyValue);

        request.onerror = function () {
          reject('IndexDB: getData Error');
        };
        request.onsuccess = function () {
          resolve(request.result);
        };
      });
    });
}

const apis = {
  initDB,
  getData,
};

export default apis;
