import Clip from './clip.js';
import Image from './image.js';

(function () {
  const capturePlainText = clip => new Promise((resolve, reject) => {
    const body = document.getElementsByTagName('body')[0];
    const buffer = document.createElement('textarea');

    body.appendChild(buffer);

    buffer.value = '';
    buffer.addEventListener('paste', event => {
      setTimeout(() => {
        body.removeChild(buffer);

        resolve(buffer.value);
      });
    });
    buffer.select();

    if (!document.execCommand('paste')) {
      console.log('Could not retrieve contents from clipboard.');
    }
  });

  const captureHtml = clip => new Promise((resolve, reject) => {
    const body = document.getElementsByTagName('body')[0];
    const buffer = document.createElement('div');

    body.appendChild(buffer);

    buffer.setAttribute('contenteditable', true);
    buffer.innerHTML = '';
    buffer.addEventListener('paste', event => {
      setTimeout(() => {
        body.removeChild(buffer);

        resolve(buffer.innerHTML);
      });
    });
    buffer.focus();

    if (!document.execCommand('paste')) {
      console.log('Could not retrieve contents from clipboard.');
    }
  });

  const saveClipboard = async clip => {
    clip.clipboard = {
      plain: await capturePlainText(clip),
      html: await captureHtml(clip)
    };
  };

  const saveImages = async clip => {
    const {screenshot, image} = await Image.captureScreenshot();
    clip.screenshot = screenshot;
    clip.thumbnail = await Image.createThumbnail(clip, image);
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const clip = Clip.Init(request);
    Promise.all([saveClipboard(clip), saveImages(clip)]).then(() => {
      if (request.action !== 'copy') {
        return;
      }

      clip.save();
    });
  });
})();
