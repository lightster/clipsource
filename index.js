import ClipStore from './clip-store.js';

(function () {
  const doc = document;
  let content;

  const isInExtensionPopup = () => {
    return location.hash === '#/popup';
  };

  const setClipAction = function (uid, action) {
    this.setAttribute('data-clipsource-uid', uid);
    this.setAttribute('data-clipsource-action', action);
  };

  const render = renderer => {
    const output = html => {
      content.innerHTML = '';
      content.appendChild(html);
    };

    renderer(output);
  };

  const cloneTemplate = (id, selectors = {}) => {
    const fragment = document.importNode(document.querySelector(`#${id}`).content, true);

    Object.keys(selectors).forEach(key => {
      fragment[key] = fragment.querySelector(selectors[key]);
      fragment[key].setClipAction = setClipAction;
    });

    return fragment;
  };

  const createFromTemplate = name => {
    if (name === 'list/clip') {
      const dom = cloneTemplate('list-clip-template', {
        clip: '.clip',
        screenshot: '.clip-screenshot',
        summary: '.clip-summary',
        deleteAction: '.clip-action-delete',
        copyAction: '.clip-action-copy'
      });

      return dom;
    }

    if (name === 'clip/details') {
      const dom = cloneTemplate('clip-details-template', {
        clipDetails: '.clip-details',
        clipTitle: '.clip-title',
        clipTime: '.clip-time',
        clipScreenshot: '.clip-screenshot',
        clipboardPlain: '.clip-clipboard-plain',
        clipboardHtml: '.clip-clipboard-html'
      });

      return dom;
    }
  };

  const renderers = {
    index: async output => {
      const clipStore = ClipStore.instance();
      const clipList = await clipStore.list();
      if (!clipList) {
        return;
      }

      const buffer = doc.createElement('div');
      buffer.setAttribute('class', 'clips');

      for (const uid of clipList) {
        const clip = await clipStore.loadById(uid);

        if (clip.deletedAt) {
          continue;
        }

        let summary = clip.clipboard.plain.trim();
        if (summary.length > 60) {
          summary = summary.substr(0, 25) + ' ... ' + summary.substr(summary.length - 25);
        }

        const thumbnail = await clip.image('thumbnail');

        const div = createFromTemplate('list/clip');
        div.clip.setClipAction(uid, 'view');
        div.deleteAction.setClipAction(uid, 'delete');
        div.copyAction.setClipAction(uid, 'copy');
        div.screenshot.setAttribute(
          'style',
          `background-image: url(${thumbnail.dataUrl});`
        );
        div.summary.textContent = summary;

        buffer.appendChild(div);
      }

      output(buffer);
    },

    clip: uid => async output => {
      const clipStore = ClipStore.instance();
      const clip = await clipStore.loadById(uid);
      const thumbnail = await clip.image('thumbnail');

      const dom = createFromTemplate('clip/details');
      dom.clipTitle.textContent = (clip.og.title || clip.og.title);
      dom.clipTime.textContent = (new Date(clip.clippedTime)).toLocaleString();
      dom.clipScreenshot.setAttribute(
        'style',
        `background-image: url(${thumbnail.dataUrl}); width: ${thumbnail.width}px; height: ${thumbnail.height}px;`
      );
      dom.clipboardPlain.textContent = clip.clipboard.plain;
      dom.clipboardHtml.innerHTML = clip.clipboard.html;

      output(dom);
    }
  };

  const route = () => {
    if (location.hash.match(/^#\/clip\/([^/]+)/)) {
      const [, uid] = location.hash.match(/^#\/clip\/([^/]+)/);
      return renderers.clip(uid);
    }

    return renderers.index;
  };

  window.addEventListener('load', () => {
    content = document.getElementById('content');

    if (isInExtensionPopup()) {
      const baseTag = document.createElement('base');
      baseTag.setAttribute('target', 'clipsource');
      document.getElementsByTagName('head')[0].appendChild(baseTag);
    }

    render(route());
  });

  const actions = {
    view: (clip, event) => {
      const clipUrl = `#/clip/${clip.uid}`;
      const modifierKey = event.ctrlKey || event.metaKey;

      if (isInExtensionPopup() || modifierKey) {
        window.open(clipUrl, modifierKey ? '_blank' : 'clipsource');
      } else {
        location.hash = clipUrl;
      }
    },

    delete: (clip, event) => {
      clip.deletedAt = Date.now();

      chrome.storage.local.get(['clips'], storage => {
        storage.clips[clip.uid] = clip;
        chrome.storage.local.set({clips: storage.clips}, () => render(route()));
      });
    },

    copy: (clip, event) => {
      const listener = event => {
        event.target.removeEventListener('copy', listener);

        event.clipboardData.setData('text/plain', clip.clipboard.plain);
        event.clipboardData.setData('text/html', clip.clipboard.html);

        event.preventDefault();
      };

      event.target.addEventListener('copy', listener);
      document.execCommand('copy');
    }
  };

  document.addEventListener('click', event => {
    let {target} = event;
    while (target && target.hasAttribute && !target.hasAttribute('data-clipsource-uid')) {
      target = target.parentNode;
    }

    if (!target.hasAttribute || !target.hasAttribute('data-clipsource-uid')) {
      return;
    }

    event.stopPropagation();

    const uid = target.getAttribute('data-clipsource-uid');
    const action = target.getAttribute('data-clipsource-action');

    ClipStore.loadById(uid).then(clip => {
      actions[action](clip, event);
    });
  });

  window.addEventListener('hashchange', event => {
    render(route());
  });
})();
