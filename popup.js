(function () {
  const doc = document;
  const buffer = doc.createElement('div');

  chrome.storage.local.get(['history', 'recent'], storage => {
    for (const clip of storage.history) {
      if (!clip.thumbnail) {
        continue;
      }

      let summary = clip.clipboardData;
      if (summary.length > 60) {
        summary = summary.substr(0, 25) + ' ... ' + summary.substr(summary.length - 25);
      }

      const clipDiv = doc.createElement('div');
      clipDiv.setAttribute('class', 'clip');
      clipDiv.innerHTML = `
        <div class="clip-screenshot" style="background-image: url(${clip.thumbnail});">
          <div class="clip-summary">
            ${summary}
          </div>
        </div>
        <div class="clip-details">
          <h2><a href="" target="_blank"></a></h2>
          <blockquote></blockquote>
        </div>
      `;

      const link = clipDiv.querySelector('h2 a');
      link.setAttribute('href', clip.url);
      link.appendChild(doc.createTextNode(clip.title ? clip.title : link.hostname));

      clipDiv.querySelector('blockquote').appendChild(doc.createTextNode(clip.clipboardData));

      buffer.appendChild(clipDiv);
      doc.getElementById('clips').innerHTML = buffer.innerHTML;
    }
  });
})();

