(function () {
  document.addEventListener('copy', () => {
    chrome.runtime.sendMessage({
      action: 'copy',
      title: document.title,
      url: location.href
    });
  });
})();

