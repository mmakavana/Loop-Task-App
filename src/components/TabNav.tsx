export type TabKey = 'board' | 'calendar' | 'manage' | 'reports' | 'info'

export function TabNav({ current, onChange }: { current: TabKey, onChange: (k: TabKey) => void }) {
  const items: { k: TabKey, label: string }[] = [
    { k: 'board', label: 'Board' },
    { k: 'calendar', label: 'Calendar' },
    { k: 'manage', label: 'Manage' },
    { k: 'reports', label: 'Reports' },
    { k: 'info', label: 'Info' },
  ]
  return (
    <nav className="border-b border-line">
      <ul className="flex gap-4">
        {items.map(it => (
          <li key={it.k}>
            <button
              className={`tab ${current === it.k ? 'tab-active' : ''}`}
              onClick={() => onChange(it.k)}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
