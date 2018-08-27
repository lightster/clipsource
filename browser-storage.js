export default {
  get: keys => new Promise(resolve => chrome.storage.local.get(keys, storage => {
    resolve(storage);
  })),

  set: items => new Promise(resolve => chrome.storage.local.set(items, resolve))
};
