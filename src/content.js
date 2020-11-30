// This is used?
console.log('Content.js');

document.body.innerHTML += '<div id="cursor" style="opacity:0;"></div>';
var cursorOffset = {
  left: 16,
  top: 16,
};
var $cursor = document.getElementById('cursor');
document.body.addEventListener(
  'mouseup',
  function (e) {
    chrome.runtime.sendMessage({ checkRecState: 'what' }, function (response) {
      if (response.state == 'recording') {
        setTimeout(function () {
          $cursor.style.opacity = 1;
          $cursor.style.left = e.pageX - cursorOffset.left + 'px';
          $cursor.style.top = e.pageY - cursorOffset.top + 'px';
          setTimeout(function () {
            fadeOutEffect($cursor);
          }, 200);
        }, 80);
      }
    });
  },
  false
);
function fadeOutEffect(fadeTarget) {
  var fadeEffect = setInterval(function () {
    if (!fadeTarget.style.opacity) {
      fadeTarget.style.opacity = 1;
    }
    if (fadeTarget.style.opacity < 0.1) {
      clearInterval(fadeEffect);
    } else {
      fadeTarget.style.opacity -= 0.1;
    }
  }, 50);
}
