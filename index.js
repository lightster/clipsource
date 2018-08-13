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

        const clipDiv = doc.createElement('div');
        clipDiv.setAttribute('class', 'clip');
        clipDiv.setAttribute('data-clipsource-uid', uid);
        clipDiv.innerHTML = `
          <div class="clip-screenshot" style="background-image: url(${clip.thumbnail.dataUrl});">
            <div class="clip-summary"></div>
          </div>
        `;

        const summaryDiv = clipDiv.querySelector('.clip-summary');
        summaryDiv.appendChild(doc.createTextNode(summary));

        buffer.appendChild(clipDiv);
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

  const isInExtensionPopup = () => {
    return location.hash === '#/popup';
  };
})();
