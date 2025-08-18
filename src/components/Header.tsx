import { APP_NAME, TAGLINE } from '../utils/constants'

export function Header() {
  return (
    <header className="mb-3">
      {/* Medium-height sage banner (~100px visual height via padding) */}
      <div className="bg-primaryDeep text-white shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-8 text-center">
          {/* Loop title: bumped further to stand out */}
          <h1 className="font-bold tracking-tight text-[36px] sm:text-[40px] leading-tight">
            {APP_NAME}
          </h1>
          {/* Tagline: +3 over prior, white, clear but not shouty */}
          <p className="mt-1 text-white/95 text-[20px] sm:text-[21px] leading-snug">
            {TAGLINE}
          </p>
        </div>
      </div>

      {/* Optional rhythm line below banner */}
      <div className="app-hr" />
    </header>
  )
}
