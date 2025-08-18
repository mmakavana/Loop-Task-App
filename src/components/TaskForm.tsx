import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { WEEKDAYS, Weekday } from '../utils/constants'

type Props = {
  // when absent -> create mode; when present -> edit mode
  initial?: { id: string; title: string; points: number; activeDays: Weekday[]; childIds: string[] }
  onDone?: () => void
}

export function TaskForm({ initial, onDone }: Props) {
  const s = useStore()
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(1)
  const [days, setDays] = useState<Weekday[]>([])
  const [childIds, setChildIds] = useState<string[]>([])

  useEffect(() => {
    if (!initial) return
    setTitle(initial.title)
    setPoints(initial.points)
    setDays(initial.activeDays)
    setChildIds(initial.childIds)
  }, [initial])

  function toggleDay(d: Weekday) { setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]) }
  function toggleChild(id: string) { setChildIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) }

  const submit = () => {
    if (!title.trim()) { alert('Title required'); return }
    if (days.length === 0) { alert('Pick at least one weekday'); return }
    if (childIds.length === 0) { alert('Assign to at least one child'); return }

    if (initial) {
      useStore.getState().updateTask(initial.id, { title, points, activeDays: days, childIds })
      onDone?.()
    } else {
      useStore.getState().addTask({ title, points, activeDays: days, childIds })
      setTitle(''); setPoints(1); setDays([]); setChildIds([])
    }
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">{initial ? 'Edit Task' : 'Add Task'}</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <div><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Homework" /></div>
        <div><label>Points</label><input type="number" min={0} value={points} onChange={e => setPoints(parseInt(e.target.value || '0'))} /></div>
      </div>

      <div>
        <label>Weekdays</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {WEEKDAYS.map(d => (
            <button type="button" key={d}
              className={`btn ${days.includes(d) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => toggleDay(d)}>{d}</button>
          ))}
        </div>
      </div>

      <div>
        <label>Assign to Children</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {s.children.map(c => (
            <button key={c.id} type="button"
              className={`btn ${childIds.includes(c.id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => toggleChild(c.id)}>
              <span className="mr-1">{c.avatarEmoji}</span>{c.name}
            </button>
          ))}
          {s.children.length === 0 && <p className="text-sm text-muted">Add a child first.</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-primary" onClick={submit}>{initial ? 'Save Changes' : 'Save Task'}</button>
        {initial && <button className="btn-ghost" onClick={onDone}>Cancel</button>}
      </div>
    </div>
  )
}
