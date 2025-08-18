import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { useStore } from './store/useStore'

function Root(){
  const init = useStore(s=>s.init)
  useEffect(()=>{ init() },[init])
  return <App/>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>)
