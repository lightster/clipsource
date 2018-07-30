chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'copy') {
    return;
  }

  const buffer = document.getElementById('buffer');
  buffer.value = '';
  buffer.select();

  if (!document.execCommand('paste')) {
    console.log('Could not retrieve contents from clipboard.');
    return;
  }

  request.clipboardData = buffer.value;

  console.log(request);
});
