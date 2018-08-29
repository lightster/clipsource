import BrowserStorage from './browser-storage.js';
import Clip from './clip.js';

const saveToList = (clip) => {
  return BrowserStorage.get(['clips', 'history', 'recent']).then(storage => {
    if (!storage.clips) {
      storage.clips = {};
    }
    if (!storage.recent) {
      storage.recent = [];
    }
    if (!storage.history) {
      storage.history = [];
    }

    storage.recent.unshift(clip.uid);
    storage.recent = storage.recent.slice(0, 10);
    storage.history.push(clip.uid);

    return BrowserStorage.set(storage).then(() => ClipStore.save(clip));
  });
};

const ClipStore = {
  init() {
    this.details = null;
  },

  instance() {
    if (!ClipStore.singletonInstance) {
      ClipStore.singletonInstance = Object.create(ClipStore);
    }

    return ClipStore.singletonInstance;
  },

  list() {
    const key = 'history';
    return BrowserStorage.get([key]).then(storage => {
      return storage[key];
    });
  },

  async loadById(uid) {
    const clip = Object.create(Clip);

    const details = await ClipStore.instance().listDetails();
    clip.init(details[uid]);

    return clip;
  },

  async save(clip) {
    if (!clip.uid) {
      clip.uid = btoa(clip.clipboard.plain)
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 20)
        .concat('-')
        .concat(clip.clippedTime);

      await saveToList(clip);
    }

    const clips = await ClipStore.instance().listDetails();
    clips[clip.uid] = clip;

    return BrowserStorage.set({clips});
  },

  listDetails() {
    if (this.details) {
      return this.details;
    }

    this.details = BrowserStorage.get(['clips']).then(({clips}) => {
      return clips;
    });

    return this.details;
  }
};

export default ClipStore;
