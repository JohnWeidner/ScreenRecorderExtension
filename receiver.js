'use strict';
const DESKTOP_MEDIA = ['screen', 'window', 'tab'];
var recVolume=1;

var audioContext1 = new AudioContext();
var gainNode1 = audioContext1.createGain();

window.winRec = document.getElementById("recWindow");
window.winPause = document.getElementById("pauseWindow");
window.btnStart = document.getElementById("start");
window.btnStartTab = document.getElementById("starttab");
window.btnResume = document.getElementById("resume");
window.btnStop = document.getElementById("stop");
window.ourTimer = document.getElementById("timer");
window.volume = document.getElementById("volume");

window.volume.value = window.localStorage.getItem( 'recVolume' );
recVolume=volume.value;
gainNode1.gain.value = recVolume;


chrome.runtime.sendMessage({checkRecState: "what"}, function(response) {
	if (response.state=="recording" || response.state=="paused"){
		winRec.style.display="none";
		winPause.style.display="block";
		PauseRecording();
		UpdateTimer(response.timer);
	}else{
		winRec.style.display="block";
		winPause.style.display="none";
	}
});

navigator.webkitGetUserMedia({audio:true, video:false}, function(stream) {vumeter(stream);}, getUserMediaError);

btnStartTab.addEventListener('click', function(event) {
	StartTabRecording();
});

btnStart.addEventListener('click', function(event) {
	StartRecording();
});

btnResume.addEventListener('click', function(event) {
	ResumeRecording();
});

btnStop.addEventListener('click', function(event) {
	StopRecording();
});

volume.addEventListener('change', changeRecordingLevel );
volume.addEventListener('input', changeRecordingLevel );

function changeRecordingLevel( event ) {
	recVolume=volume.value;
	gainNode1.gain.value = recVolume;
        window.localStorage.setItem( 'recVolume', recVolume );
}

function getUserMediaError(error) {
  console.log('navigator.webkitGetUserMedia() error: ', error);
}


function StartTabRecording(){
	chrome.runtime.sendMessage({prepareTabRecording: "on", recVolume: recVolume}, function(response) {});
	window.close();
}	
function StartRecording(){	
	chrome.runtime.sendMessage({prepareRecording: "on", recVolume: recVolume}, function(response) {});
	window.close();
}

function PauseRecording(){
		chrome.runtime.sendMessage({pauseRecording: "on"}, function(response) {});
}
function ResumeRecording(){
		chrome.runtime.sendMessage({resumeRecording: "on"}, function(response) {});
		window.close();
}

function StopRecording(){
	chrome.runtime.sendMessage({stopRecording: "on"}, function(response) {});
	window.close();
}

function vumeter(stream){
	var max_level_L = 0;
	var old_level_L = 0;
	var cnvs = document.getElementById("vumeter");
	var cnvs_cntxt = cnvs.getContext("2d");

	var microphone1 = audioContext1.createMediaStreamSource(stream);
	microphone1.connect(gainNode1);
	var dest1 = audioContext1.createMediaStreamDestination();
	gainNode1.connect(dest1);
	var javascriptNode = audioContext1.createScriptProcessor(1024, 1, 1);
	dest1.connect(javascriptNode);
	javascriptNode.connect(audioContext1.destination);
	javascriptNode.onaudioprocess = function(event){
		var inpt_L = event.inputBuffer.getChannelData(0);
		var instant_L = 0.0;
		var sum_L = 0.0;
		for(var i = 0; i < inpt_L.length; ++i) {
			sum_L += inpt_L[i] * inpt_L[i];
		}
		instant_L = Math.sqrt(sum_L / inpt_L.length);
		max_level_L = Math.max(max_level_L, instant_L);				
		instant_L = Math.max( instant_L, old_level_L -0.008 );
		old_level_L = instant_L;
		cnvs_cntxt.clearRect(0, 0, cnvs.width, cnvs.height);
		cnvs_cntxt.fillStyle = '#00ff00';
		cnvs_cntxt.fillRect(10,10,(cnvs.width-20)*(instant_L/max_level_L),(cnvs.height-20)); // x,y,w,h
	}
}

function UpdateTimer(v) {
	var date = new Date(null);
	date.setSeconds(v);
	var result = date.toISOString().substr(11, 8);
    ourTimer.innerHTML = result;
};