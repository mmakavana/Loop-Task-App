export type TabKey = 'board' | 'calendar' | 'manage' | 'reports' | 'info'

export function TabNav({
  current,
  onChange,
}: {
  current: TabKey
  onChange: (k: TabKey) => void
}) {
  const items: { k: TabKey; label: string }[] = [
    { k: 'board', label: 'Board' },
    { k: 'calendar', label: 'Calendar' },
    { k: 'manage', label: 'Manage' },
    { k: 'reports', label: 'Reports' },
    { k: 'info', label: 'Info' },
  ]

  return (
    <nav className="tabbar">
      <ul className="tablist">
        {items.map((it) => {
          const active = current === it.k
          return (
            <li key={it.k}>
              <button
                className={`tab-pill ${active ? 'tab-pill-active' : ''}`}
                onClick={() => onChange(it.k)}
              >
                {it.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
