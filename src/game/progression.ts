import stages from '../data/stages.json';
import { DOGS, ITEMS, REWARD_ONLY, type DogId } from '../data/catalog';
import { cloneBoard, pour, solved, type Board, type Move } from './puzzle';
export type Session = {stage:number;daily:string|null;board:Board;history:Board[];moves:number};
export type Save = {version:2;started:boolean;coins:number;stars:Record<string,number>;partner:DogId;bond:Record<string,number>;owned:string[];outfits:Record<string,string>;slots:(string|null)[];wall:string;floor:string;claimed:string[];daily:string[];clears:number;pets:number;session:Session|null;settings:{sound:boolean;music:boolean;reduced:boolean;symbols:boolean}};
export const newSave = ():Save => ({version:2,started:false,coins:0,stars:{},partner:'sora',bond:{sora:0},owned:[],outfits:{},slots:[null,null,null],wall:'natural',floor:'natural',claimed:[],daily:[],clears:0,pets:0,session:null,settings:{sound:true,music:false,reduced:false,symbols:false}});
export const jstDate = (date=new Date()):string => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const dailyStage = (date:string):number => 16 + ([...date].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,17)%80);
/** On hidden-color stages, how many bottom units of each bottle have never been on top (and so stay hidden). */
export function covers(s:Session):number[] {
  if(!stages[s.stage-1]?.hidden)return s.board.map(()=>0);
  return s.board.map((_,i)=>Math.max(0,Math.min(...[...s.history,s.board].map(b=>b[i].length))-1));
}
/** First stage of each difficulty tier. These are always open, so any difficulty can be chosen at any time. */
export const TIER_STARTS:number[]=[...new Set(stages.map(x=>x.tier))].map(t=>stages.find(x=>x.tier===t)!.id);
export const canPlay=(s:Save,stage:number)=>stage===1||TIER_STARTS.includes(stage)||!!s.stars[stage-1]||!!s.stars[stage];
export const unlocked = (s:Save) => DOGS.filter(d=>d.stage===0 || !!s.stars[d.stage]);
export const rewardTotal = (stars:number):number => stars>=3?60:stars===2?40:stars===1?30:0;
export function startSession(s:Save,stage:number,daily:string|null=null):Save {
  const data=stages[stage-1];if(!data)return s;
  if(!daily && !canPlay(s,stage))return s;
  return {...s,started:true,session:{stage,daily,board:cloneBoard(data.board),history:[],moves:0}};
}
export function moveSession(s:Save,from:number,to:number):Save {
  const p=s.session;if(!p||solved(p.board))return s;
  const b=pour(p.board,from,to);if(!b)return s;
  return {...s,session:{...p,board:b,history:[...p.history,cloneBoard(p.board)],moves:p.moves+1}};
}
export function undoSession(s:Save):Save {
  const p=s.session;if(!p?.history.length)return s;
  return {...s,session:{...p,board:cloneBoard(p.history.at(-1)!),history:p.history.slice(0,-1),moves:p.moves-1}};
}
export function restartSession(s:Save):Save {
  const p=s.session;if(!p)return s;
  return {...s,session:{...p,board:cloneBoard(stages[p.stage-1].board),history:[],moves:0}};
}
export function finish(s:Save):{save:Save;stars:number;coins:number;newDogs:DogId[]} | null {
  const p=s.session;if(!p||!solved(p.board))return null;
  const par=stages[p.stage-1].par, rating=p.moves<=par?3:p.moves<=Math.ceil(par*1.5)?2:1;
  const old=unlocked(s).map(d=>d.id);let coins=0;
  let next:Save={...s,session:null,clears:s.clears+1,bond:{...s.bond,[s.partner]:Math.min(100,(s.bond[s.partner]??0)+5)}};
  if(p.daily){coins=s.daily.includes(p.daily)?0:50;next.daily=[...new Set([...s.daily,p.daily])];}
  else {const previous=s.stars[p.stage]??0;coins=Math.max(0,rewardTotal(rating)-rewardTotal(previous));next.stars={...s.stars,[p.stage]:Math.max(previous,rating)};}
  next.coins+=coins;
  const newDogs=unlocked(next).filter(d=>!old.includes(d.id)).map(d=>d.id);
  return {save:next,stars:rating,coins,newDogs};
}
export function buy(s:Save,id:string):Save {
  const item=ITEMS.find(x=>x.id===id);if(!item||REWARD_ONLY.includes(id)||s.owned.includes(id)||s.coins<item.price)return s;
  const bond={...s.bond};if(item.kind==='furniture')for(const dog of unlocked(s))bond[dog.id]=Math.min(100,(bond[dog.id]??0)+2);
  return {...s,coins:s.coins-item.price,owned:[...s.owned,id],bond};
}
export function equip(s:Save,id:string,dog:DogId):Save {
  if(!unlocked(s).some(d=>d.id===dog))return s;
  if(id && (!s.owned.includes(id)||ITEMS.find(x=>x.id===id)?.kind!=='outfit'))return s;
  return {...s,outfits:{...s.outfits,[dog]:id}};
}
export const MISSIONS=[
 {id:'three',name:'小さな一歩を、3回',text:'パズルを3回クリアする',target:3,reward:40,value:(s:Save)=>s.clears},
 {id:'stars',name:'きらきらのコレクター',text:'5ステージで星3を獲得する',target:5,reward:70,value:(s:Save)=>Object.values(s.stars).filter(x=>x===3).length},
 {id:'friends',name:'いっしょが、うれしい',text:'3匹をアトリエに迎える',target:3,reward:60,value:(s:Save)=>unlocked(s).length},
 {id:'furniture',name:'心地よい場所',text:'家具を1つ購入する',target:1,reward:30,value:(s:Save)=>s.owned.filter(id=>ITEMS.find(i=>i.id===id)?.kind==='furniture').length},
 {id:'outfit',name:'おしゃれの時間',text:'衣装を1つ身につける',target:1,reward:30,value:(s:Save)=>Object.values(s.outfits).filter(Boolean).length},
 {id:'all',name:'みんなのおうち',text:'8匹すべての仲間を迎える',target:8,reward:200,value:(s:Save)=>unlocked(s).length},
 {id:'pet',name:'やさしい手のひら',text:'仲間に10回ふれあう',target:10,reward:40,value:(s:Save)=>s.pets},
 {id:'clear50',name:'色の旅人',text:'50ステージをクリアする',target:50,reward:150,value:(s:Save)=>Object.keys(s.stars).length},
 {id:'stars150',name:'星あつめの名人',text:'星を150個あつめる',target:150,reward:200,value:(s:Save)=>Object.values(s.stars).reduce((a,b)=>a+b,0)},
 ...([['master','マスター','ヒーローマント','cape'],['mystery','ミステリー','魔法使いの帽子','wizard'],['legend','レジェンド','星のティアラ','tiara']] as const).map(([id,tier,name,item])=>{const ids=stages.filter(x=>x.tier===tier).map(x=>x.id);return {id,name:`${tier}制覇`,text:`${tier}の${ids.length}ステージをすべてクリアする`,target:ids.length,reward:100,item,itemName:name,value:(s:Save)=>ids.filter(i=>s.stars[i]).length};}),
 {id:'clear100',name:'100の色をそろえて',text:'100ステージすべてをクリアする',target:100,reward:500,value:(s:Save)=>Object.keys(s.stars).length},
];
export function claim(s:Save,id:string):Save {
  const m=MISSIONS.find(x=>x.id===id);if(!m||s.claimed.includes(id)||m.value(s)<m.target)return s;
  const item='item' in m?m.item:null;
  return {...s,coins:s.coins+m.reward,claimed:[...s.claimed,id],owned:item&&!s.owned.includes(item)?[...s.owned,item]:s.owned,bond:{...s.bond,[s.partner]:Math.min(100,(s.bond[s.partner]??0)+3)}};
}
export function readSave(raw:string|null):Save {
  if(!raw)return newSave();
  try {
    const p=JSON.parse(raw) as Save;
    // Items that were removed from the game are dropped, not treated as a corrupt save.
    if(Array.isArray(p?.owned)&&p.outfits&&typeof p.outfits==='object'){p.owned=p.owned.filter(id=>ITEMS.some(i=>i.id===id));for(const [dog,id] of Object.entries(p.outfits))if(id&&!p.owned.includes(id))delete (p.outfits as Record<string,string>)[dog];}
    if(p.version!==2||!Number.isSafeInteger(p.coins)||p.coins<0||!p.stars||!Array.isArray(p.owned)||!Array.isArray(p.slots)||p.slots.length!==3||!p.bond||!p.settings||!Array.isArray(p.claimed)||!Array.isArray(p.daily))return newSave();
    if(typeof p.started!=='boolean'||!Number.isSafeInteger(p.clears)||p.clears<0||!Number.isSafeInteger(p.pets)||p.pets<0||!p.outfits||typeof p.outfits!=='object'||typeof p.wall!=='string'||typeof p.floor!=='string')return newSave();
    if(p.owned.some(id=>!ITEMS.some(i=>i.id===id))||p.slots.some(id=>id!==null&&(!p.owned.includes(id)||ITEMS.find(i=>i.id===id)?.kind!=='furniture'))||Object.values(p.settings).some(v=>typeof v!=='boolean')||Object.values(p.bond).some(v=>typeof v!=='number'||v<0||v>100))return newSave();
    if(Object.entries(p.stars).some(([id,n])=>!stages[Number(id)-1]||![1,2,3].includes(n)))return newSave();
    const next={...newSave(),...p,settings:{...newSave().settings,...p.settings}};
    if(!unlocked(next).some(x=>x.id===next.partner))next.partner='sora';
    if(next.session){
      const ss=next.session,stage=stages[ss.stage-1];
      if(!stage||!Number.isInteger(ss.stage)||!(ss.daily===null||typeof ss.daily==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(ss.daily))||!Array.isArray(ss.history)||!Number.isInteger(ss.moves)||ss.moves<0||ss.moves!==ss.history.length)next.session=null;
      else {
        const valid=(b:Board)=>Array.isArray(b)&&b.length===stage.board.length&&b.every(x=>Array.isArray(x)&&x.length<=4&&x.every(c=>Number.isInteger(c)&&c>=0&&c<stage.colors))&&Array.from({length:stage.colors},(_,c)=>b.flat().filter(x=>x===c).length).every(n=>n===4);
        if(!valid(ss.board)||!ss.history.every(valid))next.session=null;
      }
    }
    return next;
  }catch{return newSave();}
}
export function savedRoute(s:Session):Move[]|null {
  const stage=stages[s.stage-1];let board=cloneBoard(stage.board);
  for(let i=0;i<=stage.solution.length;i++) {
    if(JSON.stringify(board)===JSON.stringify(s.board))return stage.solution.slice(i) as Move[];
    const move=stage.solution[i];if(move)board=pour(board,move[0],move[1])!;
  }
  return null;
}
