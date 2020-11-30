'use strict';

const DESKTOP_MEDIA = ['screen', 'window', 'tab'];
var recordingTab;
var recType;
var x = 1;
var rec = [];
var runner;
var OkToResume;
var volume;
var audioContext;
var gainNode;
var microphone;

console.log('in src/background.js');

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    chrome.tabs.create({
      url: chrome.extension.getURL('src/install.html'),
      active: true,
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //console.log( 'in listener recType=' + recType + ' pauseRecording=' + request.pauseRecording );
  if (request.prepareRecording == 'on') PrepareRecording(request.recVolume);
  if (request.prepareTabRecording == 'on')
    PrepareTabRecording(request.recVolume);
  if (request.stopRecording == 'on') StopRecording();
  if (request.pauseRecording == 'on') {
    if (recType == 'screen') PauseRecording();
    if (recType == 'tab') PauseTabRecording();
  }
  if (request.resumeRecording == 'on') {
    if (recType == 'screen') ResumeRecording();
    if (recType == 'tab') ResumeTabRecording();
  }
  if (request.checkRecState == 'what') {
    var curState = rec.state;
    sendResponse({ state: curState, timer: x });
  }
});

function PrepareTabRecording(recVolume) {
  recType = 'tab';
  volume = recVolume;
  chrome.tabCapture.capture(
    { audio: false, video: true },
    function (streamTab) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        recordingTab = tabs[0].id;
        StartRecording(streamTab);
      });
    }
  );
}

chrome.tabs.onActivated.addListener(function (e) {
  //console.log( 'in tabs.onActivated recType=' + recType + ' rec.state=' + rec.state );
  if (recType == 'tab' && rec.state == 'recording' && e.tabId != recordingTab) {
    PauseRecording();
    OkToResume = false;
    chrome.notifications.create('extfy1', {
      type: 'basic',
      iconUrl: 'assets/alert.png',
      title: 'ExtensionForYou',
      message: 'You left the tab being recorded. Recording is paused.',
      requireInteraction: true,
    });
  }
  if (recType == 'tab' && rec.state == 'paused' && e.tabId != recordingTab) {
    OkToResume = false;
    chrome.notifications.create('extfy1', {
      type: 'basic',
      iconUrl: 'assets/alert.png',
      title: 'ExtensionForYou',
      message: 'You left the tab being recorded. Recording is paused.',
      requireInteraction: true,
    });
  }
  if (recType == 'tab' && rec.state == 'paused' && e.tabId == recordingTab) {
    OkToResume = true;
    chrome.notifications.create('extfy1', {
      type: 'basic',
      iconUrl: 'assets/ok.png',
      title: 'ExtensionForYou',
      message: 'You are now ready to resume recording.',
      requireInteraction: true,
    });
  }
});

function ResumeTabRecording() {
  if (OkToResume) ResumeRecording();
}
function PauseTabRecording() {
  PauseRecording();
}
function PrepareRecording(recVolume) {
  recType = 'screen';
  volume = recVolume;
  chrome.desktopCapture.chooseDesktopMedia(DESKTOP_MEDIA, onAccessApproved);
}
function onAccessApproved(id, options) {
  //console.log( 'onAccessApproved id=' + id + ' options=' + options );
  if (!id) {
    //console.log('Access rejected.');
    return;
  }
  var constraints = {
    audio: false,
    video: {
      minFrameRate: 15,
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id,
        maxWidth: screen.width,
        maxHeight: screen.height,
        //maxWidth:1280,
        //maxHeight:720
      },
    },
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(StartRecording)
    .catch(getUserMediaError);
}
function StartRecording(stream) {
  audioContext = new AudioContext();
  gainNode = audioContext.createGain();
  runner = setInterval(mainTimer, 1000);

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (audioStream) {
      microphone = audioContext.createMediaStreamSource(audioStream);
      microphone.connect(gainNode);
      var dest = audioContext.createMediaStreamDestination();
      gainNode.connect(dest);
      gainNode.gain.value = volume;
      var firstAudioTrack = dest.stream.getAudioTracks()[0];
      stream.addTrack(firstAudioTrack);
      OurRecorder(stream);
    })
    .catch(getUserMediaError);

  chrome.browserAction.setIcon({ path: 'assets/icon_red.png' });
}
function getUserMediaError(error) {
  alert('src/background.js: getUserMedia() error: ', error);
}
function PauseRecording() {
  rec.pause();
  clearInterval(runner);
  chrome.browserAction.setIcon({ path: 'assets/icon.png' });
}
function ResumeRecording() {
  rec.resume();
  runner = setInterval(mainTimer, 1000);
  chrome.browserAction.setIcon({ path: 'assets/icon_red.png' });
  chrome.notifications.clear('extfy1');
}
function StopRecording() {
  chrome.browserAction.setBadgeText({ text: '' });
  clearInterval(runner);
  x = 1;
  rec.stop();
  chrome.browserAction.setIcon({ path: 'assets/icon.png' });
  chrome.notifications.clear('extfy1');
}
function mainTimer() {
  x += 1;
  var date = new Date(null);
  date.setSeconds(x);
  var result = date.toISOString().substr(11, 8);
}
