import BrowserStorage from './browser-storage.js';

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

    return BrowserStorage.set(storage).then(() => clip.save());
  });
};

let details = null;

const Clip = {
  async image(name) {
    return this[name];
  },

  async save() {
    if (!this.uid) {
      this.uid = btoa(this.clipboard.plain)
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 20)
        .concat('-')
        .concat(this.clippedTime);

      await saveToList(this);
    }

    const clips = await Clip.ListDetails();
    clips[this.uid] = this;

    return BrowserStorage.set({clips});
  },

  Init(props) {
    const clip = Object.create(Clip);

    Object.assign(clip, props);

    return clip;
  },

  List() {
    const key = 'history';
    return BrowserStorage.get([key]).then(storage => {
      return storage[key];
    });
  },

  async LoadById(uid) {
    const details = await Clip.ListDetails();

    return Clip.Init(details[uid]);
  },

  ListDetails() {
    if (details) {
      return details;
    }

    details = BrowserStorage.get(['clips']).then(({clips}) => {
      return clips;
    });

    return details;
  }
};

export default Clip;
