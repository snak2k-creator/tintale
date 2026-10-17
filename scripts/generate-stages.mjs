import { solve, pour, solved } from '../src/game/puzzle.ts';
import { writeFileSync, mkdirSync } from 'node:fs';
let seed=2601017;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const stages=[], unique=new Set();
for(let id=1;id<=45;id++) {
  const colors=id<=2?2:id<=15?3:id<=25?4:6, empties=id<=35?2:1;
  let accepted=false;
  for(let attempt=0;attempt<1000&&!accepted;attempt++) {
    const b=Array.from({length:colors+empties},(_,i)=>i<colors?[i,i,i,i]:[]);
    const reverse=[];
    for(let step=0;step<(id<=5?12+id*3:45+id*2);step++) {
      const choices=[];
      for(let i=0;i<b.length;i++)for(let j=0;j<b.length;j++) {
        if(i===j||!b[i].length||b[j].length===4)continue;
        if(b[i].length>1&&b[i].at(-1)!==b[i].at(-2))continue;
        if(reverse.length&&reverse.at(-1)[0]===j&&reverse.at(-1)[1]===i)continue;
        choices.push([i,j]);
      }
      if(!choices.length)break;
      const [i,j]=choices[Math.floor(random()*choices.length)];b[j].push(b[i].pop());reverse.push([i,j]);
    }
    // Expert candidates are independently solver-verified; no unchecked shuffle is shipped.
    if(id>=36){const pool=Array.from({length:colors*4},(_,i)=>Math.floor(i/4));for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}for(let i=0;i<colors;i++)b[i]=pool.slice(i*4,i*4+4);b[colors]=[];}
    const key=b.map(x=>x.join('')).sort().join('|');
    if(solved(b)||unique.has(key))continue;
    const transitions=b.reduce((sum,x)=>sum+x.slice(1).filter((c,i)=>c!==x[i]).length,0);
    if(transitions<(id<=5?2:id<=15?3:id<=25?5:id<=35?8:11))continue;
    const answer=solve(b,180000);if(!answer||answer.length<(id<=5?3:id<=35?7:22))continue;
    let check=b;for(const [i,j] of answer){check=pour(check,i,j);if(!check)throw Error('Illegal saved answer');}
    if(!solved(check))throw Error('Unsolved');
    const tier=id<=5?'チュートリアル':id<=15?'かんたん':id<=25?'ふつう':id<=35?'むずかしい':'エキスパート';
    stages.push({id,colors,empties,tier,board:b,solution:answer,par:answer.length}); unique.add(key); accepted=true;
    console.log(`Stage ${id}: ${tier}, ${answer.length} moves`);
  }
  if(!accepted)throw Error(`Could not generate ${id}`);
}
mkdirSync('src/data',{recursive:true});writeFileSync('src/data/stages.json',JSON.stringify(stages));
