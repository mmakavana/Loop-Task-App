import { APP_NAME, TAGLINE } from '../utils/constants'
export function Header(){ return (<header className="text-center"><h1 className="text-3xl font-bold">{APP_NAME}</h1><p className="text-sm text-muted mt-1">{TAGLINE}</p></header>) }
