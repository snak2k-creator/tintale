export type Board = number[][];
export type Move = [number, number];
export const CAPACITY = 4;
export const cloneBoard = (b: Board): Board => b.map(x => [...x]);
export function legal(b: Board, from: number, to: number): boolean {
  const a = b[from], z = b[to];
  return from !== to && !!a?.length && !!z && z.length < 4 && (!z.length || a.at(-1) === z.at(-1));
}
export function pour(b: Board, from: number, to: number): Board | null {
  if (!legal(b, from, to)) return null;
  const next = cloneBoard(b); next[to].push(next[from].pop()!); return next;
}
export const solved = (b: Board): boolean => b.some(x => x.length > 0) && b.every(x => !x.length || (x.length === 4 && x.every(c => c === x[0])));
const canonical = (b: Board): string => b.map(x => x.join('')).sort().join('|');
export function solve(initial: Board, maxNodes = 150000): Move[] | null {
  if (solved(initial)) return [];
  const seen = new Set<string>(); let nodes = 0;
  function visit(b: Board, path: Move[], previous?: Move): Move[] | null {
    if (++nodes > maxNodes || path.length > 240) return null;
    if (solved(b)) return path;
    const key = canonical(b); if (seen.has(key)) return null; seen.add(key);
    const options: {move: Move; score: number}[] = [];
    for (let i = 0; i < b.length; i++) for (let j = 0; j < b.length; j++) {
      if (!legal(b,i,j) || (previous?.[0] === j && previous[1] === i)) continue;
      if (b[i].every(x=>x===b[i][0]) && (!b[j].length || b[i].length===4)) continue;
      // Identical empty destinations are equivalent.
      if (!b[j].length && b.findIndex(x=>!x.length) !== j) continue;
      options.push({move:[i,j],score:(b[j].length ? 10 : 0)+(b[j].length===3 ? 8:0)+(b[i].length>1 && b[i].at(-2)!==b[i].at(-1) ? 4:0)});
    }
    options.sort((a,z)=>z.score-a.score);
    for (const {move:[i,j]} of options) {const answer=visit(pour(b,i,j)!,[...path,[i,j]],[i,j]);if(answer)return answer;}
    return null;
  }
  return visit(initial,[]);
}
