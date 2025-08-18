import { useState } from 'react'
import { useStore } from '../store/useStore'
import { EmojiPicker } from './EmojiPicker'
export function ChildForm(){
  const [name,setName]=useState(''); const [emoji,setEmoji]=useState<string>()
  return (<div className="card space-y-3"><h3 className="font-semibold">Add Child</h3>
    <div className="grid sm:grid-cols-2 gap-3"><div><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Child name"/></div><div><label>Avatar</label><div className="mt-1"><EmojiPicker value={emoji} onChange={setEmoji}/></div></div></div>
    <button className="btn-primary" onClick={()=>{ if(!name.trim()){alert('Name required');return} if(!emoji){alert('Pick an avatar');return} try{ useStore.getState().addChild({name,avatarEmoji:emoji}); setName(''); setEmoji(undefined) }catch(e:any){ alert(e.message) } }}>Save Child</button>
  </div>)
}
