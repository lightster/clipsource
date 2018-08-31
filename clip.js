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
    if (!this['images']) {
      this['images'] = {};
    }

    const key = `image_${this.uid}_${name}`;

    if (this['images'][name]) {
      return this['images'][name];
    }

    this['images'][name] = BrowserStorage.get(key).then(storage => storage[key] || this[name]);

    return this['images'][name];
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

    const storage = {clips};
    storage[`image_${this.uid}_screenshot`] = this.screenshot;
    storage[`image_${this.uid}_thumbnail`] = this.thumbnail;

    return BrowserStorage.set(storage);
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
