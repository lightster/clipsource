(function () {
  window.innerHeight = 1000;
  const doc = document;
  const buffer = doc.createElement('div');

  const constrainBox = (inner, width, height) => {
    return {
      left: Math.max(inner.left, 0),
      top: Math.max(inner.top, 0),
      width: Math.min(inner.width, width),
      height: Math.min(inner.height, height)
    };
  };

  chrome.storage.local.get(['history', 'recent'], storage => {
    for (let clip of storage.history) {//}.slice(-11, -10)) {
      if (!clip.selectionCoordinates || !clip.window) {
        continue;
      }

      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let img = new Image();

      let screenshot;

      canvas.width = 516;
      canvas.height = 290;
      ctx.imageSmoothingQuality = 'high';

      img.onload = () => {
        let coords = constrainBox(clip.selectionCoordinates, img.width, img.height);

        let mapped = {};
        if (coords.width / coords.height > canvas.width / canvas.height) {
          if (coords.width <= canvas.width) {
            mapped.width = canvas.width;
          } else {
            mapped.width = canvas.width * 1.2;
          }
          mapped.height = (mapped.width * canvas.height / canvas.width);
        } else {
          if (coords.height <= canvas.height) {
            mapped.height = canvas.height;
          } else {
            mapped.height = canvas.height * 1.2;
          }
          mapped.width = (mapped.height * canvas.width / canvas.height);
        }

        mapped.left = Math.max(
          0,
          Math.min(
            coords.left - mapped.width / 2 + coords.width / 2,
            clip.window.width - mapped.width
          )
        );
        mapped.top = Math.max(
          0,
          Math.min(
            coords.top - mapped.height / 2 + coords.height / 2,
            clip.window.height - mapped.height
          )
        );

        mapped.left *= img.width / clip.window.width;
        mapped.top *= img.height / clip.window.height;
        mapped.width *= img.width / clip.window.width;
        mapped.height *= img.height / clip.window.height;

        console.log(coords);
        console.log(mapped.left, mapped.top, mapped.width, mapped.height, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, mapped.left, mapped.top, mapped.width, mapped.height, 0, 0, canvas.width, canvas.height);
        // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // ctx.strokeStyle = 'black';
        // ctx.strokeRect(mapped.left, mapped,top, mapped.width, mapped.height);
        screenshot = canvas.toDataURL('image/png');
        // screenshot = clip.screenshot;

        console.log(clip);
        // console.log(screenshot);

        const clipDiv = doc.createElement('div');
        clipDiv.setAttribute('class', 'clip');
        clipDiv.innerHTML = `
          <div class="clip-screenshot" style="background-image: url(${screenshot});">
            <div class="clip-summary">
              mapped: (${mapped.left} ${mapped.top} ${mapped.width} ${mapped.height})<br />
              coords: (${coords.left} ${coords.top} ${coords.width} ${coords.height})<br />
              canvas: (${canvas.width} ${canvas.height})<br />
              clip: (${img.width} ${img.height})<br />
              window: (${clip.window.width} ${clip.window.height})<br />
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
      };
      img.src = clip.screenshot;
    }

  });
})();

