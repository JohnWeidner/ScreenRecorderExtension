navigator.webkitGetUserMedia({audio:true, video:false}, function(stream) {}, getUserMediaError);
function getUserMediaError(error) {
  console.log('navigator.webkitGetUserMedia() error: ', error);
}