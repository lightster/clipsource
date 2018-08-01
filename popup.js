(function () {
  const doc = document;
  const buffer = doc.createElement('div');

  chrome.storage.local.get(['recent'], storage => {
    console.log(storage.recent);
    for (let clip of storage.recent) {
      const clipDiv = doc.createElement('div');
      clipDiv.setAttribute('class', 'clip');
      clipDiv.innerHTML = `
        <div class="clip-screenshot" style="background-image: url(${clip.screenshot});"></div>
        <div class="clip-details">
          <h2><a href=""></a></h2>
          <blockquote></blockquote>
        </div>
      `;

      const link = clipDiv.querySelector('h2 a');
      link.setAttribute('href', clip.url);
      link.appendChild(doc.createTextNode(clip.title ? clip.title : link.hostname));

      clipDiv.querySelector('blockquote').appendChild(doc.createTextNode(clip.clipboardData));

      buffer.appendChild(clipDiv);
    }

    doc.getElementById('clips').innerHTML = buffer.innerHTML;
  });
})();

