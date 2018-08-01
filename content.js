(function () {
  document.addEventListener('copy', () => {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'copy',
        title: document.title,
        url: location.href
      });
    });
  });
})();

