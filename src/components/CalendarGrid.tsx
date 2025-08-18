import { useStore } from '../store/useStore'
import { toISODate, fromISODate } from '../utils/date'
import { WEEKDAYS } from '../utils/constants'
import { dailyPointsIfAllDone } from '../utils/points'
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'
export default function CalendarGrid(){
  const s=useStore(); const d=new Date(); const year=d.getFullYear(); const month=d.getMonth()
  const first=startOfMonth(new Date(year,month,1)); const last=endOfMonth(first)
  const gridStart=startOfWeek(first,{weekStartsOn:0}); const gridEnd=endOfWeek(last,{weekStartsOn:0})
  const days:string[]=[]; for(let dt=gridStart; dt<=gridEnd; dt=addDays(dt,1)){ days.push(toISODate(dt)) }
  return (<div className="card">
    <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-muted">{WEEKDAYS.map(w=><div key={w} className="text-center">{w}</div>)}</div>
    <div className="grid grid-cols-7 gap-2">{days.map(iso=>{ const inMonth=fromISODate(iso).getMonth()===month; return (<div key={iso} className={'border rounded-md p-1 '+(inMonth?'bg-white':'bg-gray-50 opacity-70')}><div className="text-[11px] text-muted">{format(fromISODate(iso),'d')}</div>
      <div className="mt-1 space-y-1">{s.children.map(ch=>{ const pts=dailyPointsIfAllDone(s,ch.id,iso); const star=pts>0; return <div key={ch.id} className="flex items-center gap-1 text-[11px]"><span>{ch.avatarEmoji}</span><span className="truncate">{ch.name}</span>{star && <span>⭐</span>}</div> })}</div>
    </div>)})}</div>
  </div>)
}
