let context:AudioContext|null=null;
let musicTimer:ReturnType<typeof setInterval>|null=null;
function tone(freq:number,duration:number,volume:number,type:OscillatorType='sine') {
  try {context??=new AudioContext();void context.resume();const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,context.currentTime);g.gain.exponentialRampToValueAtTime(.001,context.currentTime+duration);o.connect(g);g.connect(context.destination);o.start();o.stop(context.currentTime+duration);}catch{/* Audio is optional on restricted browsers. */}
}
export const chime=(success=false)=>{tone(success?659:523,.25,.045);if(success)setTimeout(()=>tone(784,.5,.04),130);};
export function music(on:boolean){if(musicTimer)clearInterval(musicTimer);musicTimer=null;if(on){const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];let i=0;tone(notes[i++],1.5,.013);musicTimer=setInterval(()=>tone(notes[i++%notes.length],1.7,.013),1100);}}
