(function () {
  const doc = document;
  let container, content;

  window.addEventListener('load', () => {
    container = document.getElementById('container');
    content = document.getElementById('content');

    if (isInExtensionPopup()) {
      const baseTag = document.createElement('base');
      baseTag.setAttribute('target', 'clipsource');
      document.getElementsByTagName('head')[0].appendChild(baseTag);
    }

    render(route());
  });

  const actions = {
    view: function (clip, event) {
      const clipUrl = `#/clip/${clip.uid}`;
      const modifierKey = event.ctrlKey || event.metaKey;

      if (isInExtensionPopup() || modifierKey) {
        window.open(clipUrl, modifierKey ? '_blank' : 'clipsource');
      } else {
        location.hash = clipUrl;
      }
    }
  };

  document.addEventListener('click', (event) => {
    let target = event.target;
    while (target && target.hasAttribute && !target.hasAttribute('data-clipsource-uid')) {
      target = target.parentNode;
    }

    if (!target.hasAttribute || !target.hasAttribute('data-clipsource-uid')) {
      return;
    }

    const uid = target.getAttribute('data-clipsource-uid');
    const action = target.getAttribute('data-clipsource-action');

    chrome.storage.local.get(['clips', 'history', 'recent'], storage => {
      const clip = storage.clips[uid];
      actions[action](clip, event);
    });

    event.stopPropagation();
  });

  window.addEventListener('hashchange', (event) => {
    render(route());
  });

  const renderers = {
    index: (output) => chrome.storage.local.get(['clips', 'history', 'recent'], storage => {
      if (!storage.clips) {
        return;
      }

      const buffer = doc.createElement('div');
      buffer.setAttribute('class', 'clips');

      for (const uid of storage.recent) {
        const clip = storage.clips[uid];

        let summary = clip.clipboard.plain.trim();
        if (summary.length > 60) {
          summary = summary.substr(0, 25) + ' ... ' + summary.substr(summary.length - 25);
        }

        const div = createFromTemplate('list/clip');
        div.clip.setClipAction(uid, 'view');
        div.screenshot.setAttribute(
          'style',
          `background-image: url(${clip.thumbnail.dataUrl});`
        );
        div.summary.textContent = summary;

        buffer.appendChild(div);
      }

      output(buffer);
    }),

    clip: (uid) => (output) => chrome.storage.local.get(['clips', 'history', 'recent'], storage => {
      const clip = storage.clips[uid];

      const dom = createFromTemplate('clip/details');
      dom.clipTitle.textContent = (clip.og.title || clip.og.title);
      dom.clipTime.textContent = (new Date(clip.clippedTime)).toLocaleString();
      dom.clipScreenshot.setAttribute(
        'style',
        `background-image: url(${clip.thumbnail.dataUrl}); width: ${clip.thumbnail.width}px; height: ${clip.thumbnail.height}px;`
      );
      dom.clipboardPlain.textContent = clip.clipboard.plain;
      dom.clipboardHtml.innerHTML = clip.clipboard.html;

      output(dom);
    })
  };

  const route = () => {
    if (location.hash.match(/^#\/clip\/([^\/]+)/)) {
      const [match, uid] = location.hash.match(/^#\/clip\/([^\/]+)/);
      return renderers.clip(uid);
    }

    return renderers.index;
  };

  const render = (renderer) => {
    const output = (html) => {
      content.innerHTML = '';
      content.appendChild(html);
    };

    renderer(output);
  };

  const createFromTemplate = (name) => {
    if (name === 'list/clip') {
      const dom = cloneTemplate('list-clip-template', {
        clip: '.clip',
        screenshot: '.clip-screenshot',
        summary: '.clip-summary'
      });

      return dom;
    } else if (name === 'clip/details') {
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

  const cloneTemplate = (id, selectors = {}) => {
    const fragment = document.importNode(document.querySelector(`#${id}`).content, true);

    Object.keys(selectors).forEach(key => {
      fragment[key] = fragment.querySelector(selectors[key]);
      fragment[key].setClipAction = setClipAction;
    });

    return fragment;
  };

  const isInExtensionPopup = () => {
    return location.hash === '#/popup';
  };

  const setClipAction = function (uid, action) {
    this.setAttribute('data-clipsource-uid', uid);
    this.setAttribute('data-clipsource-action', action);
  };
})();
