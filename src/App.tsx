import React, { useMemo, useState } from 'react'
import { Calendar, BarChart3, Settings, Info, Check } from 'lucide-react'

type Kid = { id: number; name: string; avatar: string }
type Task = { id: number; name: string; defaultPoints: number; daysOfWeek: number[]; assignedKidIds: number[] }
type Completion = { kidId: number; taskId: number; dateISO: string }

const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const Header: React.FC = () => (
  <header className="bg-loopGreen text-white py-5 shadow-soft">
    <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
      <div className="text-3xl font-bold">Loop</div>
      <div className="opacity-90">Do it. Earn it. Repeat it.</div>
    </div>
  </header>
)

function formatISO(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function App() {
  const [active, setActive] = useState<'board'|'calendar'|'manage'|'reports'|'info'>('board')
  const [selectedDate, setSelectedDate] = useState(formatISO(new Date()))

  // demo state
  const [kids, setKids] = useState<Kid[]>([
    { id: 1, name: 'Emma', avatar: '👧' },
    { id: 2, name: 'Liam', avatar: '👦' },
  ])
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'Make bed', defaultPoints: 2, daysOfWeek: [1,2,3,4,5,6,7], assignedKidIds: [1,2] },
    { id: 2, name: 'Dishes', defaultPoints: 3, daysOfWeek: [1,2,3,4,5,6,7], assignedKidIds: [1,2] },
  ])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [centsPerPoint, setCentsPerPoint] = useState(10)

  const tasksForKidOnDate = (kidId: number, dateISO: string) => {
    const dow = new Date(dateISO + 'T00:00:00').getDay()
    const adj = dow === 0 ? 7 : dow // make Sunday 7
    return tasks.filter(t => t.assignedKidIds.includes(kidId) && t.daysOfWeek.includes(adj))
  }

  const isCompleted = (kidId: number, taskId: number, dateISO: string) =>
    completions.some(c => c.kidId === kidId && c.taskId === taskId && c.dateISO === dateISO)

  const toggle = (kidId: number, taskId: number, dateISO: string) => {
    setCompletions(prev => {
      const exists = prev.find(c => c.kidId===kidId && c.taskId===taskId && c.dateISO===dateISO)
      return exists ? prev.filter(c => !(c.kidId===kidId && c.taskId===taskId && c.dateISO===dateISO))
                    : [...prev, { kidId, taskId, dateISO }]
    })
  }

  // ---- All-or-nothing payout logic ----
  const eligiblePointsByKid: Record<number, number> = useMemo(() => {
    // group completions per kid per date
    const perKid: Record<number, number> = {}
    for (const kid of kids) perKid[kid.id] = 0

    // consider every date we have completions for (plus selectedDate so "today" can star)
    const dates = new Set(completions.map(c => c.dateISO))
    dates.add(selectedDate)

    for (const dateISO of dates) {
      for (const kid of kids) {
        const due = tasksForKidOnDate(kid.id, dateISO)
        if (due.length === 0) continue
        const allDone = due.every(t => isCompleted(kid.id, t.id, dateISO))
        if (allDone) {
          perKid[kid.id] += due.reduce((s,t)=>s+t.defaultPoints,0)
        }
      }
    }
    return perKid
  }, [completions, kids, tasks, selectedDate])

  const Board = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e=>setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded border"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {kids.map(kid => {
          const due = tasksForKidOnDate(kid.id, selectedDate)
          const allDone = due.length>0 && due.every(t => isCompleted(kid.id, t.id, selectedDate))
          return (
            <div key={kid.id} className="bg-white rounded-xl shadow-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{kid.avatar}</div>
                  <div className="text-lg font-semibold">{kid.name}</div>
                </div>
                <div className={`text-sm ${allDone?'text-green-600':'text-gray-500'}`}>
                  {allDone ? 'All done!' : `Today: ${due.reduce((s,t)=>s+(isCompleted(kid.id,t.id,selectedDate)?t.defaultPoints:0),0)} pts`}
                </div>
              </div>
              <div className="space-y-2">
                {due.map(task => {
                  const done = isCompleted(kid.id, task.id, selectedDate)
                  return (
                    <button
                      key={task.id}
                      onClick={()=>toggle(kid.id, task.id, selectedDate)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
                        done ? 'bg-loopGreen text-white border-loopGreen' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded border ${done?'bg-white text-loopGreen border-white':'border-gray-300'}`}>
                          {done && <Check size={14}/>}
                        </span>
                        <span className="font-medium">{task.name}</span>
                      </div>
                      <span className={`text-sm ${done?'text-white':'text-gray-500'}`}>+{task.defaultPoints}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const CalendarView = () => {
    const today = new Date(selectedDate)
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    const cells: Date[] = []
    for (let i=0;i<42;i++){
      const d = new Date(start); d.setDate(start.getDate()+i); cells.push(d)
    }

    const isAllDone = (kidId:number, dateISO:string) => {
      const due = tasksForKidOnDate(kidId, dateISO)
      return due.length>0 && due.every(t => isCompleted(kidId, t.id, dateISO))
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-2">
          {dayNames.map(d => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map(d => {
            const ds = formatISO(d)
            const inMonth = d.getMonth()===today.getMonth()
            return (
              <div key={ds} className={`min-h-20 p-2 rounded border text-sm ${inMonth?'bg-white':'bg-gray-50'}`}>
                <div className={`font-semibold mb-1 ${inMonth?'text-gray-900':'text-gray-400'}`}>{d.getDate()}</div>
                <div className="space-y-1">
                  {kids.map(k => (
                    <div key={k.id} className="flex items-center gap-1">
                      <span>{k.avatar}</span>
                      {isAllDone(k.id, ds) && <span className="text-yellow-500">⭐</span>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const Reports = () => {
    const dollarsByKid = kids.map(k => (eligiblePointsByKid[k.id] * centsPerPoint)/100)
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="text-xl font-semibold mb-4">Totals (All-or-Nothing)</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Kid</th>
                  <th className="py-2 pr-4 text-right">Eligible Points</th>
                  <th className="py-2 pr-4 text-right">Estimated $</th>
                </tr>
              </thead>
              <tbody>
                {kids.map((k, idx) => (
                  <tr key={k.id} className="border-b">
                    <td className="py-2 pr-4 flex items-center gap-2"><span>{k.avatar}</span><span className="font-medium">{k.name}</span></td>
                    <td className="py-2 pr-4 text-right">{eligiblePointsByKid[k.id] || 0}</td>
                    <td className="py-2 pr-4 text-right">${dollarsByKid[idx].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">Money only counts on days the kid completes <b>all</b> their assigned tasks.</div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-soft p-5 max-w-md">
          <label className="block text-sm font-medium mb-1">Money per point (cents)</label>
          <input type="number" className="border rounded px-3 py-2 w-full" min={1}
            value={centsPerPoint} onChange={e=>setCentsPerPoint(parseInt(e.target.value||'0')||0)} />
          <div className="text-xs text-gray-500 mt-1">{centsPerPoint}¢ = ${(centsPerPoint/100).toFixed(2)} per point</div>
        </div>
      </div>
    )
  }

  const Manage = () => {
    const [kidName, setKidName] = useState('')
    const [avatar, setAvatar] = useState('👧')
    const [taskName, setTaskName] = useState('')
    const [pts, setPts] = useState(1)
    const [assign, setAssign] = useState<number[]>([])
    const [days, setDays] = useState<number[]>([1,2,3,4,5,6,7])

    const addKid = () => {
      if (!kidName.trim()) return
      const id = Math.max(0, ...kids.map(k=>k.id)) + 1
      setKids([...kids, { id, name: kidName.trim(), avatar }])
      setKidName('')
    }

    const addTask = () => {
      if (!taskName.trim() || assign.length===0 || days.length===0) return
      const id = Math.max(0, ...tasks.map(t=>t.id)) + 1
      setTasks([...tasks, { id, name: taskName.trim(), defaultPoints: pts, daysOfWeek: days, assignedKidIds: assign }])
      setTaskName(''); setAssign([]); setDays([1,2,3,4,5,6,7]); setPts(1)
    }

    const toggleAssign = (id:number) => {
      setAssign(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
    }
    const toggleDay = (d:number) => {
      setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="text-lg font-semibold mb-4">Add Task</div>
          <input className="border rounded px-3 py-2 w-full mb-2" placeholder="Task name"
            value={taskName} onChange={e=>setTaskName(e.target.value)} />
          <input className="border rounded px-3 py-2 w-full mb-2" type="number" min={1}
            value={pts} onChange={e=>setPts(parseInt(e.target.value||'1')||1)} />
          <div className="mb-3">
            <div className="text-sm font-medium mb-2">Assign to</div>
            <div className="flex flex-wrap gap-2">
              {kids.map(k => (
                <button key={k.id} onClick={()=>toggleAssign(k.id)}
                  className={`px-3 py-1 rounded border ${assign.includes(k.id)?'bg-loopGreen text-white border-loopGreen':'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
                  {k.avatar} {k.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-sm font-medium mb-2">Days</div>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((d,i)=>{
                const num = i===0?7:i
                const on = days.includes(num)
                return (
                  <button key={d} onClick={()=>toggleDay(num)}
                    className={`px-3 py-1 rounded border ${on?'bg-loopGreen text-white border-loopGreen':'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
          <button onClick={addTask} className="w-full bg-loopGreen text-white py-2 rounded-lg">Add Task</button>

          <div className="mt-6">
            <div className="font-semibold mb-2">Existing Tasks</div>
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="p-3 rounded border bg-gray-50">
                  <div className="font-medium">{t.name} <span className="text-gray-500">({t.defaultPoints} pts)</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="text-lg font-semibold mb-4">Add Kid</div>
          <input className="border rounded px-3 py-2 w-full mb-2" placeholder="Name"
            value={kidName} onChange={e=>setKidName(e.target.value)} />
          <input className="border rounded px-3 py-2 w-full mb-2" placeholder="Avatar (emoji)" value={avatar}
            onChange={e=>setAvatar(e.target.value || '👧')} />
          <button onClick={addKid} className="w-full bg-loopGreen text-white py-2 rounded-lg">Add Kid</button>
        </div>
      </div>
    )
  }

  const Info = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-2xl font-bold mb-3" style={{color:'#9CAF88'}}>How Loop Works</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Pick a date at the top.</li>
          <li>On the Board tab, tap a task to mark it complete for each kid.</li>
          <li>Add more tasks or kids on the Manage tab.</li>
          <li>Money only counts on days all tasks are completed.</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Header />
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-2 flex gap-2 py-2">
          {[
            {id:'board', label:'Board', icon: Calendar},
            {id:'calendar', label:'Calendar', icon: Calendar},
            {id:'manage', label:'Manage', icon: Settings},
            {id:'reports', label:'Reports', icon: BarChart3},
            {id:'info', label:'Info', icon: Info}
          ].map(tab => (
            <button
              key={tab.id}
              onClick={()=>setActive(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                active===tab.id ? 'bg-loopGreen text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <tab.icon size={16}/>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {active==='board' && <Board />}
      {active==='calendar' && <CalendarView />}
      {active==='manage' && <Manage />}
      {active==='reports' && <Reports />}
      {active==='info' && <Info />}
    </div>
  )
}