import { DOGS, type DogId } from '../data/catalog';
import { unlocked, type Save } from './progression';
/** How a dog uses a placed piece of furniture: `seat` puts it on top (share of the item's height), `side` beside it. */
export const FURNITURE_USE:Record<string,{seat?:number;side?:number;size:number;expression:number;text:string}>={
 bed:{seat:.3,size:.95,expression:6,text:'ふかふかベッドで、すやすや。'},
 sofa:{seat:.36,size:.8,expression:1,text:'ソファでくつろぎ中。'},
 cushion:{seat:.48,size:.85,expression:6,text:'クッションにまるくなってお昼寝。'},
 rug:{seat:.2,size:.5,expression:2,text:'カーペットでごろごろ。'},
 table:{side:1,size:.9,expression:1,text:'テーブルのそばで、おやつ待ち。'},
 plant:{side:-1,size:.9,expression:3,text:'グリーンのにおいをくんくん。'},
 plush:{side:1,size:.9,expression:2,text:'くまのぬいぐるみと遊んでいる。'},
 toybox:{side:-1,size:.9,expression:2,text:'おもちゃ箱をごそごそ。'},
};
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
