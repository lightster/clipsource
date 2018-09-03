import Clip from './clip.js';
import Clipboard from './clipboard.js';
import Image from './image.js';

(function () {
  const saveClipboard = async clip => {
    clip.clipboard = {
      plain: await Clipboard.capturePlainText(clip),
      html: await Clipboard.captureHtml(clip)
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
