(function () {
  const constrainBox = (inner, width, height) => {
    return {
      left: Math.max(inner.left, 0),
      top: Math.max(inner.top, 0),
      width: Math.min(inner.width, width),
      height: Math.min(inner.height, height)
    };
  };

  const constrainAxis = (point, max) => {
    return Math.max(0, Math.min(point, max));
  };

  const captureScreenshot = () => new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, dataUrl => {
      const image = new Image();

      image.addEventListener('load', () => {
        resolve({
          screenshot: {
            dataUrl,
            width: image.width,
            height: image.height
          },
          image
        });
      });

      image.src = dataUrl;
    });
  });

  const calculateViewPort = (clip, width, height) => {
    const coords = constrainBox(clip.selectionCoordinates, clip.screenshot.width, clip.screenshot.height);

    const mapped = {};
    if (coords.width / coords.height > width / height) {
      if (coords.width <= width) {
        mapped.width = width;
      } else {
        mapped.width = width * 1.2;
      }
      mapped.height = (mapped.width * height / width);
    } else {
      if (coords.height <= height) {
        mapped.height = height;
      } else {
        mapped.height = height * 1.2;
      }
      mapped.width = (mapped.height * width / height);
    }

    mapped.left = constrainAxis(
      coords.left - (mapped.width / 2) + (coords.width / 2),
      clip.window.width - mapped.width
    );
    mapped.top = constrainAxis(
      coords.top - (mapped.height / 2) + (coords.height / 2),
      clip.window.height - mapped.height
    );

    return mapped;
  };

  const scaleCoordinates = (mapped, scaleX, scaleY) => {
    return {
      left: mapped.left * scaleX,
      top: mapped.top * scaleY,
      width: mapped.width * scaleX,
      height: mapped.height * scaleY
    };
  };

  const createThumbnail = (clip, image) => new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 516;
    canvas.height = 290;
    ctx.imageSmoothingQuality = 'high';

    const mapped = calculateViewPort(clip, canvas.width, canvas.height);
    const scaled = scaleCoordinates(
      mapped,
      clip.screenshot.width / clip.window.width,
      clip.screenshot.height / clip.window.height
    );

    ctx.drawImage(
      image,
      scaled.left, scaled.top, scaled.width, scaled.height,
      0, 0, canvas.width, canvas.height
    );

    resolve({
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    });
  });

  const saveClipboard = clip => new Promise((resolve, reject) => {
    const buffer = document.getElementById('buffer');
    buffer.value = '';
    buffer.addEventListener('paste', event => {
      setTimeout(() => {
        clip.clipboardData = buffer.value;

        resolve();
      });
    });
    buffer.select();

    if (!document.execCommand('paste')) {
      console.log('Could not retrieve contents from clipboard.');
    }
  });

  const saveImages = async clip => {
    const {screenshot, image} = await captureScreenshot();
    clip.screenshot = screenshot;
    clip.thumbnail = await createThumbnail(clip, image);
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== 'copy') {
      return;
    }

    const clip = request;
    Promise.all([saveClipboard(clip), saveImages(clip)]).then(() => {
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
})();
