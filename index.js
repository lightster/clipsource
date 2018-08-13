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

  document.addEventListener('click', (event) => {
    let target = event.target;
    while (target && target.hasAttribute && !target.hasAttribute('data-clipsource-uid')) {
      target = target.parentNode;
    }

    if (!target.hasAttribute || !target.hasAttribute('data-clipsource-uid')) {
      return;
    }

    const uid = target.getAttribute('data-clipsource-uid');
    const clipUrl = `#/clip/${uid}`;
    if (isInExtensionPopup()) {
      window.open(clipUrl, 'clipsource');
    } else {
      location.hash = clipUrl;
    }
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

      for (const uid of storage.recent) {
        const clip = storage.clips[uid];

        let summary = clip.clipboard.plain.trim();
        if (summary.length > 60) {
          summary = summary.substr(0, 25) + ' ... ' + summary.substr(summary.length - 25);
        }

        const div = createFromTemplate('list/clip');
        div.clip.setAttribute('data-clipsource-uid', uid);
        div.screenshot.setAttribute(
          'style',
          `background-image: url(${clip.thumbnail.dataUrl});`
        );
        div.summary.textContent = summary;

        buffer.appendChild(div);
      }

      output(buffer.innerHTML);
    }),

    clip: (uid) => (output) => {
      output(uid);
    }
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
      content.innerHTML = html;
    };

    renderer(output);
  };

  const createFromTemplate = (name) => {
    if (name === 'list/clip') {
      const clone = cloneTemplate('list-clip-template');

      clone.clip = clone.querySelector('.clip');
      clone.screenshot = clone.querySelector('.clip-screenshot');
      clone.summary = clone.querySelector('.clip-summary');

      return clone;
    }
  };

  const cloneTemplate = (id) => {
    return document.importNode(document.querySelector(`#${id}`).content, true);
  };

  const isInExtensionPopup = () => {
    return location.hash === '#/popup';
  };
})();
