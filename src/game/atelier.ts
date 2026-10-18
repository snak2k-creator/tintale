import { DOGS, type DogId } from '../data/catalog';
import { unlocked, type Save } from './progression';
/**
 * How a dog uses a placed piece of furniture: `seat` puts it on top (share of the item's height), `side` beside it.
 * `scale` sizes the piece against the dog's own width, so a bed fits one dog and the tent a little more.
 */
export const FURNITURE_USE:Record<string,{seat?:number;side?:number;scale:number;expression:number;text:string}>={
 bed:{seat:.3,scale:1.3,expression:6,text:'ふかふかベッドで、すやすや。'},
 tent:{seat:.14,scale:1.4,expression:1,text:'テントの中で、ひみつ基地ごっこ。'},
 cushion:{seat:.45,scale:1.1,expression:6,text:'クッションにまるくなってお昼寝。'},
 table:{side:1,scale:1.1,expression:1,text:'テーブルのそばで、おやつ待ち。'},
 plant:{side:-1,scale:.9,expression:3,text:'グリーンのにおいをくんくん。'},
 plush:{side:1,scale:.75,expression:2,text:'くまのぬいぐるみと遊んでいる。'},
 toybox:{side:-1,scale:.9,expression:2,text:'おもちゃ箱をごそごそ。'},
};
/** Spots on the floor, as feet positions in % of the scene. `slot` spots are where furniture goes. */
export const ROOM_SPOTS:{x:number;y:number;slot?:number}[]=[
 {x:20,y:80,slot:0},{x:50,y:93,slot:1},{x:80,y:80,slot:2},
 {x:34,y:69},{x:59,y:68},{x:11,y:97},{x:89,y:97},
];
/** At most this many dogs are out in the atelier at once. */
export const ROOM_LIMIT=3;
/**
 * One dog per spot. With `phase` ≥ 0, exactly one dog (taking turns) walks to a free spot, so the others stay put and
 * nobody ends up on top of another dog. `prefer` lists spots worth walking to (furniture in use). A negative phase only repairs the map (new dogs, removed spots).
 */
export function placeDogs(current:Record<string,number>,ids:string[],spots:number[],phase:number,prefer:number[]=[]):Record<string,number> {
 const next:Record<string,number>={},taken=new Set<number>();
 for(const id of ids){const at=current[id];if(at!==undefined&&spots.includes(at)&&!taken.has(at)){next[id]=at;taken.add(at);}}
 for(const id of ids)if(next[id]===undefined){const free=spots.find(x=>!taken.has(x));if(free===undefined)break;next[id]=free;taken.add(free);}
 if(phase<0||!ids.length)return next;
 // Two moves in three head for a free piece of furniture when there is one.
 const mover=ids[phase%ids.length],open=spots.filter(x=>!taken.has(x)),liked=open.filter(x=>prefer.includes(x)),free=phase%3&&liked.length?liked:open;
 if(free.length&&next[mover]!==undefined)next[mover]=free[(phase*7+3)%free.length];
 return next;
}
export function activity(save:Save,id:DogId,tick:number,using?:string|null):{expression:number;action:string} {
 const dog=DOGS.find(d=>d.id===id)!,use=using?FURNITURE_USE[using]:null,ids=unlocked(save).map(d=>d.id),bond=save.bond[id]??0;
 if(use)return {expression:use.expression,action:`${dog.name}は${use.text}`};
 const beat=(tick+dog.index)%7;
 if(ids.includes('leo')&&(id==='sora'||id==='leo')&&tick%5===0)return {expression:2,action:'レオとソラは仲良く追いかけっこ。'};
 if(ids.includes('moka')&&ids.includes('mil')&&(id==='moka'||id==='mil')&&tick%4===1)return {expression:6,action:'ミルとモカは寄り添ってお昼寝。'};
 if(id==='chai'&&ids.length>1&&beat===1)return {expression:1,action:'チャイがそっと仲間に寄り添っている。'};
 if(beat===0)return {expression:6,action:`${dog.name}は気持ちよさそうにお昼寝。`};
 return {expression:bond>=20&&beat===2?2:beat===5?1:0,action:`${dog.name}は${dog.action}。`};
}
