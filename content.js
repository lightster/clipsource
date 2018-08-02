(function () {
  document.addEventListener('copy', () => {
    setTimeout(() => {
      let og = {};
      for (let tag of document.querySelectorAll('meta[property^="og:"]')) {
        og[tag.getAttribute('property').substring(3)] = tag.getAttribute('content');
      }

      chrome.runtime.sendMessage({
        action: 'copy',
        title: document.title,
        og: og,
        url: location.href
      });
    });
  });
})();

