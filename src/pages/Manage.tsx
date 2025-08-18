import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ChildForm } from '../components/ChildForm'
import { TaskForm } from '../components/TaskForm'
import { PinGate } from '../components/PinGate'
import type { Weekday } from '../utils/constants'

export default function ManagePage() {
  return (
    <PinGate>
      <ManageInner />
    </PinGate>
  )
}

function ManageInner() {
  const s = useStore()
  const [pin, setPin] = useState(s.config.pin || '1234')
  const [hint, setHint] = useState(s.config.pinHint || '')
  const [rq, setRq] = useState(s.config.recoveryQ || 'Recovery question')
  const [ra, setRa] = useState(s.config.recoveryA || '')

  // Task edit state (UI only)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const editingTask = s.tasks.find(t => t.id === editingTaskId) || null

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <ChildForm />

        {!editingTask && <TaskForm />}
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
        <div className="card">
          <h3 className="font-semibold mb-2">Children</h3>
          <ul className="space-y-1">
            {s.children.map(c => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="text-2xl">{c.avatarEmoji}</span>
                <span>{c.name}</span>
              </li>
            ))}
            {s.children.length === 0 && <p className="text-sm text-muted">No children yet.</p>}
          </ul>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Tasks</h3>
          <ul className="divide-y divide-line">
            {s.tasks.map(t => (
              <li key={t.id} className="py-2 flex items-center gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted">
                    {t.points} pts • {t.activeDays.join(', ')} • Assigned to:&nbsp;
                    {t.childIds.map(id => s.children.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="btn-outline" onClick={() => setEditingTaskId(t.id)}>Edit</button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (confirm(`Delete task “${t.title}”? This cannot be undone.`)) {
                        useStore.getState().removeTask(t.id)
                        if (editingTaskId === t.id) setEditingTaskId(null)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {s.tasks.length === 0 && <p className="text-sm text-muted">No tasks yet.</p>}
        </div>

        <div className="card space-y-2">
          <h3 className="font-semibold">Settings</h3>
          <div>
            <label>Money conversion ($ per point)</label>
            <input
              type="number" min="0" step="0.01"
              value={s.config.moneyPerPoint}
              onChange={e => useStore.getState().setRate(parseFloat(e.target.value || '0'))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><label>PIN</label><input value={pin} onChange={e => setPin(e.target.value)} /></div>
            <div><label>PIN Hint</label><input value={hint} onChange={e => setHint(e.target.value)} /></div>
            <div><label>Recovery Question</label><input value={rq} onChange={e => setRq(e.target.value)} /></div>
            <div><label>Recovery Answer</label><input value={ra} onChange={e => setRa(e.target.value)} /></div>
            <div className="sm:col-span-2 flex gap-2">
              <button className="btn-outline" onClick={() => useStore.getState().setPIN(pin, hint, rq, ra)}>
                Save PIN & Recovery
              </button>
              <button className="btn-ghost" onClick={() => useStore.getState().relock()}>
                Lock Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
