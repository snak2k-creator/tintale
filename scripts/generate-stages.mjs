import { solve, pour, solved } from '../src/game/puzzle.ts';
import { writeFileSync, mkdirSync } from 'node:fs';
let seed=2601017;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const stages=[], unique=new Set();
// Stages 1-45 keep their original boards; 46-100 continue the same random sequence.
for(let id=1;id<=100;id++) {
  const colors=id<=5?3:id<=15?5:id<=25?7:id<=35?8:id<=80?9:10, empties=2;
  let accepted=false;
  for(let attempt=0;attempt<1000&&!accepted;attempt++) {
    const b=Array.from({length:colors+empties},(_,i)=>i<colors?[i,i,i,i]:[]);
    const reverse=[];
    for(let step=0;step<(id<=5?15+id*5:id<=35?65+id*3:120+id*5);step++) {
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
    // Shuffled candidates are independently solver-verified; no unchecked shuffle is shipped.
    if(id>=16){const pool=Array.from({length:colors*4},(_,i)=>Math.floor(i/4));for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}for(let i=0;i<colors;i++)b[i]=pool.slice(i*4,i*4+4);for(let i=colors;i<b.length;i++)b[i]=[];}
    const key=b.map(x=>x.join('')).sort().join('|');
    if(solved(b)||unique.has(key))continue;
    const transitions=b.reduce((sum,x)=>sum+x.slice(1).filter((c,i)=>c!==x[i]).length,0);
    if(transitions<(id<=5?4:id<=15?9:id<=25?14:id<=35?17:id<=45?20:id<=80?24:27))continue;
    const minMoves=id<=5?5:id<=15?11:id<=25?17:id<=35?20:id<=45?24:id<=80?30:36;
    // The in-game hint solver uses the default budget, so every stage must solve within it.
    const answer=solve(b);if(!answer||answer.length<minMoves)continue;
    let check=b;for(const [i,j] of answer){check=pour(check,i,j);if(!check)throw Error('Illegal saved answer');}
    if(!solved(check))throw Error('Unsolved');
    const tier=id<=5?'チュートリアル':id<=15?'かんたん':id<=25?'ふつう':id<=35?'むずかしい':id<=45?'エキスパート':id<=60?'マスター':id<=80?'ミステリー':'レジェンド';
    // From stage 61 on, colors under the top stay hidden until they are uncovered; allow a little more slack for stars.
    const hidden=id>60;
    stages.push({id,colors,empties,tier,hidden,board:b,solution:answer,par:hidden?Math.ceil(answer.length*1.2):answer.length}); unique.add(key); accepted=true;
    console.log(`Stage ${id}: ${tier}, ${answer.length} moves`);
  }
  if(!accepted)throw Error(`Could not generate ${id}`);
}
mkdirSync('src/data',{recursive:true});writeFileSync('src/data/stages.json',JSON.stringify(stages));
