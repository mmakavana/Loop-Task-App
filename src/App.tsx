
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Calendar as CalendarIcon,
  BarChart3,
  Settings,
  Info,
  Star,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";

/** Types */
type Kid = { id: number; name: string; avatar: string; centsPerPoint: number; lastPayoutDate?: string };
type Task = { id: number; title: string; points: number; active: boolean };
type Assignment = { kidId: number; taskId: number };
type Completion = { kidId: number; taskId: number; date: string };
type Adjustment = { id: number; kidId: number; date: string; reason: string; pointsDelta: number };
type Payout = { id: number; kidId: number; date: string; amountCents: number; pointsPaid: number };

/** Helpers */
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(cents / 100);
const isoAddDays = (d: string, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x.toISOString().slice(0, 10);
};
const startOfMonth = (d: string) => new Date(new Date(d).getFullYear(), new Date(d).getMonth(), 1).toISOString().slice(0,10);
const endOfMonth = (d: string) => new Date(new Date(d).getFullYear(), new Date(d).getMonth()+1, 0).toISOString().slice(0,10);
const daysInMonth = (d: string) => new Date(new Date(d).getFullYear(), new Date(d).getMonth()+1, 0).getDate();

/** Storage */
type Store = {
  kids: Kid[];
  tasks: Task[];
  assignments: Assignment[];
  completions: Completion[];
  adjustments: Adjustment[];
  payouts: Payout[];
};
const STORAGE_KEY = "loop-app-v2";
const loadStore = (): Store => {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch {}
  return { kids: [], tasks: [], assignments: [], completions: [], adjustments: [], payouts: [] };
};
const saveStore = (s: Store) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

/** Component */
const LoopApp: React.FC = () => {
  const [tab, setTab] = useState<"board"|"calendar"|"manage"|"reports"|"info">("board");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());

  const [kids, setKids] = useState<Kid[]>(() => loadStore().kids);
  const [tasks, setTasks] = useState<Task[]>(() => loadStore().tasks);
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadStore().assignments);
  const [completions, setCompletions] = useState<Completion[]>(() => loadStore().completions);
  const [adjustments, setAdjustments] = useState<Adjustment[]>(() => loadStore().adjustments);
  const [payouts, setPayouts] = useState<Payout[]>(() => loadStore().payouts);

  useEffect(() => saveStore({ kids, tasks, assignments, completions, adjustments, payouts }), [kids, tasks, assignments, completions, adjustments, payouts]);

  const assignmentsByKid = useMemo(() => {
    const map: Record<number, number[]> = {};
    for (const k of kids) map[k.id] = [];
    for (const a of assignments) {
      map[a.kidId] = map[a.kidId] || [];
      map[a.kidId].push(a.taskId);
    }
    return map;
  }, [kids, assignments]);

  const isDone = (kidId: number, taskId: number, date: string) =>
    completions.some((c) => c.kidId === kidId && c.taskId === taskId && c.date === date);

  const toggleDone = (kidId: number, taskId: number, date: string) => {
    setCompletions((prev) => {
      const idx = prev.findIndex((c) => c.kidId === kidId && c.taskId === taskId && c.date === date);
      if (idx >= 0) { const copy = prev.slice(); copy.splice(idx,1); return copy; }
      return [...prev, { kidId, taskId, date }];
    });
  };

  const pointsFor = (kidId: number, date: string) => {
    const tIds = new Set(assignmentsByKid[kidId] || []);
    return completions
      .filter((c) => c.kidId === kidId && c.date === date && tIds.has(c.taskId))
      .reduce((sum, c) => sum + (tasks.find((t) => t.id === c.taskId)?.points || 0), 0);
  };

  const allAssignedDone = (kidId: number, date: string) => {
    const list = assignmentsByKid[kidId] || [];
    if (!list.length) return false;
    return list.every((tid) => isDone(kidId, tid, date));
  };

  const Header = () => (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-extrabold">Loop</div>
          <div className="text-xs opacity-90">Do it. Earn it. Repeat it.</div>
        </div>
        <input type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} className="rounded bg-white/10 px-2 py-1 text-sm outline-none ring-1 ring-white/30" />
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
        <Tab id="board" label="Board" icon={<Users className="w-4 h-4" />} />
        <Tab id="calendar" label="Calendar" icon={<CalendarIcon className="w-4 h-4" />} />
        <Tab id="reports" label="Reports" icon={<BarChart3 className="w-4 h-4" />} />
        <Tab id="manage" label="Manage" icon={<Settings className="w-4 h-4" />} />
        <Tab id="info" label="Info" icon={<Info className="w-4 h-4" />} />
      </div>
    </div>
  );

  const Tab: React.FC<{id: typeof tab, label: string, icon: React.ReactNode}> = ({id, label, icon}) => (
    <button onClick={()=>setTab(id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${tab===id ? "bg-white text-gray-900" : "bg-white/20 text-white hover:bg-white/30"}`}>
      {icon}{label}
    </button>
  );

  const Board = () => (
    <div className="max-w-6xl mx-auto p-4">
      {kids.length===0 ? <Empty title="Add your first kid" hint="Manage → Add Kid"/> :
       tasks.length===0 ? <Empty title="Add your first task" hint="Manage → Add Task"/> : (
        <div className="grid md:grid-cols-2 gap-4">
          {kids.map(k => (
            <div key={k.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{k.avatar}</div>
                  <div className="font-semibold">{k.name}</div>
                </div>
                <div className="text-sm text-gray-500">{pointsFor(k.id, selectedDate)} pts {allAssignedDone(k.id, selectedDate) && <Star className="w-4 h-4 text-amber-500 inline"/>}</div>
              </div>
              <div className="space-y-2">
                {(assignmentsByKid[k.id]||[]).map(tid => {
                  const task = tasks.find(t => t.id===tid);
                  if (!task || !task.active) return null;
                  const done = isDone(k.id, tid, selectedDate);
                  return (
                    <label key={tid} className={`flex items-center justify-between px-3 py-2 rounded border cursor-pointer ${done ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={done} onChange={()=>toggleDone(k.id, tid, selectedDate)} />
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <div className="text-sm text-gray-500">{task.points} pts</div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Calendar = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const dim = daysInMonth(selectedDate);
    const firstDow = new Date(monthStart).getDay();
    const days: string[] = [];
    for (let i=1;i<=dim;i++) {
      const iso = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth(), i).toISOString().slice(0,10);
      days.push(iso);
    }
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">Calendar</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded border" onClick={()=>setSelectedDate(isoAddDays(monthStart,-1))}>◀</button>
              <div className="text-sm text-gray-600">{monthStart.slice(0,7)}</div>
              <button className="px-2 py-1 rounded border" onClick={()=>setSelectedDate(isoAddDays(monthEnd,1))}>▶</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs text-gray-600">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="text-center font-medium">{d}</div>)}
            {Array.from({length:firstDow}).map((_,i)=><div key={"pad"+i}/>)}
            {days.map(d => (
              <div key={d} className={`border rounded p-2 ${d===selectedDate ? "ring-2 ring-indigo-500" : ""}`}>
                <div className="text-xs font-semibold cursor-pointer mb-1" onClick={()=>setSelectedDate(d)}>{parseInt(d.slice(8,10))}</div>
                {kids.map(k => {
                  const pts = pointsFor(k.id, d);
                  const star = allAssignedDone(k.id, d);
                  return (
                    <div key={k.id} className="flex items-center justify-between mb-1">
                      <span title={k.name}>{k.avatar}</span>
                      <span>{pts}</span>
                      {star && <Star className="w-3 h-3 text-amber-500" />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Reports = () => {
    const [from, setFrom] = useState<string>(startOfMonth(selectedDate));
    const [to, setTo] = useState<string>(endOfMonth(selectedDate));

    const totalsFor = (kid: Kid) => {
      const floor = kid.lastPayoutDate && kid.lastPayoutDate > from ? kid.lastPayoutDate : from;
      const tIds = new Set(assignmentsByKid[kid.id] || []);
      const base = completions
        .filter(c => c.kidId===kid.id && c.date>=floor && c.date<=to && tIds.has(c.taskId))
        .reduce((s,c)=> s + (tasks.find(t=>t.id===c.taskId)?.points || 0), 0);
      // 1 bonus point per day that all assignments are completed
      let bonus = 0, d = floor;
      while (d <= to) { if (allAssignedDone(kid.id, d)) bonus += 1; d = isoAddDays(d,1); }
      const adj = adjustments.filter(a => a.kidId===kid.id && a.date>=floor && a.date<=to).reduce((s,a)=>s+a.pointsDelta,0);
      const totalPts = base + bonus + adj;
      const cents = totalPts * kid.centsPerPoint;
      return { base, bonus, adj, totalPts, cents, floor };
    };

    const markPayout = (kid: Kid) => {
      const t = totalsFor(kid);
      if (t.totalPts <= 0) return;
      const now = todayStr();
      setPayouts(prev => [...prev, { id: prev.length? Math.max(...prev.map(p=>p.id))+1:1, kidId: kid.id, date: now, amountCents: t.cents, pointsPaid: t.totalPts }]);
      setKids(prev => prev.map(k => k.id===kid.id ? { ...k, lastPayoutDate: now } : k));
    };

    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="font-semibold">Date range</div>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded border px-2 py-1"/>
            <span>to</span>
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded border px-2 py-1"/>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2">Kid</th>
                <th className="py-2">Base pts</th>
                <th className="py-2">Streak bonus</th>
                <th className="py-2">Adj pts</th>
                <th className="py-2">Total pts</th>
                <th className="py-2">Earnings</th>
                <th className="py-2">Payout</th>
              </tr>
            </thead>
            <tbody>
              {kids.map(k => {
                const t = totalsFor(k);
                return (
                  <tr key={k.id} className="border-b last:border-b-0">
                    <td className="py-2">{k.name}</td>
                    <td className="py-2">{t.base}</td>
                    <td className="py-2">{t.bonus}</td>
                    <td className="py-2">{t.adj}</td>
                    <td className="py-2 font-semibold">{t.totalPts}</td>
                    <td className="py-2">{fmtMoney(t.cents)}</td>
                    <td className="py-2">
                      <button onClick={()=>markPayout(k)} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                        Mark payout
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6">
            <div className="font-semibold mb-2">Adjustment log</div>
            <AdjustmentForm kids={kids} onAdd={(a)=>setAdjustments(prev=>[...prev, { ...a, id: prev.length? Math.max(...prev.map(x=>x.id))+1:1 }])} />
            <div className="mt-3 space-y-2">
              {adjustments.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(a => {
                const kid = kids.find(k=>k.id===a.kidId);
                return (
                  <div key={a.id} className="text-sm flex items-center justify-between border rounded px-2 py-1">
                    <div><span className="font-medium">{kid?.name}</span> • {a.date} — {a.reason} • {a.pointsDelta>0?"+":""}{a.pointsDelta} pts</div>
                    <button className="text-red-600 hover:text-red-700" onClick={()=>setAdjustments(prev=>prev.filter(x=>x.id!==a.id))}><Trash2 className="w-4 h-4"/></button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="font-semibold mb-2">Payout history</div>
            <div className="space-y-2 text-sm">
              {payouts.length===0 ? <div className="text-gray-500">No payouts yet.</div> :
                payouts.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(p => {
                  const kid = kids.find(k=>k.id===p.kidId);
                  return (
                    <div key={p.id} className="flex items-center justify-between border rounded px-2 py-1">
                      <div><span className="font-medium">{kid?.name}</span> • {p.date} — {fmtMoney(p.amountCents)} ({p.pointsPaid} pts)</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdjustmentForm: React.FC<{kids: Kid[], onAdd: (a: Omit<Adjustment,"id">)=>void}> = ({ kids, onAdd }) => {
    const [kidId, setKidId] = useState<number>(kids[0]?.id || 0);
    const [date, setDate] = useState<string>(todayStr());
    const [reason, setReason] = useState<string>("");
    const [pointsDelta, setPointsDelta] = useState<number>(0);
    useEffect(()=>{ if (kids.length && !kids.find(k=>k.id===kidId)) setKidId(kids[0].id); }, [kids]);
    return (
      <div className="flex flex-wrap items-end gap-2">
        <select value={kidId} onChange={(e)=>setKidId(Number(e.target.value))} className="rounded border px-2 py-1">
          {kids.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="rounded border px-2 py-1"/>
        <input placeholder="Reason" value={reason} onChange={(e)=>setReason(e.target.value)} className="rounded border px-2 py-1"/>
        <input type="number" value={pointsDelta} onChange={(e)=>setPointsDelta(Number(e.target.value||0))} className="w-28 rounded border px-2 py-1"/>
        <button onClick={()=>{ if(!kidId) return; onAdd({ kidId, date, reason: reason||"Adjustment", pointsDelta }); setReason(""); setPointsDelta(0); }} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs">Add adjustment</button>
      </div>
    );
  };

  const Manage = () => {
    const emojiOptions = ["👧🏽","👦🏽","👩🏽","👨🏽","🐶","🐱","🐼","🦊","🦄"];
    const [kidName, setKidName] = useState("");
    const [kidAvatar, setKidAvatar] = useState(emojiOptions[0]);
    const [cpp, setCpp] = useState<number>(5);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskPoints, setTaskPoints] = useState<number>(1);

    const addKid = () => {
      if (!kidName.trim()) return;
      setKids(prev => [...prev, { id: prev.length? Math.max(...prev.map(k=>k.id))+1:1, name: kidName.trim(), avatar: kidAvatar, centsPerPoint: cpp||1 }]);
      setKidName(""); setKidAvatar(emojiOptions[0]); setCpp(5);
    };
    const addTask = () => {
      if (!taskTitle.trim()) return;
      setTasks(prev => [...prev, { id: prev.length? Math.max(...prev.map(t=>t.id))+1:1, title: taskTitle.trim(), points: taskPoints||1, active: true }]);
      setTaskTitle(""); setTaskPoints(1);
    };
    const toggleAssign = (kidId:number, taskId:number) => {
      setAssignments(prev => prev.some(a=>a.kidId===kidId && a.taskId===taskId)
        ? prev.filter(a=>!(a.kidId===kidId && a.taskId===taskId))
        : [...prev, { kidId, taskId }]);
    };

    return (
      <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Add Kid</div>
          <div className="space-y-2">
            <input className="w-full rounded border px-2 py-1" placeholder="Name" value={kidName} onChange={e=>setKidName(e.target.value)} />
            <div className="flex items-center gap-2">
              <div>Avatar:</div>
              <select className="rounded border px-2 py-1" value={kidAvatar} onChange={e=>setKidAvatar(e.target.value)}>
                {emojiOptions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div>Cents / point:</div>
              <input type="number" className="w-24 rounded border px-2 py-1" value={cpp} onChange={e=>setCpp(Number(e.target.value||0))}/>
            </div>
            <button onClick={addKid} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"><Plus className="w-4 h-4"/> Add Kid</button>
          </div>
          <div className="mt-4">
            <div className="font-semibold mb-2">Kids</div>
            <div className="space-y-2">
              {kids.map(k => (
                <div key={k.id} className="flex items-center justify-between border rounded px-2 py-1">
                  <div className="flex items-center gap-2"><div className="text-xl">{k.avatar}</div><div>{k.name}</div><div className="text-xs text-gray-500">({k.centsPerPoint}¢/pt)</div></div>
                  <button className="text-red-600 hover:text-red-700" onClick={()=>setKids(prev=>prev.filter(x=>x.id!==k.id))}><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-3 flex items-center gap-2"><Settings className="w-4 h-4"/> Add Task</div>
          <div className="space-y-2">
            <input className="w-full rounded border px-2 py-1" placeholder="Task title" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} />
            <div className="flex items-center gap-2"><div>Points:</div><input type="number" className="w-24 rounded border px-2 py-1" value={taskPoints} onChange={e=>setTaskPoints(Number(e.target.value||0))}/></div>
            <button onClick={addTask} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"><Plus className="w-4 h-4"/> Add Task</button>
          </div>
          <div className="mt-4">
            <div className="font-semibold mb-2">Assign Tasks → Kids</div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="py-2">Task</th><th className="py-2">Pts</th>
                    {kids.map(k => <th key={k.id} className="py-2">{k.name}</th>)}
                    <th className="py-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="py-2">{t.title}</td>
                      <td className="py-2">{t.points}</td>
                      {kids.map(k => {
                        const checked = assignments.some(a=>a.kidId===k.id && a.taskId===t.id);
                        return <td key={k.id} className="py-2 text-center"><input type="checkbox" checked={checked} onChange={()=>toggleAssign(k.id, t.id)} /></td>;
                      })}
                      <td className="py-2">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={t.active} onChange={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,active:!x.active}:x))} />
                          <span className="text-xs text-gray-500">{t.active ? "On":"Off"}</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InfoTab = () => (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow p-6 leading-relaxed">
        <div className="text-xl font-bold mb-2">How to use Loop</div>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>Go to <b>Manage</b>: add kids and tasks, and assign tasks to kids.</li>
          <li>Pick a date at the top. On <b>Board</b>, check off tasks per kid for that date.</li>
          <li>Open <b>Calendar</b> to see per-day points and ⭐ when a kid completes all assigned tasks.</li>
          <li>On <b>Reports</b>, set a date range to see totals, add adjustments, and mark payouts.</li>
        </ol>
        <div className="mt-4 flex items-center gap-2 text-gray-600"><DollarSign className="w-4 h-4"/> Earnings = (points + streak bonus + adjustments) × cents-per-point.</div>
      </div>
    </div>
  );

  const Empty: React.FC<{title: string, hint?: string}> = ({ title, hint }) => (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <div className="text-lg font-semibold mb-1">{title}</div>
      {hint && <div className="text-gray-500 text-sm">{hint}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <Header />
      {tab==="board" && <Board/>}
      {tab==="calendar" && <Calendar/>}
      {tab==="reports" && <Reports/>}
      {tab==="manage" && <Manage/>}
      {tab==="info" && <InfoTab/>}
    </div>
  );
};

export default LoopApp;
