import * as EBML from './';
import {Decoder, Encoder, tools} from './';
import EBMLReader from './EBMLReader';

window.OurRecorder = async function (stream: string) {
  const decoder = new Decoder();
  const reader = new EBMLReader();
  reader.logging = true;

  let tasks = Promise.resolve(void 0);
  let jumpStop = Promise.resolve(void 0);
  let webM = new Blob([], {type: "video/webm"});

  //const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
   window.rec = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp8, opus"'});

  const ondataavailable = (ev: BlobEvent)=>{
    const chunk = ev.data;
    webM = new Blob([webM, chunk], {type: chunk.type});
    console.log(chunk.size, webM.size);
    const task = async ()=>{
      const buf = await readAsArrayBuffer(chunk);
      const elms = decoder.decode(buf);
      elms.forEach((elm)=>{ reader.read(elm); });
    };
    tasks = tasks.then(()=> task() );
  };

  rec.addEventListener("dataavailable", ondataavailable);

  // if set timeslice, bug occur on firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1272371
  // rec.start(100);
  rec.start();

  //await sleep(10 * 1000);  
 
  let count = 0;
  while(webM.size === 0){
/*    if(count > 10){
      alert("MediaRecorder did not record anything");
      throw new Error("MediaRecorder did not record anything");
}*/
    await sleep(1*1000); // wait dataavailable event
    count++;
}

  rec.removeEventListener("dataavailable", ondataavailable);
  rec.stream.getTracks().map((track) => { track.stop(); });

  await tasks; // wait data processing
  reader.stop();
  

  /*const raw_video = document.createElement("video");
  raw_video.src = URL.createObjectURL(webM);
  raw_video.controls = true;

  put(raw_video, "media-recorder original(not seekable)");*/

//  const infos = [
/*    {duration: reader.duration, title: "add duration only (seekable but slow)"},
{cues: reader.cues, title: "add cues only (seekable file)"},*/
//    {duration: reader.duration, cues: reader.cues, title: "add duration and cues (valid seekable file)"},
//  ];
//  for(const info of infos){
  const info = {duration: reader.duration, cues: reader.cues, title: "add duration and cues (valid seekable file)"};
    const refinedMetadataBuf = tools.putRefinedMetaData(reader.metadatas, info);
    const webMBuf = await readAsArrayBuffer(webM);
    const body = webMBuf.slice(reader.metadataSize);
    const refinedWebM = new Blob([refinedMetadataBuf, body], {type: webM.type});

    // logging

    //console.group(info.title);
    const refinedBuf = await readAsArrayBuffer(refinedWebM);
    const _reader = new EBMLReader();
    _reader.logging = true;
    new Decoder().decode(refinedBuf).forEach((elm)=> _reader.read(elm) );
    _reader.stop();
    //console.groupEnd();
	
    var b = URL.createObjectURL(refinedWebM);
	var a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	a.href = b;
	a.download = "screenVideo.webm";
	a.click();
}

function put(elm: HTMLElement, title: string): void {
  const h1 = document.createElement("h1");
  h1.appendChild(document.createTextNode(title));
  document.body.appendChild(h1);
  document.body.appendChild(elm);
}

function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = ()=>{ resolve(reader.result); };
    reader.onerror = (ev)=>{ reject(ev.error); };
  });
}

function sleep(ms: number): Promise<any>{
  return new Promise((resolve)=> setTimeout(resolve, ms) );
}

// MediaRecorder API
interface BlobEvent extends Event {
  data: Blob;
}

declare class MediaRecorder extends EventTarget {
  constructor(stream: MediaStream, opt: any);
  start(timeslice?: number): void;
  stop(): void;
  mimeType: string; 
  state: "inactive"|"recording"|"paused";
  stream: MediaStream;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  ondataavailable?: (ev: BlobEvent)=> void;
  onerror?: (ev: ErrorEvent)=> void;
  addEventListener(event: "dataavailable", callback: (ev: BlobEvent)=> any);
  requestData(): Blob;
}



//main();
