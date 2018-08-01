(function () {
  const doc = document;
  const buffer = doc.createElement('tbody');

  chrome.storage.local.get(['recent'], storage => {
    console.log(storage.recent);
    for (let request of storage.recent) {
      const tr = doc.createElement('tr');

      const image = doc.createElement('img');
      image.setAttribute('src', request.screenshot);
      image.setAttribute('height', 300);

      const sourceLink = doc.createElement('a');
      sourceLink.setAttribute('href', request.url);
      sourceLink.appendChild(doc.createTextNode(request.title ? request.title : request.url));

      const sourceCell = doc.createElement('td');
      const clipCell = doc.createElement('td');
      const imageCell = doc.createElement('td');

      sourceCell.appendChild(sourceLink);
      clipCell.appendChild(doc.createTextNode(request.clipboardData));
      imageCell.appendChild(image);

      tr.appendChild(sourceCell);
      tr.appendChild(clipCell);
      tr.appendChild(imageCell);

      buffer.appendChild(tr);
    }

    doc.getElementById('clips').querySelector('tbody').innerHTML = buffer.innerHTML;
  });
})();

