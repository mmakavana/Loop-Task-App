import { ALLOWED_EMOJI } from '../utils/constants'
export function EmojiPicker({value,onChange}:{value?:string,onChange:(v:string)=>void}){
  return (<div className="grid grid-cols-8 gap-2">{ALLOWED_EMOJI.map(e=> <button type="button" key={e} className={'text-2xl '+(value===e?'ring-2 ring-primary rounded-md':'')} onClick={()=>onChange(e)} aria-label={'Emoji '+e}>{e}</button>)}</div>)
}
