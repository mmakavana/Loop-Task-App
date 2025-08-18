import { APP_NAME, TAGLINE } from '../utils/constants'

export function Header() {
  return (
    <header className="mb-3">
      {/* Sage banner */}
      <div className="bg-primaryDeep text-white rounded-b-xl2 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7 text-center">
          <h1 className="font-bold tracking-tight text-[28px] sm:text-[32px]">
            {APP_NAME}
          </h1>
          <p className="mt-1 text-white/95 text-[15px] sm:text-[17px]">
            {TAGLINE}
          </p>
        </div>
      </div>
    </header>
  )
}
