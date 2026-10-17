import { describe,it,expect } from 'vitest';
import stages from '../data/stages.json';
import { DOGS, ITEMS } from '../data/catalog';
import { cloneBoard,legal,pour,solved,solve, type Board } from './puzzle';
import { buy,claim,dailyStage,equip,finish,jstDate,moveSession,newSave,readSave,restartSession,rewardTotal,savedRoute,startSession,undoSession,unlocked, type Save } from './progression';
const clearSave=(id=1,moves=999,daily:string|null=null):Save=>({...newSave(),session:{stage:id,daily,board:[[0,0,0,0],[1,1,1,1],[],[]],history:[],moves}});
describe('one layer bottle rules',()=>{
 it('rejects empty source',()=>expect(legal([[],[]],0,1)).toBe(false));
 it('rejects overflow',()=>expect(pour([[0],[0,0,0,0]],0,1)).toBeNull());
 it('rejects other colors',()=>expect(pour([[0],[1]],0,1)).toBeNull());
 it('rejects self pour and invalid indices',()=>{expect(legal([[0]],0,0)).toBe(false);expect(legal([[0]],0,10)).toBe(false);});
 it('moves exactly one layer to same color',()=>expect(pour([[0,0],[0]],0,1)).toEqual([[0],[0,0]]));
 it('allows empty destination without mutating source',()=>{const b=[[1,0],[]];expect(pour(b,0,1)).toEqual([[1],[0]]);expect(b).toEqual([[1,0],[]]);});
 it('requires all colors to be complete',()=>{expect(solved([[0,0],[0,0],[]])).toBe(false);expect(solved([[],[]])).toBe(false);expect(solved([[0,0,0,0],[1,1,1,1],[]])).toBe(true);expect(solved([[0,0,1,0]])).toBe(false);});
 it('undo restores board and count',()=>{let s=startSession(newSave(),1);const initial=s.session!.board;const [a,b]=stages[0].solution[0];s=moveSession(s,a,b);expect(s.session!.moves).toBe(1);s=undoSession(s);expect(s.session!.board).toEqual(initial);expect(s.session!.moves).toBe(0);});
 it('restart restores the fixed board',()=>{let s=startSession(newSave(),1);const [a,b]=stages[0].solution[0];s=moveSession(s,a,b);expect(restartSession(s).session).toEqual(startSession(newSave(),1).session);});
 it('cannot move after solved',()=>{const s=clearSave();expect(moveSession(s,0,2)).toBe(s);});
 it('hint solver handles dead ends safely',()=>expect(solve([[0,1,0,1],[1,0,1,0]])).toBeNull());
});
describe('45 verified fixed stages',()=>{
 it('contains expected tier distribution and no duplicate boards',()=>{expect(stages).toHaveLength(45);expect(['チュートリアル','かんたん','ふつう','むずかしい','エキスパート'].map(t=>stages.filter(s=>s.tier===t).length)).toEqual([5,10,10,10,10]);expect(new Set(stages.map(s=>s.board.map(x=>x.join('')).sort().join('|'))).size).toBe(45);});
 for(const stage of stages)it(`stage ${stage.id} conserves colors and has a fully legal saved answer`,()=>{expect(stage.board.length).toBe(stage.colors+stage.empties);for(let c=0;c<stage.colors;c++)expect(stage.board.flat().filter(x=>x===c)).toHaveLength(4);let b:Board=cloneBoard(stage.board);for(const [a,z] of stage.solution){expect(legal(b,a,z)).toBe(true);b=pour(b,a,z)!;}expect(solved(b)).toBe(true);});
 it('solver solves every board independently',()=>{for(const stage of stages){const route=solve(stage.board);expect(route).not.toBeNull();let b=stage.board;for(const [a,z] of route!)b=pour(b,a,z)!;expect(solved(b)).toBe(true);}});
 it('cached hints follow current board',()=>{let s=startSession(newSave(),1);expect(savedRoute(s.session!)![0]).toEqual(stages[0].solution[0]);const [a,b]=stages[0].solution[0];s=moveSession(s,a,b);expect(savedRoute(s.session!)![0]).toEqual(stages[0].solution[1]);});
});
describe('rewards, purchases, saving',()=>{
 it('awards 30/40/60 coins total',()=>expect([0,1,2,3].map(rewardTotal)).toEqual([0,30,40,60]));
 it('first 1 star, upgrade to 2 then 3 pays only differences',()=>{let r=finish(clearSave())!;expect(r.coins).toBe(30);r=finish({...r.save,session:{...clearSave().session!,moves:Math.ceil(stages[0].par*1.5)}})!;expect(r.coins).toBe(10);r=finish({...r.save,session:{...clearSave().session!,moves:stages[0].par}})!;expect(r.coins).toBe(20);expect(r.save.coins).toBe(60);});
 it('replay never duplicates stage rewards or unlock events',()=>{const r=finish(clearSave(3,0))!;expect(r.newDogs).toEqual(['chai']);const again=finish({...r.save,session:clearSave(3,0).session})!;expect(again.coins).toBe(0);expect(again.newDogs).toEqual([]);expect(finish(r.save)).toBeNull();});
 it('daily reward is once per date and does not unlock story stages',()=>{const r=finish(clearSave(3,0,'2026-10-17'))!;expect(r.coins).toBe(50);expect(r.newDogs).toEqual([]);expect(r.save.stars).toEqual({});expect(finish({...r.save,session:clearSave(3,0,'2026-10-17').session})!.coins).toBe(0);expect(finish({...r.save,session:clearSave(3,0,'2026-10-18').session})!.coins).toBe(50);});
 it('blocks buying without funds and prevents duplicate purchase',()=>{const s=newSave();expect(buy(s,'hat')).toBe(s);let b=buy({...s,coins:200},'hat');expect(b.coins).toBe(110);expect(buy(b,'hat')).toBe(b);expect(b.owned).toEqual(['hat']);});
 it('only equips owned clothes onto unlocked dogs',()=>{const s={...newSave(),coins:200};expect(equip(s,'hat','sora')).toBe(s);const b=buy(s,'hat');expect(equip(b,'hat','chai')).toBe(b);expect(equip(b,'hat','sora').outfits.sora).toBe('hat');expect(equip(b,'plant','sora')).toBe(b);});
 it('mission rewards can only be claimed once',()=>{const s={...newSave(),clears:3};expect(claim(newSave(),'three').coins).toBe(0);const b=claim(s,'three');expect(b.coins).toBe(40);expect(claim(b,'three')).toBe(b);});
 it('restores progress, board, undo, costumes, furniture, bond and partner',()=>{let s=startSession({...newSave(),coins:300,stars:{1:3,2:3,3:3},partner:'chai'},4);s=buy(s,'hat');s=buy(s,'plant');s=equip(s,'hat','chai');s.slots[0]='plant';s.bond.chai=34;const [a,b]=stages[3].solution[0];s=moveSession(s,a,b);expect(readSave(JSON.stringify(s))).toEqual(s);expect(undoSession(readSave(JSON.stringify(s))).session!.moves).toBe(0);});
 it('recovers malformed and incompatible saves safely',()=>{for(const s of ['garbage','{}','null','{"version":1}'])expect(readSave(s)).toEqual(newSave());expect(readSave(JSON.stringify({...newSave(),coins:-4}))).toEqual(newSave());});
 it('discards an invalid puzzle snapshot',()=>{const s=startSession(newSave(),1);s.session!.board[0].push(99);expect(readSave(JSON.stringify(s)).session).toBeNull();});
 it('uses JST midnight and a deterministic daily stage',()=>{expect(jstDate(new Date('2026-10-17T14:59:59Z'))).toBe('2026-10-17');expect(jstDate(new Date('2026-10-17T15:00:00Z'))).toBe('2026-10-18');expect(dailyStage('2026-10-17')).toBe(dailyStage('2026-10-17'));expect(dailyStage('2026-10-17')).toBeGreaterThanOrEqual(16);});
});
describe('canonical characters',()=>{
 it('starts with dachshund Sora as sole partner',()=>{const s=newSave();expect(s.partner).toBe('sora');expect(unlocked(s).map(x=>x.id)).toEqual(['sora']);expect(DOGS.find(x=>x.id==='sora')!.breed).toBe('ダックスフント');expect(DOGS.find(x=>x.id==='leo')!.breed).toBe('コーギー');expect(DOGS).toHaveLength(8);});
 for(const dog of DOGS.filter(x=>x.stage>0))it(`${dog.name} unlocks only at stage ${dog.stage}`,()=>{expect(unlocked({...newSave(),stars:{[dog.stage-1]:3}}).some(x=>x.id===dog.id)).toBe(false);expect(unlocked({...newSave(),stars:{[dog.stage]:1}}).some(x=>x.id===dog.id)).toBe(true);});
 it('all 8 unlocked together and valid owned catalog',()=>{const s={...newSave(),stars:Object.fromEntries(stages.map(s=>[s.id,3]))};expect(unlocked(s)).toHaveLength(8);expect(new Set(ITEMS.map(x=>x.id)).size).toBe(ITEMS.length);});
});
