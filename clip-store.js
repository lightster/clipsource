import BrowserStorage from './browser-storage.js';
import Clip from './clip.js';

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
