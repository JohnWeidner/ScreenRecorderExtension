navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then(function (stream) {
    /* use the stream */
    console.log('getUserMedia() success: ', stream);
    stream.getAudioTracks()[0].stop();
    setTimeout(flashArrow, 3000);
    document.getElementById('overlayMsg').style.display = 'none';
    document
      .getElementById('extensionArrow')
      .addEventListener('mouseover', function (event) {
        fadeOut = true;
      });
  })
  .catch(function (error) {
    console.log('src/install.js: getUserMedia() error: ', error);
  });

var fadeOut = false;
var fadeIn = true;

function flashArrow() {
  document.getElementById('extensionArrow').style.opacity = fadeOut
    ? 0
    : fadeIn
    ? 0.8
    : 0.1;
  if (!fadeOut) {
    fadeIn = !fadeIn;
    setTimeout(flashArrow, 700);
  }
}
