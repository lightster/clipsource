(function () {
  const doc = document;
  const buffer = doc.createElement('div');

  window.addEventListener('load', () => {
    if (location.hash === '#/popup') {
      const baseTag = document.createElement('base');
      baseTag.setAttribute('target', '_blank');
      document.getElementsByTagName('head')[0].appendChild(baseTag);
    }
  });

  chrome.storage.local.get(['clips', 'history', 'recent'], storage => {
    if (!storage.clips) {
      return;
    }

    for (const uid of storage.recent) {
      const clip = storage.clips[uid];

      let summary = clip.clipboard.plain.trim();
      if (summary.length > 60) {
        summary = summary.substr(0, 25) + ' ... ' + summary.substr(summary.length - 25);
      }

      const clipDiv = doc.createElement('div');
      clipDiv.setAttribute('class', 'clip');
      clipDiv.innerHTML = `
        <div class="clip-screenshot" style="background-image: url(${clip.thumbnail.dataUrl});">
          <div class="clip-summary"></div>
        </div>
      `;

      const summaryDiv = clipDiv.querySelector('.clip-summary');
      summaryDiv.appendChild(doc.createTextNode(summary));

      buffer.appendChild(clipDiv);
      doc.getElementById('clips').innerHTML = buffer.innerHTML;
    }
  });
})();

