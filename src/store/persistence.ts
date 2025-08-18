import { STORAGE_KEY } from '../utils/constants'
import { AppState } from './types'
export function loadState():AppState|null{ try{ const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return null; return JSON.parse(raw) as AppState }catch{return null} }
let t:number|undefined; export function saveState(s:AppState){ try{ const d=JSON.stringify(s); if(t)window.clearTimeout(t); t=window.setTimeout(()=>localStorage.setItem(STORAGE_KEY,d),120)}catch{} }
