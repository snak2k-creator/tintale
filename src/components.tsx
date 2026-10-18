import { useEffect, useId, useState } from 'react';
import { COLOR_NAMES, COLORS, DOGS, ITEMS, SYMBOLS, type DogId } from './data/catalog';
import { useGame } from './game/store';

/** `outfit` overrides what the dog is wearing (used for try-on previews before buying). */
export function Dog({id,className='',expression=0,outfit:tryOn}:{id:DogId;className?:string;expression?:number;outfit?:string}) {
  const save=useGame(s=>s.save),d=DOGS.find(x=>x.id===id)!;
  const outfit=ITEMS.find(x=>x.id===(tryOn??save.outfits[id]));
  return <span className={`dog-wrap expression-${expression} ${className}`} role="img" aria-label={`${d.name}（${d.breed}）${outfit?`・${outfit.name}`:''}${expression===6?'・お昼寝中':''}`}><span className={`dog-sprite${outfit?` wear-${outfit.id}`:''}`} style={{backgroundPosition:`${(d.index%4)*100/3}% ${Math.floor(d.index/4)*100}%`}}/>{expression>0&&<span className="dog-emote">{['','♥','♪','!','…','✦','z z','♡'][expression]}</span>}</span>;
}
export function ItemArt({id}:{id:string}){if(ITEMS.some(x=>x.id===id&&x.kind==='outfit'))return <span className={`item-sprite item-dog wear-${id}`} aria-hidden="true"/>;if(id.startsWith('wall-'))return <span className={`item-sprite wall-swatch swatch-${id}`} aria-hidden="true"/>;const i=['ribbon','collar','hat','flower','hoodie','crown','bed','sofa','cushion','rug','table','plant','plush','toybox','wall-garden','floor-oak'].indexOf(id);const index=i<0?14:i;return <span className={`item-sprite item-${id}`} aria-hidden="true" style={{backgroundPosition:`${index%4*100/3}% ${Math.floor(index/4)*100/3}%`}}/>;}
const BOTTLE_OUTLINE=[[27,12],[53,12],[53,37],[61,50],[67,67],[67,146],[63,156],[55,158],[25,158],[17,156],[13,146],[13,67],[19,50],[27,37]];
export type LiquidBand={color:number;units:number};
/** Fill for colors that are still hidden on mystery stages. */
const MYSTERY='#b9ae9c';
function levelBands(liquid:LiquidBand[],tilt:number,symbols:boolean){
  // Draw the liquid in a world-aligned frame so the surface stays level while the glass tips.
  const r=tilt*Math.PI/180,sin=Math.sin(r),cos=Math.cos(r),lowest=Math.max(...BOTTLE_OUTLINE.map(([x,y])=>(x-40)*sin+(y-85)*cos));
  const span=Math.min(54/Math.max(Math.abs(cos),.01),108/Math.max(Math.abs(sin),.01)),unit=27*54/span,base=85+lowest+1;
  let filled=0;
  const visible=liquid.filter(l=>l.units>.001);
  // Each band overlaps the one below it so no seam shows between colors; only the surface is wavy.
  const bands=visible.map((l,j)=>{const bottom=j?base-filled+1:base-1;filled+=l.units*unit;const top=base-filled;
    return <g key={j} className="liquid-layer"><path d={tilt===0&&j===visible.length-1?`M12 ${top} Q25 ${top-4} 39 ${top} T68 ${top} V${bottom} H12Z`:tilt===0?`M12 ${top} H68 V${bottom} H12Z`:`M-120 ${top} H200 V${bottom} H-120Z`} fill={l.color<0?MYSTERY:COLORS[l.color]}/>{l.color<0&&tilt===0&&Array.from({length:Math.round(l.units)},(_,k)=><text key={k} x="40" y={base-filled+l.units*unit-(k+.5)*unit+6} textAnchor="middle" fill="#fffaf0" fontSize="17" fontWeight="700">?</text>)}{l.color>=0&&symbols&&tilt===0&&l.units>.6&&<text x="40" y={top+19} textAnchor="middle" fill="#fff" stroke="#00000059" strokeWidth="2" paintOrder="stroke" fontSize="15">{SYMBOLS[l.color]}</text>}</g>;});
  return tilt===0?bands:<g transform={`rotate(${-tilt} 40 85)`}>{bands}</g>;
}
export function BottleSvg({layers,symbols=false,tilt,liquid}:{layers:number[];symbols?:boolean;tilt?:number;liquid?:LiquidBand[]}){
  const uid=useId().replace(/:/g,'');
  return <svg viewBox="0 0 80 170" aria-hidden="true"><defs><clipPath id={`b${uid}`}><path d="M27 12H53V37Q53 43 61 50Q67 56 67 67V146Q67 158 55 158H25Q13 158 13 146V67Q13 56 19 50Q27 43 27 37Z"/></clipPath><linearGradient id={`g${uid}`} x1="0" x2="1"><stop offset="0" stopColor="white" stopOpacity=".38"/><stop offset=".16" stopColor="white" stopOpacity=".04"/><stop offset=".78" stopColor="#fff8e9" stopOpacity="0"/><stop offset="1" stopColor="white" stopOpacity=".28"/></linearGradient><linearGradient id={`glass${uid}`} x1="0" x2="1"><stop stopColor="#fff" stopOpacity=".7"/><stop offset=".45" stopColor="#fff" stopOpacity=".04"/><stop offset="1" stopColor="#fff" stopOpacity=".5"/></linearGradient></defs><path d="M25 12H55V37Q55 42 62 48Q70 56 70 67V146Q70 161 55 161H25Q10 161 10 146V67Q10 56 18 48Q25 42 25 37Z" fill="#fffdf7" fillOpacity=".32" stroke="#94836f" strokeWidth="2"/><path d="M25 12H55V37Q55 42 62 48Q70 56 70 67V146Q70 161 55 161H25Q10 161 10 146V67Q10 56 18 48Q25 42 25 37Z" fill="none" stroke={`url(#glass${uid})`} strokeWidth="4"/><g clipPath={`url(#b${uid})`}>{liquid?levelBands(liquid,tilt??0,symbols):layers.map((c,j)=><g key={j} className="liquid-layer"><path d={j===layers.length-1?`M12 ${159-(j+1)*27} Q25 ${155-(j+1)*27} 39 ${159-(j+1)*27} T68 ${159-(j+1)*27} V${j?160-j*27:158} H12Z`:`M12 ${159-(j+1)*27} H68 V${j?160-j*27:158} H12Z`} fill={c<0?MYSTERY:COLORS[c]}/>{c<0?<text x="40" y={178-(j+1)*27} textAnchor="middle" fill="#fffaf0" fontSize="17" fontWeight="700">?</text>:symbols&&<text x="40" y={178-(j+1)*27} textAnchor="middle" fill="#fff" stroke="#00000059" strokeWidth="2" paintOrder="stroke" fontSize="15">{SYMBOLS[c]}</text>}</g>)}<rect x="14" y="12" width="51" height="147" fill={`url(#g${uid})`}/></g><path d="M21 12Q21 8 25 8H55Q59 8 59 12Q59 16 55 16H25Q21 16 21 12Z" fill="#faf6e9" stroke="#9d8d79" strokeWidth="2"/><path d="M20 13H60" stroke="#fff" strokeOpacity=".8" strokeWidth="2"/><path d="M21 66V141" fill="none" stroke="white" strokeOpacity=".78" strokeWidth="3" strokeLinecap="round"/><path d="M58 72V141" fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="1.5" strokeLinecap="round"/>{!tilt&&<ellipse cx="40" cy="166" rx="29" ry="3" fill="#b2a28b" opacity=".12"/>}</svg>;
}
export function Bottle({layers,cover=0,index,selected=false,receiving=false,pouring=false,hint=false,invalid=false,disabled=false,onClick,symbols=false,decorative=false}:{layers:number[];cover?:number;index:number;selected?:boolean;receiving?:boolean;pouring?:boolean;hint?:boolean;invalid?:boolean;disabled?:boolean;onClick?:()=>void;symbols?:boolean;decorative?:boolean}) {
  const svg=<BottleSvg layers={hideCovered(layers,cover)} symbols={symbols}/>;
  if(decorative)return <span className="bottle decorative">{svg}</span>;
  return <button className={`bottle ${selected?'selected':''} ${receiving?'receiving':''} ${pouring?'pouring-source':''} ${hint?'hinted':''} ${invalid?'invalid':''} ${layers.length===4&&layers.every(x=>x===layers[0])?'complete':''}`} disabled={disabled} onClick={onClick} aria-label={`瓶${index+1}：${layers.length?hideCovered(layers,cover).map(c=>c<0?'ひみつ':COLOR_NAMES[c]).join('、'):'空'}`} aria-pressed={selected} data-bottle={index}>{svg}<span className="bottle-number">{index+1}</span></button>;
}
/** Replace the bottom `cover` units with -1 so they draw as hidden. */
export const hideCovered=(layers:number[],cover:number)=>layers.map((c,i)=>i<cover?-1:c);
type Box={x:number;y:number;w:number;h:number};
export type PourPlan={from:number;to:number;color:number;amount:number;source:number[];target:number[];sourceBox:Box;targetBox:Box;restY:number;symbols:boolean};
export const POUR_MS=1100;
const clamp=(v:number)=>Math.min(1,Math.max(0,v)),smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);},lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** Lift the source over the target's mouth, tip it until the level liquid runs out in a straight stream, then return it. */
export function PourAnimation({plan}:{plan:PourPlan}){
  const [t,setT]=useState(0);
  useEffect(()=>{let frame=0;const start=performance.now();const step=(now:number)=>{const v=clamp((now-start)/POUR_MS);setT(v);if(v<1)frame=requestAnimationFrame(step);};frame=requestAnimationFrame(step);return()=>cancelAnimationFrame(frame);},[plan]);
  const {sourceBox:a,targetBox:b,amount,source,target,color}=plan,sa=a.w/80,sb=b.w/80;
  const toward=b.x+b.w/2<a.x+a.w/2?-1:1,reach=165*sa,tipX=b.x+b.w/2,dir=tipX-toward*reach<0||tipX-toward*reach>innerWidth?-toward:toward,mouth=77*sa;
  const pourX=b.x+b.w/2-dir*5*sb,pourY=b.y+8*sb-12*sb;
  const tiltFor=(remaining:number)=>dir*(90-remaining*6);
  const centerFor=(angle:number)=>{const r=angle*Math.PI/180;return {x:pourX-mouth*Math.sin(r),y:pourY+mouth*Math.cos(r)};};
  const T1=.24,T2=.74,startCenter={x:a.x+a.w/2,y:a.y+a.h/2},restCenter={x:startCenter.x,y:plan.restY+a.h/2};
  const v=clamp((t-T1)/(T2-T1)),drained=t<T1?0:amount*smooth(v/.9),filled=t<T1?0:amount*smooth((v-.1)/.9);
  let angle:number,center:{x:number;y:number};
  if(t<T1){const u=smooth(t/T1),end=tiltFor(source.length);angle=end*u;const c=centerFor(end);center={x:lerp(startCenter.x,c.x,u),y:lerp(startCenter.y,c.y,u)-Math.sin(Math.PI*u)*14*sa};}
  else if(t<T2){angle=tiltFor(source.length-drained);center=centerFor(angle);}
  else{const u=smooth((t-T2)/(1-T2)),from=tiltFor(source.length-amount),c=centerFor(from);angle=from*(1-u);center={x:lerp(c.x,restCenter.x,u),y:lerp(c.y,restCenter.y,u)};}
  const sourceLiquid:LiquidBand[]=source.map((c,j)=>({color:c,units:j>=source.length-amount?clamp(source.length-drained-j):1}));
  const targetLiquid:LiquidBand[]=[...target.map(c=>({color:c,units:1})),{color,units:filled}];
  const surfaceY=b.y+sb*(159-(target.length+filled)*27),streamOn=t>T1+.04&&t<T2+.02;
  const streamTop=t>T2-.06?lerp(pourY,surfaceY,smooth((t-(T2-.06))/.08)):pourY,streamBottom=lerp(pourY,surfaceY,smooth((t-T1-.04)/.05));
  return <div className="pour-layer" aria-hidden="true">
    <div className="pour-clone pour-target" style={{left:b.x,top:b.y,width:b.w}}><BottleSvg layers={target} liquid={targetLiquid} symbols={plan.symbols}/></div>
    {streamOn&&streamBottom>streamTop&&<svg className="pour-stream"><rect className="stream-body" x={pourX-2.2*sb} y={streamTop} width={4.4*sb} height={streamBottom-streamTop} rx={2*sb} fill={COLORS[color]}/><ellipse className="stream-splash" cx={pourX} cy={streamBottom} rx={6*sb} ry={2*sb} fill={COLORS[color]} opacity=".85"/></svg>}
    <div className="pour-clone pour-source" data-pour-direction={dir<0?'left':'right'} style={{left:center.x-a.w/2,top:center.y-a.h/2,width:a.w,transform:`rotate(${angle}deg)`}}><BottleSvg layers={source} liquid={sourceLiquid} tilt={angle}/></div>
  </div>;
}
