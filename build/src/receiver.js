'use strict';
const DESKTOP_MEDIA = ['screen', 'window', 'tab'];
var recVolume = 1;

var audioContext1 = new AudioContext();
var gainNode1 = audioContext1.createGain();

window.winRec = document.getElementById('recWindow');
window.winPause = document.getElementById('pauseWindow');
window.btnStart = document.getElementById('start');
window.talkToTestMic = document.getElementById('testMic');
window.btnStartTab = document.getElementById('starttab');
window.btnResume = document.getElementById('resume');
window.btnStop = document.getElementById('stop');
window.btnCancel = document.getElementById('cancel');
window.ourTimer = document.getElementById('timer');
window.volume = document.getElementById('volume');
window.tooLoud = document.getElementById('tooLoud');
window.monitorState = document.getElementById('monitorState');
window.waiting1 = document.getElementById('waiting1');
window.waiting2 = document.getElementById('waiting2');
window.waiting3 = document.getElementById('waiting3');

var savedVol = window.localStorage.getItem('recVolume');
if (savedVol == null) {
  savedVol = 0.5;
}
window.volume.value = savedVol;
recVolume = savedVol;
gainNode1.gain.value = savedVol;

chrome.runtime.sendMessage({ checkRecState: 'what' }, function (response) {
  // alert(response.state.value);
  // alert(response.state);

  if (response.state == 'recording' || response.state == 'paused') {
    winRec.style.display = 'none';
    winPause.style.display = 'block';
    PauseRecording();
    UpdateTimer(response.timer);
  }
  else if(response.state == 'inactive'){
    winRec.style.display = 'none';
    winPause.style.display = 'block';
    waitingDisplay();
  }
  else{
    winRec.style.display = 'block';
    winPause.style.display = 'none';
    talkToTestMic.style.display = 'block';
    btnStart.style.display = 'none';
  }
});

navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then(vumeter)
  .catch(getUserMediaError);

 

btnStartTab.addEventListener('click', function (event) {
  StartTabRecording();
});

btnStart.addEventListener('click', function (event) {
  StartRecording();
});

btnResume.addEventListener('click', function (event) {
  ResumeRecording();
});

btnStop.addEventListener('click', function (event) {
  StopRecording();
  console.log(new Date().toLocaleTimeString());
  waitingDisplay();
});

function waitingDisplay(){
  ourTimer.innerHTML = '';
  monitorState.innerHTML = '';
  btnResume.hidden = 'true';
  btnStop.hidden = 'true';

  waiting1.innerHTML = 'Preparing video. Please wait...<br/>';
  
  var myImage = new Image(120, 20);
  myImage.src = '../assets/busy.gif';  
  waiting2.append(myImage);
  btnCancel.hidden = false;

  setInterval(function(){ 
    waiting3.innerHTML = new Date().toLocaleTimeString();
  }, 1000);

}

btnCancel.addEventListener('click', function (event) {
  
  chrome.runtime.sendMessage({ cancelRecording: 'on' }, function (response) {});
  window.close();
});

volume.addEventListener('change', changeRecordingLevel);
volume.addEventListener('input', changeRecordingLevel);

function changeRecordingLevel(event) {
  recVolume = volume.value;
  gainNode1.gain.value = recVolume;
  window.localStorage.setItem('recVolume', recVolume);
}

function getUserMediaError(error) {
  alert('src/receiver.js: GetUserMedia() error: ', error);
}

function StartTabRecording() {
  chrome.runtime.sendMessage(
    { prepareTabRecording: 'on', recVolume: recVolume },
    function (response) {}
  );
  window.close();
}
function StartRecording() {
  chrome.runtime.sendMessage(
    { prepareRecording: 'on', recVolume: recVolume },
    function (response) {}
  );
  window.close();
}

function PauseRecording() {
  chrome.runtime.sendMessage({ pauseRecording: 'on' }, function (response) {});
}
function ResumeRecording() {
  chrome.runtime.sendMessage({ resumeRecording: 'on' }, function (response) {});
  window.close();
}

function StopRecording() {
  console.log(new Date().toLocaleTimeString());
  chrome.runtime.sendMessage({ stopRecording: 'on' }, function (response) {});
}

var meterWidth = 0;

var cnvs = document.getElementById('vumeter');
var cnvs_cntxt = cnvs.getContext('2d');

drawLoop();

function vumeter(stream) {
  var max_level_L = 0;
  var old_level_L = 0;

  var microphone1 = audioContext1.createMediaStreamSource(stream);
  var javascriptNode = audioContext1.createScriptProcessor(1024, 1, 1);

  microphone1.connect(gainNode1);
  gainNode1.connect(javascriptNode);
  javascriptNode.connect(audioContext1.destination);

  var greenCount = 0;
  var volume = 0;
  var averaging = 0.7;
  javascriptNode.onaudioprocess = function (event) {
    var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
    var sum = 0;
    var x;

    // Do a root-mean-square on the samples: sum up the squares...
    for (var i = 0; i < bufLength; i++) {
      x = buf[i];
      sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms = Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    volume = Math.max(rms, volume * averaging);

    meterWidth = (cnvs.width - 20) * volume * 4;
  };
}

var prevMeterWidth = 0;
var greenCount = 0;
function drawLoop(time) {
  if (meterWidth != prevMeterWidth) {
    prevMeterWidth = meterWidth;
    var width = prevMeterWidth;
    cnvs_cntxt.clearRect(0, 0, cnvs.width, cnvs.height);
    cnvs_cntxt.fillStyle = '#00ff00';
    var max_green = cnvs.width * 0.75;
    if (width > 20) {
      talkToTestMic.style.display = 'none';
      btnStart.style.display = 'block';
    }
    if (width > max_green) {
      cnvs_cntxt.fillRect(10, 10, max_green, cnvs.height - 20); // x,y,w,h
      cnvs_cntxt.fillStyle = '#ff0000';
      cnvs_cntxt.fillRect(max_green, 10, width - max_green, cnvs.height - 20); // x,y,w,h
      tooLoud.style.opacity = 1;
      greenCount = 0;
    } else {
      cnvs_cntxt.fillRect(10, 10, width, cnvs.height - 20); // x,y,w,h
      greenCount++;
      if (greenCount > 30) {
        tooLoud.style.opacity = 0;
      }
    }
  }
  // set up the next visual callback
  window.requestAnimationFrame(drawLoop);
}

function UpdateTimer(v) {
  var date = new Date(null);
  date.setSeconds(v);
  var result = date.toISOString().substr(11, 8);
  ourTimer.innerHTML = result;
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.storage.sync.set(
    {
      opt_curTab: extractHostname(tabs[0].url),
    },
    function () {}
  );
});

function extractHostname(url) {
  var hostname;
  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];
  return hostname;
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.showDialog == 'success'){
    chrome.runtime.sendMessage({ initialmsg: 'on' }, function (response) {});
    window.close();
  } 
});  