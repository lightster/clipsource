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

export default {capturePlainText, captureHtml};
