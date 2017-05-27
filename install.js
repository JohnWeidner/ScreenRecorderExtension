navigator.mediaDevices.getUserMedia({audio:true, video:false}).then(function(stream) {
  /* use the stream */
  console.log('getUserMedia() success: ', stream);
  stream.getAudioTracks()[0].stop();
  document.getElementById( 'overlayMsg' ).style.display = 'none';
}).catch(function(error) {
  console.log('getUserMedia() error: ', error);
});