import { doggedPursuitsContent } from '../content/doggedPursuits'

type DoggedPursuitsPopupProps = {
  mobileTakeover?: boolean
  onClose?: () => void
}

export function DoggedPursuitsPopup({ mobileTakeover = false, onClose }: DoggedPursuitsPopupProps) {
  const content = doggedPursuitsContent

  return (
    <aside
      className={`dogged-popup${mobileTakeover ? ' dogged-popup--takeover' : ''}`}
      aria-label="Dogged Pursuits show promotion"
      data-testid="dogged-popup"
    >
      <div className="dogged-popup__shell">
        <header className="dogged-popup__masthead">
          <a className="dogged-popup__brand" href={content.subscribeCta.href} target="_blank" rel="noreferrer">
            <span className="dogged-popup__mark" aria-hidden="true" />
            <span>{content.brand}</span>
          </a>
          {onClose && (
            <button
              type="button"
              className="dogged-popup__close"
              onClick={onClose}
              aria-label="Close Dogged Pursuits popup"
            >
              ×
            </button>
          )}
        </header>

        <div className="dogged-popup__body">
          <section className="dogged-popup__hero">
            <p className="dogged-popup__eyebrow">{content.eyebrow}</p>
            <h2>{content.headline}</h2>
            <p>{content.dek}</p>
          </section>

          <section className="dogged-popup__episode" aria-label="Latest episode">
            <div className="dogged-popup__episode-frame">
              <video
                aria-label={content.media.label}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={content.media.poster}
                src={content.media.clip}
              >
                <a href={content.primaryCta.href} target="_blank" rel="noreferrer">
                  {content.primaryCta.label}
                </a>
              </video>
              <a className="dogged-popup__video-cta" href={content.primaryCta.href} target="_blank" rel="noreferrer">
                {content.media.overlayCta}
              </a>
            </div>

            <div className="dogged-popup__episode-copy">
              <span>{content.episodeLabel}</span>
              <strong>{content.episodeTitle}</strong>
              <p>{content.episodeNote}</p>
            </div>

            <div className="dogged-popup__actions">
              <a className="dogged-popup__button dogged-popup__button--primary" href={content.primaryCta.href} target="_blank" rel="noreferrer">
                <PlayIcon />
                <span>{content.primaryCta.label}</span>
              </a>
              <a className="dogged-popup__fallback" href={content.fallbackCta.href} target="_blank" rel="noreferrer">
                {content.fallbackCta.label}
              </a>
            </div>
          </section>

          <section className="dogged-popup__process">
            <div className="dogged-popup__pillars">
              {content.pillars.map((pillar) => (
                <h3 key={pillar}>{pillar}</h3>
              ))}
            </div>
            <p>{content.body}</p>

            <a className="dogged-popup__subscribe" href={content.subscribeCta.href} target="_blank" rel="noreferrer">
              {content.subscribeCta.label}
            </a>

            <div className="dogged-popup__stats">
              {content.stats.map((stat) => (
                <div key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="dogged-popup__footer">
          <nav aria-label="Dogged Pursuits social links">
            {content.socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            ))}
          </nav>
        </footer>
      </div>
    </aside>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M6.5 5.6L10.6 8L6.5 10.4Z" />
    </svg>
  )
}
