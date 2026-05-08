import { useState } from 'react'

const product = {
  code: 'AB-01',
  name: 'Yeezy Airbags',
  price: '$20',
  image: '/products/ab-01.svg',
  audio: '/audio/whatever-works-preview.mp3',
  tweet: 'https://x.com/ninepixelgrid/status/2050635687792095531',
}

function App() {
  const [page, setPage] = useState<'home' | 'product'>('home')
  const [expanded, setExpanded] = useState(false)

  return (
    <main className="ya-shell">
      <header className="ya-header" aria-label="Site header">
        <button className="ya-wordmark" type="button" onClick={() => setPage('home')}>
          YEEZY AIRBAGS
        </button>
        <button className="ya-cart" type="button" aria-label="Cart">
          0
        </button>
      </header>

      {page === 'home' ? (
        <section className="ya-home" aria-labelledby="home-title">
          <h1 id="home-title" className="sr-only">
            Yeezy Airbags product index
          </h1>
          <button className="ya-product-tile" type="button" onClick={() => setPage('product')} aria-label="Open AB-01">
            <img src={product.image} alt="AB-01 steering wheel airbag" />
          </button>
        </section>
      ) : (
        <article className="ya-product" aria-labelledby="product-title">
          <section className="ya-product__media">
            <button className="ya-back" type="button" onClick={() => setPage('home')}>
              BACK
            </button>
            <img src={product.image} alt="AB-01 steering wheel airbag" />
          </section>

          <section className="ya-product__copy">
            <p className="ya-kicker">FOR WHEN YOU ARE CRASHING OUT</p>
            <h1 id="product-title">{product.name}</h1>
            <p className="ya-code">{product.code}</p>
            <p className="ya-price">{product.price}</p>

            <p className="ya-lede">
              Fictional impact protection for comment sections, quote tweets, and design discourse
              at unsafe speeds.
            </p>

            <div className="ya-actions">
              <a className="ya-buy" href={product.tweet} target="_blank" rel="noreferrer">
                DEPLOY AIRBAG
              </a>
              <button className="ya-secondary" type="button" onClick={() => setExpanded((value) => !value)}>
                {expanded ? 'LESS' : 'DETAILS'}
              </button>
            </div>

            {expanded && (
              <div className="ya-details">
                <p>
                  AB-01 is not safety equipment. It is a fictional soft landing for hard launches,
                  built for the exact moment a feed turns into a multi-car pileup.
                </p>
                <ul>
                  <li>Inflates on contact with unsolicited outrage.</li>
                  <li>Absorbs one public crash-out per billing cycle.</li>
                  <li>Pairs best with logging off and touching upholstery.</li>
                </ul>
              </div>
            )}

            <div className="ya-audio">
              <span>WHATEVER WORKS / PRODUCT TEST</span>
              <audio controls preload="none" src={product.audio}>
                <a href={product.audio}>Play preview</a>
              </audio>
            </div>

            <p className="ya-disclaimer">
              Parody product. Not affiliated with Yeezy. Do not install in a real vehicle.
            </p>
          </section>
        </article>
      )}
    </main>
  )
}

export default App
