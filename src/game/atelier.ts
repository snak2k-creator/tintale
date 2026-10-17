import { DOGS, type DogId } from '../data/catalog';
import { unlocked, type Save } from './progression';
export function activity(save:Save,id:DogId,tick:number):{expression:number;action:string} {
 const dog=DOGS.find(d=>d.id===id)!,ids=unlocked(save).map(d=>d.id),bond=save.bond[id]??0;
 const beat=(tick+dog.index)%7;
 if(ids.includes('leo')&&(id==='sora'||id==='leo')&&tick%5===0)return {expression:2,action:'レオとソラは仲良く追いかけっこ。'};
 if(ids.includes('moka')&&ids.includes('mil')&&(id==='moka'||id==='mil')&&tick%4===1)return {expression:6,action:'ミルとモカは寄り添ってお昼寝。'};
 if(id==='chai'&&ids.length>1&&beat===1)return {expression:1,action:'チャイがそっと仲間に寄り添っている。'};
 if(save.slots.includes('toybox')&&(id==='coco'||id==='haru')&&beat<3)return {expression:2,action:`${dog.name}はおもちゃに夢中。`};
 if(save.slots.includes('bed')&&beat===3)return {expression:6,action:`${dog.name}はベッドで、すやすや。`};
 if(save.slots.includes('sofa')&&beat===4)return {expression:6,action:`${dog.name}はソファでひと休み。`};
 if(beat===0)return {expression:6,action:`${dog.name}は気持ちよさそうにお昼寝。`};
 return {expression:bond>=20&&beat===2?2:beat===5?1:0,action:`${dog.name}は${dog.action}。`};
}
