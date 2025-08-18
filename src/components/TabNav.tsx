export type TabKey='board'|'calendar'|'manage'|'reports'|'info'
export function TabNav({current,onChange}:{current:TabKey,onChange:(k:TabKey)=>void}){
  const items:[TabKey,string][]= [['board','Board'],['calendar','Calendar'],['manage','Manage'],['reports','Reports'],['info','Info']]
  return (<nav className="border-b"><ul className="flex gap-4">{items.map(([k,l])=> <li key={k}><button className={'px-3 py-2 '+(current===k?'tab-active':'text-muted')} onClick={()=>onChange(k)}>{l}</button></li>)}</ul></nav>)
}
