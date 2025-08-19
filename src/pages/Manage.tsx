import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ChildForm } from '../components/ChildForm'
import { TaskForm } from '../components/TaskForm'
import { PinGate } from '../components/PinGate'
import { EmojiPicker } from '../components/EmojiPicker'
import type { Weekday } from '../utils/constants'

export default function ManagePage(){ return (<PinGate><ManageInner/></PinGate>) }

function ManageInner(){
  const s=useStore()
  const [pin,setPin]=useState(s.config.pin||'1234')
  const [showPin,setShowPin]=useState(false)     // 👁️ toggle
  const [hint,setHint]=useState(s.config.pinHint||'')
  const [rq,setRq]=useState(s.config.recoveryQ||'Recovery question')
  const [ra,setRa]=useState(s.config.recoveryA||'')

  // Task editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const editingTask = s.tasks.find(t => t.id === editingTaskId) || null

  // Child editing
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const editingChild = s.children.find(c => c.id === editingChildId) || null
  const [childName, setChildName] = useState('')
  const [childEmoji, setChildEmoji] = useState<string | undefined>(undefined)

  function startEditChild(id: string){
    const c = s.children.find(x=>x.id===id)
    if(!c) return
    setEditingChildId(c.id)
    setChildName(c.name)
    setChildEmoji(c.avatarEmoji)
  }
  function saveChildEdits(){
    if(!editingChildId) return
    if(!childName.trim()){ alert('Name required'); return }
    if(!childEmoji){ alert('Pick an avatar'); return }
    useStore.getState().updateChild(editingChildId, { name: childName.trim(), avatarEmoji: childEmoji })
    setEditingChildId(null)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        {/* Add child */}
        <ChildForm/>

        {/* Edit child (inline panel appears when selected) */}
        {editingChild && (
          <div className="card space-y-3">
            <h3 className="font-semibold">Edit Child</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label>Name</label>
                <input value={childName} onChange={e=>setChildName(e.target.value)} placeholder="Child name"/>
              </div>
              <div>
                <label>Avatar</label>
                <div className="mt-1"><EmojiPicker value={childEmoji} onChange={setChildEmoji}/></div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={saveChildEdits}>Save</button>
              <button className="btn-ghost" onClick={()=>setEditingChildId(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Add / Edit tasks */}
        {!editingTask && <TaskForm/>}
        {editingTask && (
          <TaskForm
            initial={{
              id: editingTask.id,
              title: editingTask.title,
              points: editingTask.points,
              activeDays: editingTask.activeDays as Weekday[],
              childIds: editingTask.childIds,
            }}
            onDone={() => setEditingTaskId(null)}
          />
        )}
      </div>

      <div className="space-y-4">
        {/* Children list with Edit/Delete */}
        <div className="card">
          <h3 className="font-semibold mb-2">Children</h3>
          <ul className="divide-y divide-line">
            {s.children.map(c=>(
              <li key={c.id} className="py-2 flex items-center gap-2">
                <span className="text-2xl">{c.avatarEmoji}</span>
                <span className="min-w-0 truncate">{c.name}</span>
                <div className="ml-auto flex gap-2">
                  <button className="btn-outline" onClick={()=> startEditChild(c.id)}>Edit</button>
                  <button className="btn-danger" onClick={()=>{
                    if(confirm(`Delete ${c.name}? This removes the child and their task assignments.`)){
                      useStore.getState().removeChild(c.id)
                      if(editingChildId===c.id) setEditingChildId(null)
                    }
                  }}>Delete</button>
                </div>
              </li>
            ))}
            {s.children.length===0 && <p className="text-sm text-muted">No children yet.</p>}
          </ul>
        </div>

        {/* Tasks list with Edit/Delete (unchanged behavior) */}
        <div className="card">
          <h3 className="font-semibold mb-3">Tasks</h3>
          <ul className="divide-y divide-line">
            {s.tasks.map(t=>(
              <li key={t.id} className="py-2 flex items-center gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted">
                    {t.points} pts • {t.activeDays.join(', ')} • Assigned to:&nbsp;
                    {t.childIds.map(id => s.children.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="btn-outline" onClick={()=> setEditingTaskId(t.id)}>Edit</button>
                  <button className="btn-danger" onClick={()=>{
                    if(confirm(`Delete task “${t.title}”? This cannot be undone.`)){
                      useStore.getState().removeTask(t.id)
                      if(editingTaskId===t.id) setEditingTaskId(null)
                    }
                  }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          {s.tasks.length===0 && <p className="text-sm text-muted">No tasks yet.</p>}
        </div>

        {/* Settings (PIN eye toggle + payout/rate) */}
        <div className="card space-y-3">
          <h3 className="font-semibold">Settings</h3>

          {/* Rate */}
          <div>
            <label>Money conversion ($ per point)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={s.config.moneyPerPoint}
              onChange={e=>useStore.getState().setRate(parseFloat(e.target.value||'0'))}
            />
          </div>

          {/* Payout mode */}
          <div>
            <label>Payout mode</label>
            <div className="mt-1 flex flex-col gap-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="payoutMode"
                  checked={(s.config.payoutMode ?? 'all_done') === 'all_done'}
                  onChange={()=>useStore.getState().setPayoutMode('all_done')}
                />
                <span>All tasks complete (payout only if all daily tasks are done)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="payoutMode"
                  checked={(s.config.payoutMode ?? 'all_done') === 'per_task'}
                  onChange={()=>useStore.getState().setPayoutMode('per_task')}
                />
                <span>Per task completed (payout for each completed task)</span>
              </label>
            </div>
          </div>

          {/* PIN + recovery (with visibility toggle) */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <label>PIN</label>
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e=>setPin(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-[30px] text-sm text-muted"
                onClick={()=>setShowPin(v=>!v)}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? '🙈' : '👁️'}
              </button>
            </div>
            <div>
              <label>PIN Hint</label>
              <input value={hint} onChange={e=>setHint(e.target.value)} />
            </div>
            <div>
              <label>Recovery Question</label>
              <input value={rq} onChange={e=>setRq(e.target.value)} />
            </div>
            <div>
              <label>Recovery Answer</label>
              <input value={ra} onChange={e=>setRa(e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button className="btn-outline" onClick={()=> useStore.getState().setPIN(pin,hint,rq,ra)}>
                Save PIN & Recovery
              </button>
              <button className="btn-ghost" onClick={()=> useStore.getState().relock()}>
                Lock Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
