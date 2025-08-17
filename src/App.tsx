import React, { useEffect, useMemo, useState } from "react";
type Kid = { id: string; name: string; avatar: string };
type Frequency = "Daily" | "Weekly";
type Weekday = 0|1|2|3|4|5|6;
type Chore = { id: string; name: string; points: number; frequency: Frequency; days?: Weekday[]; assignedKidIds: string[]; };
type CompletionKey = `${string}::${string}::${string}`;
type Adjustment = { id: string; kidId: string; dateISO: string; delta: number; note?: string; };
type Payout = { id: string; kidId: string; dateISO: string; points: number; value: number; };
type Reward = { id: string; name: string; cost: number };
type Tab = "Board"|"Calendar"|"Manage"|"Reports"|"Info";

const dFmt = (d: Date) => d.toISOString().slice(0,10);
const todayISO = () => dFmt(new Date());
const uid = () => Math.random().toString(36).slice(2,9);
const currency = (n: number) => `$${n.toFixed(2)}`;
function startOfMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function addDays(d: Date, n: number){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function range(n: number){ return Array.from({length:n}, (_,i)=>i); }

const LS_KEY = "loop-app-state-v3";
type StateShape = { kids: Kid[]; chores: Chore[]; completions: Record<CompletionKey, boolean>; adjustments: Adjustment[]; payouts: Payout[]; rewards: Reward[]; moneyPerPoint: number; locked: boolean; pin?: string; };
function loadState(): StateShape {
  const raw = localStorage.getItem(LS_KEY);
  if (raw){ try { return JSON.parse(raw) as StateShape; } catch {} }
  const kids: Kid[] = [{ id: "k1", name: "Emma", avatar: "👧" },{ id: "k2", name: "Alex", avatar: "🧒🏽" },{ id: "k3", name: "Lily", avatar: "👱‍♀️" }];
  const chores: Chore[] = [
    { id: "c1", name: "Make bed", points: 2, frequency: "Daily", assignedKidIds: ["k1","k2","k3"] },
    { id: "c2", name: "Brush teeth", points: 1, frequency: "Daily", assignedKidIds: ["k1","k2","k3"] },
    { id: "c3", name: "Pack school bag", points: 2, frequency: "Daily", assignedKidIds: ["k1","k2"] },
    { id: "c4", name: "Practice piano", points: 3, frequency: "Weekly", days: [0,6], assignedKidIds: ["k2","k3"] },
    { id: "c5", name: "Tidy room", points: 4, frequency: "Weekly", days: [0,6], assignedKidIds: ["k1","k2","k3"] },
  ];
  const rewards: Reward[] = [{ id: "r1", name: "Extra screen time", cost: 10 },{ id: "r2", name: "Choose dinner", cost: 15 },{ id: "r3", name: "Stay up late", cost: 20 }];
  return { kids, chores, rewards, completions: {}, adjustments: [], payouts: [], moneyPerPoint: 0.10, locked: false, pin: undefined };
}
function saveState(s: StateShape){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }

export default function App(){
  const [tab, setTab] = useState<Tab>("Board");
  const [dateISO, setDateISO] = useState<string>(todayISO());
  const [state, setState] = useState<StateShape>(() => loadState());
  const [hideCompleted, setHideCompleted] = useState(false);
  useEffect(()=> saveState(state), [state]);
  const selectedDate = useMemo(()=> new Date(dateISO), [dateISO]);

  function isChoreActiveOnDate(ch: Chore, d: Date){
    if (ch.frequency === "Daily") return true;
    const w = d.getDay() as Weekday;
    return (ch.days ?? []).includes(w);
  }
  function completionKey(d: string, kidId: string, choreId: string): `${string}::${string}::${string}` { return `${d}::${kidId}::${choreId}`; }
  function allAssignedCompleted(kidId: string, d: Date){
    const active = state.chores.filter(c => c.assignedKidIds.includes(kidId) && isChoreActiveOnDate(c, d));
    if (active.length === 0) return false;
    const iso = dFmt(d);
    return active.every(c => !!state.completions[completionKey(iso, kidId, c.id)]);
  }
  function dayEligiblePoints(kidId: string, d: Date){
    if (!allAssignedCompleted(kidId, d)) return 0;
    const active = state.chores.filter(c => c.assignedKidIds.includes(kidId) && isChoreActiveOnDate(c, d));
    return active.reduce((s,c)=> s + c.points, 0);
  }

  const toggleComplete = (kidId: string, choreId: string) => {
    if (state.locked) return;
    const key = completionKey(dateISO, kidId, choreId);
    setState(s => ({ ...s, completions: { ...s.completions, [key]: !s.completions[key] } }));
  };
  function totalsForRange(kidId: string, fromISO: string, toISO: string){
    const from = new Date(fromISO); const to = new Date(toISO);
    let eligible = 0;
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) eligible += dayEligiblePoints(kidId, d);
    const adj = state.adjustments.filter(a => a.kidId === kidId && a.dateISO >= fromISO && a.dateISO <= toISO).reduce((s,a)=> s + a.delta, 0);
    const net = eligible + adj;
    return { eligiblePoints: eligible, adjustments: adj, net, value: net * state.moneyPerPoint };
  }
  const markPaid = (kidId: string, fromISO: string, toISO: string) => {
    const { net, value } = totalsForRange(kidId, fromISO, toISO);
    if (net === 0) return;
    const resetAdj: Adjustment = { id: uid(), kidId, dateISO: todayISO(), delta: -net, note: `Payout for ${fromISO} to ${toISO}` };
    const payout: Payout = { id: uid(), kidId, dateISO: todayISO(), points: net, value };
    setState(s => ({ ...s, adjustments: [resetAdj, ...s.adjustments], payouts: [payout, ...s.payouts] }));
  };
  const adjustQuick = (kidId: string, delta: number) => {
    if (state.locked) return;
    const adj: Adjustment = { id: uid(), kidId, dateISO: todayISO(), delta };
    setState(s => ({ ...s, adjustments: [adj, ...s.adjustments] }));
  };
  const redeemReward = (kidId: string, reward: Reward) => {
    if (state.locked) return;
    const adj: Adjustment = { id: uid(), kidId, dateISO: todayISO(), delta: -reward.cost, note: `Redeemed: ${reward.name}` };
    setState(s => ({ ...s, adjustments: [adj, ...s.adjustments] }));
  };

  const [pinInput, setPinInput] = useState(""); const [unlockAttempt, setUnlockAttempt] = useState("");
  const setPin = () => { if (!pinInput) return; setState(s => ({ ...s, pin: pinInput })); setPinInput(""); alert("PIN set."); };
  const lockToggle = () => { if (!state.locked){ setState(s => ({ ...s, locked: true })); } else { if (unlockAttempt === state.pin){ setState(s => ({ ...s, locked: false })); setUnlockAttempt(""); } else { alert("Wrong PIN"); } } };

  const Nav = () => (
    <div className="sticky top-0 z-10">
      <div className="w-full bg-loop-green text-white">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <div className="text-3xl font-extrabold tracking-wide">Loop</div>
          <div className="text-sm opacity-90">Do it. Earn it. Repeat it.</div>
        </div>
      </div>
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-6 py-3 text-gray-700">
            {(["Board","Calendar","Manage","Reports","Info"] as Tab[]).map(t => (
              <button key={t} onClick={()=>setTab(t)} className={`pb-2 border-b-2 -mb-px ${tab===t ? "border-blue-500 text-blue-600 font-semibold" : "border-transparent hover:text-black"}`}>{t}</button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <input type="date" value={dateISO} onChange={(e)=>setDateISO(e.target.value)} className="border rounded px-2 py-1"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const Page = ({children}:{children:React.ReactNode}) => (<div className="bg-slate-50 min-h-screen"><Nav/><div className="max-w-5xl mx-auto p-4 sm:p-6">{children}</div></div>);

  const Board = () => (
    <Page>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Daily Board</h2>
        <button onClick={()=>setHideCompleted(h=>!h)} className="rounded border px-3 py-1 bg-white">{hideCompleted ? "Show completed" : "Hide completed"}</button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {state.kids.map(kid => {
          const choresForKid = state.chores.filter(c => c.assignedKidIds.includes(kid.id) && isChoreActiveOnDate(c, selectedDate));
          return (
            <div key={kid.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{kid.avatar}</span><h3 className="text-xl font-semibold">{kid.name}</h3></div>
              {choresForKid.length === 0 && (<div className="text-gray-500">No tasks for today.</div>)}
              <div className="space-y-3">
                {choresForKid.map(ch => {
                  const key = completionKey(dateISO, kid.id, ch.id);
                  const done = !!state.completions[key];
                  if (hideCompleted && done) return null;
                  return (
                    <div key={ch.id} className={`border rounded-xl px-3 py-3 flex items-center justify-between ${done ? "bg-[#9CAF88] text-white" : "bg-white"}`}>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={done} onChange={()=>toggleComplete(kid.id, ch.id)} disabled={state.locked}/>
                        <span>{ch.name}</span>
                      </label>
                      <span className={`text-sm ${done ? "text-white" : "opacity-70"}`}>+{ch.points}pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );

  const Calendar = () => {
    const base = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const startWeekday = base.getDay();
    const daysInMonth = end.getDate();
    const cells = startWeekday + daysInMonth;
    const rows = Math.ceil(cells / 7);
    const prevMonth = () => setDateISO(dFmt(addDays(base, -1)));
    const nextMonth = () => setDateISO(dFmt(addDays(end, 1)));
    return (
      <Page>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={prevMonth} className="rounded border px-3 py-1 bg-white">←</button>
          <h2 className="text-2xl font-bold">{selectedDate.toLocaleString(undefined, { month: "long", year: "numeric" })}</h2>
          <button onClick={nextMonth} className="rounded border px-3 py-1 bg-white">→</button>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-7 text-center font-semibold bg-slate-100 py-2">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {range(rows*7).map(i => {
              const dayNum = i - startWeekday + 1;
              const valid = dayNum >= 1 && dayNum <= daysInMonth;
              const iso = valid ? dFmt(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNum)) : "";
              const star = valid && state.kids.some(k => allAssignedCompleted(k.id, new Date(iso)));
              return (<div key={i} className="bg-white min-h-[90px] p-2"><div className="text-sm font-semibold">{valid ? dayNum : ""}</div><div className="mt-2 text-lg">{star ? "⭐" : ""}</div></div>);
            })}
          </div>
        </div>
      </Page>
    );
  };

  const Manage = () => {
    const [kidName, setKidName] = useState(""); const [avatar, setAvatar] = useState("😀");
    const addKid = () => { if (!kidName.trim()) return; setState(s => ({ ...s, kids: [...s.kids, { id: uid(), name: kidName.trim(), avatar }] })); setKidName(""); };
    const removeKid = (id: string) => { if (!confirm("Remove this kid?")) return; setState(s => ({ ...s, kids: s.kids.filter(k => k.id !== id) })); };
    const [choreName, setChoreName] = useState(""); const [points, setPoints] = useState<number>(1); const [freq, setFreq] = useState<Frequency>("Daily"); const [days, setDays] = useState<Weekday[]>([]); const [assign, setAssign] = useState<string[]>(state.kids.map(k=>k.id));
    const addChore = () => { if (!choreName.trim()) return; const c: Chore = { id: uid(), name: choreName.trim(), points, frequency: freq, assignedKidIds: assign.slice() }; if (freq === "Weekly") c.days = days.slice(); setState(s => ({ ...s, chores: [c, ...s.chores] })); setChoreName(""); setPoints(1); setFreq("Daily"); setDays([]); setAssign(state.kids.map(k=>k.id)); };
    const removeChore = (id: string) => { if (!confirm("Remove this chore?")) return; setState(s => ({ ...s, chores: s.chores.filter(c => c.id !== id) })); };
    const faces = ["😀","😃","🙂","😄","😆","🥰","😍","😊","😉","🤩","😎","🫶"];
    return (
      <Page>
        {state.locked && (<div className="mb-4 p-3 rounded bg-yellow-100 border border-yellow-300"><strong>Locked for Kids:</strong> Enter PIN to unlock in Settings below.</div>)}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-xl font-bold mb-3">Kids</h3>
            <div className="space-y-3 mb-4">{state.kids.map(k => (<div key={k.id} className="flex items-center justify-between border rounded-xl p-2"><div className="flex items-center gap-3"><span className="text-2xl">{k.avatar}</span><span className="font-medium">{k.name}</span></div><button disabled={state.locked} onClick={()=>removeKid(k.id)} className="text-red-600">🗑️</button></div>))}</div>
            <div className="flex items-center gap-2"><input disabled={state.locked} value={kidName} onChange={e=>setKidName(e.target.value)} placeholder="Kid name" className="border rounded px-2 py-1 w-full"/><select disabled={state.locked} value={avatar} onChange={e=>setAvatar(e.target.value)} className="border rounded px-2 py-1">{faces.map(f => <option key={f} value={f}>{f}</option>)}</select><button disabled={state.locked} onClick={addKid} className="bg-loop-green text-white rounded px-3 py-1">Add</button></div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-xl font-bold mb-3">Settings</h3>
            <label className="block mb-3">Money per point ($)<input disabled={state.locked} type="number" step="0.01" min="0" value={state.moneyPerPoint} onChange={e=>setState(s => ({ ...s, moneyPerPoint: Number(e.target.value||0) })) } className="border rounded px-2 py-1 ml-2 w-24"/></label>
            <div className="border-t pt-3 mt-3">
              <h4 className="font-semibold mb-2">Parental Controls</h4>
              <div className="flex items-center gap-2 mb-2"><input placeholder="Set/Change PIN" value={pinInput} onChange={e=>setPinInput(e.target.value)} className="border rounded px-2 py-1"/><button onClick={setPin} className="rounded border px-3 py-1">Set PIN</button></div>
              <div className="flex items-center gap-2"><button onClick={lockToggle} className={`rounded px-3 py-1 ${state.locked ? "bg-loop-green text-white" : "bg-red-600 text-white"}`}>{state.locked ? "Unlock" : "Lock for Kids"}</button>{state.locked && (<input placeholder="Enter PIN to unlock" value={unlockAttempt} onChange={e=>setUnlockAttempt(e.target.value)} className="border rounded px-2 py-1"/> )}</div>
            </div>
            <div className="border-t pt-3 mt-4">
              <h4 className="font-semibold mb-2">Bulk Point Adjustments</h4>
              <div className="space-y-2">{state.kids.map(k => (<div key={k.id} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{k.avatar}</span>{k.name}</div><div className="flex gap-2">{[-20,-10,-5,-1,1,5,10,20].map(d => (<button key={d} disabled={state.locked} onClick={()=>adjustQuick(k.id, d)} className={`px-2 py-1 rounded ${d>0?"bg-green-100":"bg-red-100"}`}>{d>0?`+${d}`:d}</button>))}</div></div>))}</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 lg:col-span-2">
            <h3 className="text-xl font-bold mb-3">Chores</h3>
            <ChoresEditor state={state} setState={setState}/>
            <div className="border-t mt-6 pt-4">
              <h3 className="text-xl font-bold mb-2">Rewards Store</h3>
              <div className="space-y-2 mb-3">{state.rewards.map(r => (<div key={r.id} className="flex items-center justify-between border rounded-xl p-2"><div>{r.name} <span className="opacity-60">{r.cost} pts</span></div><div className="flex gap-2">{state.kids.map(k => (<button key={k.id} disabled={state.locked} onClick={()=>redeemReward(k.id, r)} className="rounded px-2 py-1 border">Redeem for {k.name}</button>))}</div></div>))}</div>
              <AddReward disabled={state.locked} onAdd={(name, cost)=>{ if (!name.trim() || cost<=0) return; setState(s => ({ ...s, rewards: [...s.rewards, { id: uid(), name: name.trim(), cost }] })); }}/>
            </div>
          </div>
        </div>
      </Page>
    );
  };

  const ChoresEditor = ({state, setState}:{state:StateShape; setState:React.Dispatch<React.SetStateAction<StateShape>>})=>{
    const [choreName, setChoreName] = useState(""); const [points, setPoints] = useState<number>(1);
    const [freq, setFreq] = useState<Frequency>("Daily"); const [days, setDays] = useState<Weekday[]>([]);
    const [assign, setAssign] = useState<string[]>(state.kids.map(k=>k.id));
    const addChore = () => { if (!choreName.trim()) return; const c: Chore = { id: uid(), name: choreName.trim(), points, frequency: freq, assignedKidIds: assign.slice() }; if (freq === "Weekly") c.days = days.slice(); setState(s => ({ ...s, chores: [c, ...s.chores] })); setChoreName(""); setPoints(1); setFreq("Daily"); setDays([]); setAssign(state.kids.map(k=>k.id)); };
    const removeChore = (id: string) => { if (!confirm("Remove this chore?")) return; setState(s => ({ ...s, chores: s.chores.filter(c => c.id !== id) })); };
    return (<div>
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input value={choreName} onChange={e=>setChoreName(e.target.value)} placeholder="Chore name" className="border rounded px-2 py-1"/>
        <div className="flex items-center gap-2">
          <input type="number" min={1} value={points} onChange={e=>setPoints(Number(e.target.value||1))} className="border rounded px-2 py-1 w-20"/>
          <select value={freq} onChange={e=>setFreq(e.target.value as Frequency)} className="border rounded px-2 py-1"><option>Daily</option><option>Weekly</option></select>
          {freq === "Weekly" && (<div className="flex flex-wrap gap-1">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((n,i)=>{const active = days.includes(i as Weekday);return (<button key={n} onClick={()=>{setDays(cs => active ? cs.filter(x=>x!==i) : [...cs, i as Weekday]);}} className={`px-2 py-1 rounded border ${active?"bg-blue-100 border-blue-300":"bg-white"}`}>{n}</button>);})}</div>)}
        </div>
        <div className="md:col-span-2 flex items-center gap-2 flex-wrap"><span className="text-sm opacity-70">Assign to:</span>{state.kids.map(k => {const on = assign.includes(k.id);return (<button key={k.id} onClick={()=>{setAssign(a => on ? a.filter(id=>id!==k.id) : [...a, k.id]);}} className={`px-2 py-1 rounded border ${on?"bg-green-100 border-green-300":"bg-white"}`}>{k.avatar} {k.name}</button>);})}
          <button onClick={addChore} className="ml-auto bg-loop-green text-white rounded px-3 py-1">Add Chore</button></div>
      </div>
      <div className="space-y-2">{state.chores.map(c => (<div key={c.id} className="border rounded-xl p-3 flex items-center justify-between"><div><div className="font-medium">{c.name} <span className="opacity-60">• {c.points} pts • {c.frequency}{c.frequency==="Weekly" && c.days?.length ? ` (${c.days!.map(d=>["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(", ")})`:""}</span></div><div className="text-sm opacity-70">Assigned to: {state.kids.filter(k=>c.assignedKidIds.includes(k.id)).map(k=>k.name).join(", ")||"None"}</div></div><button onClick={()=>removeChore(c.id)} className="text-red-600">🗑️</button></div>))}</div>
    </div>);
  };

  const AddReward = ({disabled, onAdd}:{disabled?:boolean; onAdd:(name:string,cost:number)=>void})=>{
    const [name,setName]=useState(""); const [cost,setCost]=useState(5);
    return (<div className="flex items-center gap-2">
      <input disabled={disabled} value={name} onChange={e=>setName(e.target.value)} placeholder="Reward name" className="border rounded px-2 py-1 flex-1"/>
      <input disabled={disabled} type="number" min={1} value={cost} onChange={e=>setCost(Number(e.target.value||1))} className="border rounded px-2 py-1 w-20"/>
      <button disabled={disabled} onClick={()=>{ onAdd(name,cost); setName(""); setCost(5); }} className="bg-purple-600 text-white rounded px-3 py-1">Add</button>
    </div>);
  };

  const Reports = () => {
    const [fromISO, setFromISO] = useState(dFmt(addDays(new Date(dateISO), -30)));
    const [toISO, setToISO] = useState(dateISO);
    const [kidFilter, setKidFilter] = useState<string>("all");
    const visibleKids = kidFilter === "all" ? state.kids : state.kids.filter(k => k.id === kidFilter);
    const rows = visibleKids.map(k => { const t = totalsForRange(k.id, fromISO, toISO); return { kid: k, ...t }; });
    const totals = rows.reduce((s,r)=>({ eligiblePoints: s.eligiblePoints + r.eligiblePoints, adjustments: s.adjustments + r.adjustments, net: s.net + r.net, value: s.value + r.value, }), {eligiblePoints:0, adjustments:0, net:0, value:0});
    return (<Page>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="block"><div className="text-sm font-medium">From Date</div><input type="date" value={fromISO} onChange={e=>setFromISO(e.target.value)} className="border rounded px-2 py-1 w-full"/></label>
          <label className="block"><div className="text-sm font-medium">To Date</div><input type="date" value={toISO} onChange={e=>setToISO(e.target.value)} className="border rounded px-2 py-1 w-full"/></label>
          <label className="block"><div className="text-sm font-medium">Kid Filter</div><select value={kidFilter} onChange={e=>setKidFilter(e.target.value)} className="border rounded px-2 py-1 w-full"><option value="all">All Kids</option>{state.kids.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}</select></label>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100"><tr><th className="p-3">Kid</th><th className="p-3">Eligible Points (all-done days)</th><th className="p-3">Adjustments</th><th className="p-3">Net Points</th><th className="p-3">Value</th><th className="p-3">Action</th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.kid.id} className="border-t"><td className="p-3 flex items-center gap-2"><span className="text-xl">{r.kid.avatar}</span>{r.kid.name}</td><td className="p-3 text-green-700 font-medium">{r.eligiblePoints}</td><td className="p-3 text-blue-700">{r.adjustments}</td><td className="p-3 font-semibold">{r.net}</td><td className="p-3 text-green-700 font-semibold">{currency(r.value)}</td><td className="p-3"><button onClick={()=>markPaid(r.kid.id, fromISO, toISO)} className="bg-loop-green text-white rounded px-3 py-1">Mark Paid</button></td></tr>))}</tbody>
        </table>
      </div>
    </Page>);
  };

  const Info = () => (<Page>
    <h2 className="text-2xl font-bold mb-4">How Loop Works</h2>
    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      <h3 className="text-xl font-bold mb-2">🧒👧 For Kids</h3>
      <div className="mb-2"><div className="font-semibold">🧾 Daily Board</div><div className="opacity-80">Complete your daily tasks and earn points.</div></div>
      <div className="mb-2"><div className="font-semibold">📅 Calendar</div><div className="opacity-80">⭐ shows when you finished everything for the day.</div></div>
      <div className="mb-2"><div className="font-semibold">🎁 Rewards</div><div className="opacity-80">Trade points for rewards.</div></div>
      <div className="mb-2"><div className="font-semibold">📈 Reports</div><div className="opacity-80">Only all-done days turn into money.</div></div>
    </div>
    <div className="bg-yellow-50 rounded-2xl shadow-inner border border-yellow-200 p-4 mb-6">
      <h3 className="text-xl font-bold mb-2">👨‍👩‍👧 For Parents</h3>
      <div className="mb-2"><span className="font-semibold">🎯 Board Tab</span> — Track daily progress; hide completed.</div>
      <div className="mb-2"><span className="font-semibold">📆 Calendar</span> — Month view with ⭐ all-done days.</div>
      <div className="mb-2"><span className="font-semibold">⚙️ Manage</span> — Add kids/chores. Lock with PIN.</div>
      <div className="mb-2"><span className="font-semibold">🧾 Reports</span> — Payouts reset balances.</div>
    </div>
  </Page>);

  if (tab==="Board") return <Board/>;
  if (tab==="Calendar") return <Calendar/>;
  if (tab==="Manage") return <Manage/>;
  if (tab==="Reports") return <Reports/>;
  return <Info/>;
}