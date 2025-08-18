import { useState } from 'react'
import ReportsSummary from '../components/ReportsSummary'
import AdjustmentsLog from '../components/AdjustmentsLog'
import StreakBonusLog from '../components/StreakBonusLog'
import PayoutHistory from '../components/PayoutHistory'
export default function ReportsPage(){
  const [tab,setTab]=useState<'summary'|'adjustments'|'streaks'|'payouts'>('summary')
  return (<div>
    <div className="flex gap-2 border-b mb-3">{(['summary','adjustments','streaks','payouts'] as const).map(t=> <button key={t} className={'px-3 py-2 '+(tab===t?'tab-active':'text-muted')} onClick={()=>setTab(t)}>{t==='summary'?'Summary':t==='adjustments'?'Adjustments':t==='streaks'?'Streak Bonuses':'Payouts'}</button>)}</div>
    {tab==='summary' && <ReportsSummary/>}
    {tab==='adjustments' && <AdjustmentsLog/>}
    {tab==='streaks' && <StreakBonusLog/>}
    {tab==='payouts' && <PayoutHistory/>}
  </div>)
}
