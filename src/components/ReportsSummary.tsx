import { useState } from 'react'
import { useStore, isPinSessionValid } from '../store/useStore'
import { toISODate } from '../utils/date'
import { computeStreakAwards, dailyPointsFlexible, dailyPointsIfAllDone } from '../utils/points'

function rangeDates(a:Date,b:Date){ const out:string[]=[]; for(let d=a; d<=b; d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)) out.push(toISODate(d)); return out }

export default function ReportsSummary(){
  const s=useStore()
  const [start,setStart]=useState<string>(toISODate(new Date(new Date().getFullYear(),new Date().getMonth(),1)))
  const [end,setEnd]=useState<string>(toISODate(new Date()))
  const [childFilter,setChildFilter]=useState<string>('all')

  function clipSinceLastPayout(childId:string, st:string, en:string){
    const last=[...s.payouts].filter(p=>p.childId===childId && p.rangeEndISO<=en).sort((a,b)=>a.rangeEndISO.localeCompare(b.rangeEndISO)).at(-1)
    if(!last) return {start: st, end: en}
    const nextDay = toISODate(new Date(new Date(last.rangeEndISO+'T00:00:00').getTime()+24*3600*1000))
    return {start: nextDay>st? nextDay:st, end: en}
  }

  const children = s.children.filter(c=> childFilter==='all' || c.id===childFilter)
  const mode = s.config.payoutMode ?? 'all_done'

  const rows = children.map(ch=>{
    const clip = clipSinceLastPayout(ch.id, start, end)
    const dates = rangeDates(new Date(clip.start+'T00:00:00'), new Date(clip.end+'T00:00:00'))

    // base task points according to payout mode
    const taskPts = dates.reduce((sum,d)=> sum + dailyPointsFlexible(s, ch.id, d, mode), 0)

    // streak bonuses still require ALL tasks for a day
    const streakAwards = computeStreakAwards(s, ch.id, dates)
    const streakPts = streakAwards.reduce((acc,a)=> acc + a.points, 0)

    const adjustments = s.adjustments
      .filter(a=> a.childId===ch.id && a.dateISO>=clip.start && a.dateISO<=clip.end)
      .reduce((acc,a)=> acc + a.deltaPoints, 0)

    const totalPts = taskPts + streakPts + adjustments
    const value = totalPts * (s.config.moneyPerPoint ?? 0)

    return { ch, taskPts, streakPts, adjustments, totalPts, value, clip }
  })

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        <div><label>Start</label><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></div>
        <div><label>End</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div>
        <div>
          <label>Child</label>
          <select value={childFilter} onChange={e=>setChildFilter(e.target.value)}>
            <option value="all">All children</option>
            {s.children.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <label>Rate ($/pt)</label>
          <input type="number" step="0.01" min="0" value={s.config.moneyPerPoint}
            onChange={e=>useStore.getState().setRate(parseFloat(e.target.value||'0'))}/>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="p-2">Kid</th>
              <th className="p-2">Task Points</th>
              <th className="p-2">Adjustments</th>
              <th className="p-2">Streak Bonuses</th>
              <th className="p-2">Net Points</th>
              <th className="p-2">Value</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.ch.id} className="border-t">
                <td className="p-2"><span className="mr-1">{r.ch.avatarEmoji}</span>{r.ch.name}</td>
                <td className="p-2">{r.taskPts}</td>
                <td className="p-2">{r.adjustments}</td>
                <td className="p-2">{r.streakPts}</td>
                <td className="p-2 font-semibold">{r.totalPts}</td>
                <td className="p-2 font-semibold">${r.value.toFixed(2)}</td>
                <td className="p-2">
                  <button
                    className="btn-outline"
                    onClick={()=>{
                      if(!isPinSessionValid(useStore.getState())){
                        const pin = prompt('Enter PIN')||''
                        if(!useStore.getState().unlockPIN(pin)){ alert('Incorrect PIN'); return }
                      }
                      const note = prompt(`Mark payout for ${r.ch.name}?\nOptional note:`) || ''
                      useStore.getState().addPayout({
                        childId: r.ch.id,
                        rangeStartISO: r.clip.start,
                        rangeEndISO: r.clip.end,
                        points: r.totalPts,
                        value: r.value,
                        note
                      })
                      alert('Payout recorded. Summary totals will zero forward; logs remain visible.')
                    }}
                  >
                    Mark Paid
                  </button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-2 text-muted">No children</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mode indicator */}
      <div className="text-xs text-muted">
        Payout mode: <b>{(s.config.payoutMode ?? 'all_done') === 'all_done' ? 'All Tasks Complete' : 'Per Task Completed'}</b>
      </div>
    </div>
  )
}
