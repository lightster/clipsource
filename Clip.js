export default {
  init(props) {
    Object.assign(this, props);
  },

  async image(name) {
    return this[name];
  }
};
