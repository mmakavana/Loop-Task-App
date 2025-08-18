import { ALLOWED_EMOJI } from '../utils/constants'

export function EmojiPicker({
  value,
  onChange,
}: {
  value?: string
  onChange: (v: string) => void
}) {
  // Renders ONLY from ALLOWED_EMOJI to prevent any stray/yellow faces.
  return (
    <div className="grid grid-cols-8 gap-2">
      {ALLOWED_EMOJI.map((e) => (
        <button
          type="button"
          key={e}
          className={
            'text-2xl leading-none p-1 rounded-md ' +
            (value === e ? 'ring-2 ring-primary bg-primaryMuted/40' : '')
          }
          onClick={() => onChange(e)}
          aria-label={'Avatar ' + e}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
