chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'copy') {
    return;
  }

  const clipboardPromise = new Promise((resolve, reject) => {
    const buffer = document.getElementById('buffer');
    buffer.value = '';
    buffer.select();

    if (!document.execCommand('paste')) {
      console.log('Could not retrieve contents from clipboard.');
    }

    request.clipboardData = buffer.value;

    resolve();
  });

  const screenshotPromise = new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, dataUri => {
      request.screenshot = dataUri;

      resolve();
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
