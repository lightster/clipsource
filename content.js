(function () {
  document.addEventListener('copy', () => {
    chrome.runtime.sendMessage({
      action: 'copy',
      url: location.href
    });
  });
})();

