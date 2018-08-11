(function () {
  document.addEventListener('copy', () => {
    setTimeout(() => {
      const og = {};
      for (const tag of document.querySelectorAll('meta[property^="og:"]')) {
        og[tag.getAttribute('property').substring(3)] = tag.getAttribute('content');
      }

      chrome.runtime.sendMessage({
        action: 'copy',
        title: document.title,
        clippedTime: Date.now(),
        og,
        window: {width: window.innerWidth, height: window.innerHeight},
        selectionCoordinates: window.getSelection().getRangeAt(0).getBoundingClientRect(),
        url: location.href
      });
    });
  });
})();

