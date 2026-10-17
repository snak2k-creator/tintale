import { solve, type Board } from './puzzle';
self.onmessage=(event:MessageEvent<Board>)=>self.postMessage(solve(event.data));
