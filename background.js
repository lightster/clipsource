(function () {
  const constrainBox = (inner, width, height) => {
    return {
      left: Math.max(inner.left, 0),
      top: Math.max(inner.top, 0),
      width: Math.min(inner.width, width),
      height: Math.min(inner.height, height)
    };
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== 'copy') {
      return;
    }

    const clipboardPromise = new Promise((resolve, reject) => {
      const buffer = document.getElementById('buffer');
      buffer.value = '';
      buffer.addEventListener('paste', event => {
        setTimeout(() => {
          request.clipboardData = buffer.value;

          resolve();
        });
      });
      buffer.select();

      if (!document.execCommand('paste')) {
        console.log('Could not retrieve contents from clipboard.');
      }
    });

    const screenshotPromise = new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, dataUri => {
        request.screenshot = dataUri;
        createThumbnail(request, resolve);
      });
    });

    Promise.all([clipboardPromise, screenshotPromise]).then(() => {
      chrome.storage.local.get(['recent', 'history'], storage => {
        if (!storage.recent) {
          storage.recent = [];
        }
        if (!storage.history) {
          storage.history = [];
        }

        storage.recent.unshift(request);
        storage.recent = storage.recent.slice(0, 10);

        storage.history.push(request);

        chrome.storage.local.set(storage);
      });
    });
  });

  const createThumbnail = (clip, resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 516;
    canvas.height = 290;
    ctx.imageSmoothingQuality = 'high';

    img.addEventListener('load', () => {
      const coords = constrainBox(clip.selectionCoordinates, img.width, img.height);

      const mapped = {};
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
          coords.left - (mapped.width / 2) + (coords.width / 2),
          clip.window.width - mapped.width
        )
      );
      mapped.top = Math.max(
        0,
        Math.min(
          coords.top - (mapped.height / 2) + (coords.height / 2),
          clip.window.height - mapped.height
        )
      );

      mapped.left *= img.width / clip.window.width;
      mapped.top *= img.height / clip.window.height;
      mapped.width *= img.width / clip.window.width;
      mapped.height *= img.height / clip.window.height;

      ctx.drawImage(
        img,
        mapped.left, mapped.top, mapped.width, mapped.height,
        0, 0, canvas.width, canvas.height
      );
      clip.thumbnail = canvas.toDataURL('image/png');

      resolve();
    });
    img.src = clip.screenshot;
  };
})();
