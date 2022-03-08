import '../styles/base.css'
import '../styles/globals.css'

import SVG from 'react-inlinesvg';

function MyApp({ Component, pageProps }) {
  return (
    <main>
      <header>
        <span className="logomark">
          <SVG src={"/planet.svg"} />
        </span>
          
        <span className="word">
          Planetary
        </span>
      </header>

      <Component {...pageProps} />
    </main>
  )
}

export default MyApp
