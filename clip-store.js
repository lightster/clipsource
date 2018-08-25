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

  listDetails() {
    if (this.details) {
      return this.details;
    }

    this.details = new Promise(resolve => chrome.storage.local.get('clips', ({clips}) => {
      resolve(clips);
    }));

    return this.details;
  }
};

export default ClipStore;
