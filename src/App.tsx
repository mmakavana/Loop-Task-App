import { useState } from 'react'
import { Header } from './components/Header'
import { TabNav, TabKey } from './components/TabNav'
import BoardPage from './pages/Board'
import CalendarPage from './pages/Calendar'
import ManagePage from './pages/Manage'
import ReportsPage from './pages/Reports'
import InfoPage from './pages/Info'
import { useStore } from './store/useStore'

export default function App(){
  const [tab, setTab] = useState<TabKey>('board')
  const ready = useStore(s=>s.ready)
  if(!ready) return <div className="p-6">Loading…</div>
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <Header/>
      <div className="mt-4"><TabNav current={tab} onChange={setTab}/></div>
      <div className="mt-4 space-y-4">
        {tab==='board' && <BoardPage/>}
        {tab==='calendar' && <CalendarPage/>}
        {tab==='manage' && <ManagePage/>}
        {tab==='reports' && <ReportsPage/>}
        {tab==='info' && <InfoPage/>}
      </div>
    </div>
  )
}
