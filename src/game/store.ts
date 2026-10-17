import { create } from 'zustand';
import { newSave, readSave, type Save } from './progression';
const KEY='tintale.save.v2';
let initial:Save;
try {initial=readSave(localStorage.getItem(KEY));}catch{initial=newSave();}
export const useGame=create<{save:Save;storageError:boolean;update:(fn:(s:Save)=>Save)=>void}>(set=>({save:initial,storageError:false,update:fn=>set(state=>{
  const save=fn(state.save);let storageError=false;
  try{localStorage.setItem(KEY,JSON.stringify(save));}catch{storageError=true;}
  return {save,storageError};
})}));
