(function () {
  const doc = document;
  const buffer = doc.createElement('div');

  window.addEventListener('load', () => {
    console.log(location.hash);
    if (location.hash === '#/popup') {
      document.getElementById('brand-link').setAttribute('target', '_blank');
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
          <div class="clip-summary">${summary}</div>
        </div>
      `;

      buffer.appendChild(clipDiv);
      doc.getElementById('clips').innerHTML = buffer.innerHTML;
    }
  });
})();

