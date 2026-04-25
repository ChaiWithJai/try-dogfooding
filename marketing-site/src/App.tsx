import { useState, useRef, useCallback, useEffect } from 'react'
import { siteContent, type DesktopIconItem } from './content/siteContent'

type ViewMode = 'desktop' | 'website'
type WindowMode = 'normal' | 'minimized' | 'maximized' | 'closed'
type DragState = { isDragging: boolean; startX: number; startY: number; offsetX: number; offsetY: number }

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [activeTab, setActiveTab] = useState(siteContent.featureTabs[0].id)
  const [operatorCards, setOperatorCards] = useState(siteContent.operators.cards)
  const [bannerClosed, setBannerClosed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [windowMode, setWindowMode] = useState<WindowMode>('normal')
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<DragState>({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  // P1: Desktop icons update window title
  const [windowTitle, setWindowTitle] = useState<string>(siteContent.window.title)

  // P1: Desktop icon drag-and-drop
  const [leftIcons, setLeftIcons] = useState<Array<DesktopIconItem & { onClick?: () => void }>>([
    ...siteContent.desktopIcons.left,
  ])
  const [rightIcons, setRightIcons] = useState<DesktopIconItem[]>([...siteContent.desktopIcons.right])
  const [draggingIcon, setDraggingIcon] = useState<{ rail: 'left' | 'right'; index: number } | null>(null)

  // P2: Right-click context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // P2: Window focus/blur
  const [windowFocused, setWindowFocused] = useState(true)

  // P2: Toolbar format toggles
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  const handleWindowDragStart = useCallback((e: React.MouseEvent) => {
    if (windowMode !== 'normal' || viewMode !== 'desktop') return
    e.preventDefault()
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - windowPos.x,
      startY: e.clientY - windowPos.y,
      offsetX: windowPos.x,
      offsetY: windowPos.y,
    }
  }, [windowMode, viewMode, windowPos])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return
      setWindowPos({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY,
      })
    }
    const handleMouseUp = () => {
      dragRef.current.isDragging = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleTrafficLight = useCallback((action: 'close' | 'minimize' | 'maximize') => {
    if (action === 'close') {
      setWindowMode('closed')
    } else if (action === 'minimize') {
      setWindowMode((prev) => (prev === 'minimized' ? 'normal' : 'minimized'))
    } else if (action === 'maximize') {
      setWindowMode((prev) => (prev === 'maximized' ? 'normal' : 'maximized'))
      setWindowPos({ x: 0, y: 0 })
    }
  }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  // P1: Desktop icon click => scroll + update window title
  const handleIconClick = useCallback((item: DesktopIconItem) => {
    setWindowTitle(item.label)
    setWindowFocused(true)
    if (windowMode === 'closed' || windowMode === 'minimized') {
      setWindowMode('normal')
    }
  }, [windowMode])

  // P1: Icon drag-and-drop handlers
  const handleIconDragStart = useCallback((rail: 'left' | 'right', index: number) => {
    setDraggingIcon({ rail, index })
  }, [])

  const handleIconDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleIconDrop = useCallback((rail: 'left' | 'right', dropIndex: number) => {
    if (!draggingIcon || draggingIcon.rail !== rail) {
      setDraggingIcon(null)
      return
    }
    const setter = rail === 'left' ? setLeftIcons : setRightIcons
    setter((prev: DesktopIconItem[]) => {
      const copy = [...prev]
      const [moved] = copy.splice(draggingIcon.index, 1)
      copy.splice(dropIndex, 0, moved)
      return copy
    })
    setDraggingIcon(null)
  }, [draggingIcon])

  // P2: Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'desktop') return
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [viewMode])

  // Close context menu on any click
  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // P2: Desktop click deselects window
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.reader-window') || target.closest('.desktop-icon') || target.closest('.taskbar') || target.closest('.cookie-banner') || target.closest('.context-menu')) return
    setWindowFocused(false)
    setContextMenu(null)
  }, [])

  // P2: Toolbar format toggle
  const toggleFormat = useCallback((format: string) => {
    setActiveFormats((prev) => {
      const next = new Set(prev)
      if (next.has(format)) next.delete(format)
      else next.add(format)
      return next
    })
  }, [])

  const activeFeature =
    siteContent.featureTabs.find((tab) => tab.id === activeTab) ?? siteContent.featureTabs[0]

  // Build left rail with switch toggle appended and onClick wired
  const leftRailItems: Array<DesktopIconItem & { onClick?: () => void }> = [
    ...leftIcons.map((item) => ({
      ...item,
      onClick: item.onClick ?? (() => handleIconClick(item)),
    })),
    {
      label: viewMode === 'desktop' ? 'Switch to website mode' : 'Switch to desktop mode',
      href: '#top',
      icon: siteContent.desktopIcons.switchIcon,
      onClick: () => setViewMode((mode) => (mode === 'desktop' ? 'website' : 'desktop')),
    },
  ]

  const shellClassName = [
    'site-shell',
    `site-shell--${viewMode}`,
    darkMode ? 'site-shell--dark' : '',
  ].filter(Boolean).join(' ')

  const windowClassName = [
    'reader-window',
    windowMode !== 'normal' ? `reader-window--${windowMode}` : '',
  ].filter(Boolean).join(' ')

  const windowStyle = viewMode === 'desktop' && windowMode === 'normal'
    ? { transform: `translate(${windowPos.x}px, ${windowPos.y}px)` }
    : undefined

  return (
    <div
      className={shellClassName}
      onContextMenu={handleContextMenu}
      onClick={handleDesktopClick}
    >
      <Taskbar />

      <div className="desktop-decoration" aria-hidden="true">
        <img src={siteContent.art.garden} alt="" loading="lazy" />
      </div>

      {viewMode === 'desktop' && (
        <DesktopRail
          position="left"
          items={leftRailItems}
          onDragStart={(i) => handleIconDragStart('left', i)}
          onDragOver={handleIconDragOver}
          onDrop={(i) => handleIconDrop('left', i)}
        />
      )}
      {viewMode === 'desktop' && (
        <DesktopRail
          position="right"
          items={rightIcons}
          onDragStart={(i) => handleIconDragStart('right', i)}
          onDragOver={handleIconDragOver}
          onDrop={(i) => handleIconDrop('right', i)}
        />
      )}

      {windowMode === 'closed' && (
        <button
          type="button"
          className="window-reopen"
          onClick={() => setWindowMode('normal')}
        >
          Reopen home.mdx
        </button>
      )}

      <main
        ref={windowRef}
        className={`${windowClassName}${windowFocused ? '' : ' reader-window--blurred'}`}
        id="top"
        style={windowStyle}
        onClick={() => setWindowFocused(true)}
      >
        <WindowChrome
          onDragStart={handleWindowDragStart}
          onTrafficLight={handleTrafficLight}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          windowTitle={windowTitle}
          activeFormats={activeFormats}
          onToggleFormat={toggleFormat}
        />

        <div className="reader-body">
          <section className="hero-section section" id="demo">
            <div className="hero-section__copy">
              <p className="eyebrow">{siteContent.hero.eyebrow}</p>

              <div className="hero-section__wordmark">
                <LogoMark />
                <span>{siteContent.brand.name}</span>
              </div>

              <h1>{siteContent.hero.headline}</h1>
              <p className="hero-section__subheadline">{siteContent.hero.subheadline}</p>
              <p className="hero-section__body">{siteContent.hero.body}</p>

              <div className="hero-section__actions">
                <a className="button-link button-link--primary" href={siteContent.hero.primaryCta.href}>
                  {siteContent.hero.primaryCta.label}
                </a>
                <a className="button-link button-link--secondary" href={siteContent.hero.secondaryCta.href}>
                  {siteContent.hero.secondaryCta.label}
                </a>
              </div>

              <div className="hero-section__utility-links">
                {siteContent.hero.utilityLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={isExternalLink(link) ? '_blank' : undefined}
                    rel={isExternalLink(link) ? 'noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <p className="hero-section__trust">{siteContent.hero.trustNote}</p>
            </div>

            <div className="hero-section__media">
              <img src={siteContent.hero.image} alt="Professor Jai teaching in a classroom" />
            </div>
          </section>

          <section className="section install-section" id="install">
            <div className="section-heading">
              <p className="eyebrow">{siteContent.install.eyebrow}</p>
              <h2>{siteContent.install.heading}</h2>
              <p>{siteContent.install.body}</p>
            </div>

            <div className="install-panel">
              <div>
                <p className="install-panel__label">Paste into your terminal</p>
                <code>{siteContent.install.command}</code>
              </div>
              <div>
                <p className="install-panel__label">Prefer npm?</p>
                <code>{siteContent.install.secondaryCommand}</code>
              </div>
              <p className="install-panel__note">{siteContent.install.note}</p>
            </div>
          </section>

          <section className="section how-it-works-section" id="how-it-works">
            <div className="section-heading">
              <h2>{siteContent.howItWorks.heading}</h2>
              <p>{siteContent.howItWorks.subhead}</p>
            </div>
            <div className="steps-grid">
              {siteContent.howItWorks.steps.map((step) => (
                <div key={step.number} className="step-card">
                  <span className="step-card__number">{step.number}</span>
                  <h3 className="step-card__title">{step.title}</h3>
                  <p className="step-card__body">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section section--feature" id="product-os">
            <div className="feature-tabs">
              <div className="feature-tabs__nav" role="tablist" aria-label="Starter kit tabs">
                {siteContent.featureTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={tab.id === activeTab}
                    className={`feature-tabs__tab${tab.id === activeTab ? ' feature-tabs__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="feature-panel">
                <div className="feature-panel__intro">
                  <h2>{activeFeature.title}</h2>
                  <div className="feature-panel__lede">
                    <p>{activeFeature.bodyLeft}</p>
                    <p>{activeFeature.bodyRight}</p>
                  </div>
                </div>

                <div className="feature-panel__content">
                  <ul className="feature-list" aria-label="Left feature list">
                    {activeFeature.leftLinks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <div className="feature-prompt">
                    <LogoMark />
                    <h3>Hello, operator!</h3>
                    <div className="feature-prompt__input">{activeFeature.promptPlaceholder}</div>
                    <div className="feature-prompt__mode">/ for commands</div>
                    <div className="feature-prompt__chips">
                      {activeFeature.chips.map((chip) => (
                        <span key={chip}>{chip}</span>
                      ))}
                    </div>
                  </div>

                  <ul className="feature-list feature-list--right" aria-label="Right feature list">
                    {activeFeature.rightLinks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="section" id="operators">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">Operators</p>
                <h2>{siteContent.operators.heading}</h2>
                <p>{siteContent.operators.body}</p>
              </div>
              <button
                type="button"
                className="button-link button-link--ghost"
                onClick={() => setOperatorCards((cards) => shuffleList(cards))}
              >
                Shuffle operators
              </button>
            </div>

            <div className="operator-grid">
              {operatorCards.map((card) => (
                <article key={`${card.fileLabel}-${card.title}`} className="operator-card">
                  <p className="operator-card__file">{card.fileLabel}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <span>{card.note}</span>
                </article>
              ))}
            </div>

            <p className="section-note">{siteContent.operators.placeholder}</p>
          </section>

          <section className="section section--split-content">
            <div className="art-card">
              <img src={siteContent.stack.image} alt="School library and tech lab" loading="lazy" />
            </div>

            <div className="copy-card">
              <p className="eyebrow">{siteContent.stack.eyebrow}</p>
              <h2>{siteContent.stack.heading}</h2>
              <p>{siteContent.stack.body}</p>

              <ul className="bullet-list">
                {siteContent.stack.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <a className="file-link" href="#reading">
                {siteContent.stack.footnote}
              </a>
            </div>
          </section>

          <section className="section pricing-section" id="pricing">
            <div className="section-heading">
              <p className="eyebrow">Pricing</p>
              <h2>{siteContent.pricing.heading}</h2>
              <p>{siteContent.pricing.body}</p>
            </div>

            <div className="pricing-section__grid">
              <div className="pricing-table">
                <div className="pricing-table__header">
                  <span>Product</span>
                  <span>Entry point</span>
                  <span>Pricing</span>
                </div>

                {siteContent.pricing.rows.map((row) => (
                  <div key={row.label} className="pricing-table__row">
                    <span>
                      <strong>{row.index}</strong>
                      <em>{row.label}</em>
                    </span>
                    <span>{row.freeTier}</span>
                    <span>{row.pricing}</span>
                  </div>
                ))}
              </div>

              <div className="art-card art-card--compact">
                <img src={siteContent.pricing.image} alt="Principal Biscuit's office" loading="lazy" />
              </div>
            </div>
          </section>

          <section className="section section--split-content">
            <div className="art-card art-card--wide">
              <img src={siteContent.builder.image} alt="Professor Jai grading at night" loading="lazy" />
            </div>

            <div className="copy-card">
              <p className="eyebrow">Claude Code</p>
              <h2>{siteContent.builder.heading}</h2>
              <p>{siteContent.builder.body}</p>
              <p>{siteContent.builder.note}</p>

              <div className="builder-panel">
                <div className="builder-panel__prompt">{siteContent.builder.promptPreview}</div>
                <div className="feature-prompt__chips feature-prompt__chips--inline">
                  {siteContent.builder.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="section meet-jai-section" id="meet-jai">
            <div className="section-heading">
              <p className="eyebrow">{siteContent.meetJai.eyebrow}</p>
              <h2>{siteContent.meetJai.headline}</h2>
            </div>

            <div className="meet-jai-layout">
              <div className="meet-jai-photo">
                <img src={siteContent.meetJai.image} alt="Professor Jai — creator of TryDogfooding" loading="lazy" />
              </div>

              <div className="meet-jai-content">
                <blockquote className="meet-jai-purpose">
                  {siteContent.meetJai.purpose}
                </blockquote>

                <div className="meet-jai-origin">
                  <div className="origin-block">
                    <span className="origin-label">{siteContent.meetJai.origin.then.label}</span>
                    <p>{siteContent.meetJai.origin.then.body}</p>
                  </div>
                  <div className="origin-block">
                    <span className="origin-label">{siteContent.meetJai.origin.now.label}</span>
                    <p>{siteContent.meetJai.origin.now.body}</p>
                  </div>
                  <div className="origin-block">
                    <span className="origin-label">{siteContent.meetJai.origin.why.label}</span>
                    <p>{siteContent.meetJai.origin.why.body}</p>
                  </div>
                </div>

                <div className="meet-jai-goal">
                  <h3>{siteContent.meetJai.goal}</h3>
                  <p>{siteContent.meetJai.goalNote}</p>
                </div>

                <a className="button-link button-link--primary" href={siteContent.meetJai.ctaHref}>
                  {siteContent.meetJai.ctaLabel}
                </a>
              </div>
            </div>
          </section>

          <section className="section" id="why">
            <div className="section-heading">
              <p className="eyebrow">Why Dogfooding</p>
              <h2>{siteContent.why.heading}</h2>
              <p>{siteContent.why.body}</p>
            </div>

            <div className="why-grid">
              {siteContent.why.points.map((point) => (
                <article key={point} className="why-card">
                  <p>{point}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section manifesto-section" id="manifesto">
            <div className="section-heading">
              <p className="eyebrow">The manifesto</p>
              <h2>{siteContent.manifesto.heading}</h2>
            </div>
            <div className="manifesto-grid">
              {siteContent.manifesto.paragraphs.map((p) => (
                <div key={p.heading} className="manifesto-card">
                  <h3>{p.heading}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
            <div className="manifesto-cta">
              <a className="button-link" href={siteContent.manifesto.ctaHref}>
                {siteContent.manifesto.ctaLabel}
              </a>
            </div>
          </section>

          <section className="section" id="reading">
            <div className="section-heading">
              <p className="eyebrow">Bedtime reading</p>
              <h2>{siteContent.reading.heading}</h2>
              <p>{siteContent.reading.body}</p>
            </div>

            <div className="reading-links">
              {siteContent.reading.links.map((link) => (
                <a
                  key={link.label}
                  className="reading-link"
                  href={link.href}
                  target={isExternalLink(link) ? '_blank' : undefined}
                  rel={isExternalLink(link) ? 'noreferrer' : undefined}
                >
                  <span>{link.label}</span>
                  <ArrowIcon />
                </a>
              ))}
            </div>
          </section>

          <section className="section email-signup-section" id="email-signup">
            <EmailSignup />
          </section>

          <section className="section workshop-section" id="workshop">
            <div className="section-heading">
              <p className="eyebrow">{siteContent.workshop.eyebrow}</p>
              <h2>{siteContent.workshop.heading}</h2>
              <p>{siteContent.workshop.subhead}</p>
            </div>

            <div className="workshop-agenda">
              <h3>Workshop agenda</h3>
              <div className="workshop-agenda__timeline">
                {siteContent.workshop.agenda.map((item) => (
                  <div key={item.time} className="workshop-agenda__item">
                    <span className="workshop-agenda__time">{item.time}</span>
                    <span className="workshop-agenda__activity">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="workshop-faq">
              <h3>Common questions</h3>
              {siteContent.workshop.faq.map((item) => (
                <details key={item.q} className="workshop-faq__item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="section cta-section" id="cta">
            <div className="cta-card">
              <div className="cta-card__media">
                <img src={siteContent.cta.image} alt="Graduation ceremony" loading="lazy" />
              </div>

              <div className="cta-card__content">
                <p className="eyebrow">Shameless CTA</p>
                <h2>{siteContent.cta.heading}</h2>
                <p>{siteContent.cta.body}</p>

                <ul className="bullet-list bullet-list--compact">
                  {siteContent.cta.options.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div className="cta-card__price">
                  <span>{siteContent.cta.priceLabel}</span>
                  <strong>{siteContent.cta.priceValue}</strong>
                  <p>{siteContent.cta.priceDetail}</p>
                </div>

                <div className="hero-section__actions">
                  <a
                    className="button-link button-link--primary"
                    href={siteContent.cta.primaryCta.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {siteContent.cta.primaryCta.label}
                  </a>
                  <a className="button-link button-link--secondary" href={siteContent.cta.secondaryCta.href}>
                    {siteContent.cta.secondaryCta.label}
                  </a>
                </div>

                <p className="section-note">{siteContent.cta.footnote}</p>
              </div>
            </div>
          </section>

          <footer className="footer" id="footer">
            <div className="footer__brand">
              <LogoMark />
              <div>
                <h2>{siteContent.brand.name}</h2>
                <p>{siteContent.brand.taglineLong}</p>
              </div>
            </div>

            <div className="footer__columns">
              {siteContent.footer.columns.map((column) => (
                <div key={column.heading} className="footer__column">
                  <p className="footer__heading">{column.heading}</p>
                  <div className="footer__links">
                    {column.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={isExternalLink(link) ? '_blank' : undefined}
                        rel={isExternalLink(link) ? 'noreferrer' : undefined}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="footer__legal">
              {siteContent.footer.legal.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <p className="footer__copyright">{siteContent.footer.copyright}</p>
          </footer>
        </div>
      </main>

      <div className="mobile-rail" aria-label="Quick links">
        {siteContent.desktopIcons.left.slice(0, 4).map((item) => (
          <a key={item.label} href={item.href} className="mobile-rail__item">
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {!bannerClosed && <CookieBanner onClose={() => setBannerClosed(true)} />}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={(action) => {
            setContextMenu(null)
            if (action === 'toggle-dark') toggleDarkMode()
            else if (action === 'toggle-mode') setViewMode((m) => (m === 'desktop' ? 'website' : 'desktop'))
            else if (action === 'refresh') window.location.reload()
          }}
          darkMode={darkMode}
          viewMode={viewMode}
        />
      )}
    </div>
  )
}

function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('submitting')

    try {
      const formData = new FormData()
      formData.append('form-name', 'email-signup')
      formData.append('email', email)

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="email-signup email-signup--success">
        <div className="email-signup__check">✓</div>
        <p className="email-signup__success-text">{siteContent.emailSignup.successMessage}</p>
      </div>
    )
  }

  return (
    <div className="email-signup">
      <div className="email-signup__copy">
        <h3>{siteContent.emailSignup.heading}</h3>
        <p>{siteContent.emailSignup.body}</p>
      </div>
      <form
        className="email-signup__form"
        name="email-signup"
        method="POST"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          name="email"
          required
          placeholder={siteContent.emailSignup.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="email-signup__input"
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          className="button-link button-link--primary email-signup__button"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Joining...' : siteContent.emailSignup.submitLabel}
        </button>
      </form>
      {status === 'error' && (
        <p className="email-signup__error">Something went wrong. Try again or email hello@trydogfooding.com directly.</p>
      )}
    </div>
  )
}

function Taskbar() {
  return (
    <header className="taskbar">
      <a className="taskbar__brand" href="#top">
        <LogoMark compact />
        <span>{siteContent.brand.name}</span>
      </a>

      <nav className="taskbar__nav" aria-label="Primary">
        {siteContent.taskbar.links.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="taskbar__actions">
        <a className="taskbar__cta" href="#cta">
          {siteContent.taskbar.ctaLabel}
        </a>
        <span className="taskbar__icon">
          <SearchIcon />
        </span>
        <span className="taskbar__icon">
          <BubbleIcon />
        </span>
        <span className="taskbar__count">1</span>
        <span className="taskbar__icon">
          <UserIcon />
        </span>
      </div>
    </header>
  )
}

function DesktopRail({
  items,
  position,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  items: readonly (DesktopIconItem & { onClick?: () => void })[]
  position: 'left' | 'right'
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (index: number) => void
}) {
  return (
    <aside className={`desktop-rail desktop-rail--${position}`}>
      {items.map((item, index) => {
        const inner = (
          <>
            <span className="desktop-icon__frame">
              <img src={item.icon} alt="" />
            </span>
            <span className="desktop-icon__label">{item.label}</span>
          </>
        )

        return item.onClick ? (
          <button
            key={item.label}
            type="button"
            className="desktop-icon"
            onClick={item.onClick}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
          >
            {inner}
          </button>
        ) : (
          <a
            key={item.label}
            className="desktop-icon"
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noreferrer' : undefined}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
          >
            {inner}
          </a>
        )
      })}
    </aside>
  )
}

function WindowChrome({
  onDragStart,
  onTrafficLight,
  onToggleDarkMode,
  darkMode,
  windowTitle,
  activeFormats,
  onToggleFormat,
}: {
  onDragStart: (e: React.MouseEvent) => void
  onTrafficLight: (action: 'close' | 'minimize' | 'maximize') => void
  onToggleDarkMode: () => void
  darkMode: boolean
  windowTitle: string
  activeFormats: Set<string>
  onToggleFormat: (format: string) => void
}) {
  return (
    <>
      <div
        className="window-header"
        onMouseDown={onDragStart}
      >
        <div className="window-header__file">
          <img src={siteContent.desktopIcons.left[0].icon} alt="" />
          <span>{windowTitle}</span>
        </div>
        <div className="window-header__title">{windowTitle}</div>
        <div className="window-header__controls">
          <button
            type="button"
            className="traffic-light traffic-light--close"
            aria-label="Close window"
            onClick={(e) => { e.stopPropagation(); onTrafficLight('close') }}
          />
          <button
            type="button"
            className="traffic-light traffic-light--minimize"
            aria-label="Minimize window"
            onClick={(e) => { e.stopPropagation(); onTrafficLight('minimize') }}
          />
          <button
            type="button"
            className="traffic-light traffic-light--maximize"
            aria-label="Maximize window"
            onClick={(e) => { e.stopPropagation(); onTrafficLight('maximize') }}
          />
        </div>
      </div>

      <div className="window-toolbar">
        <div className="window-toolbar__group">
          <button type="button" aria-label="Back">
            ↺
          </button>
          <button type="button" aria-label="Forward">
            ↻
          </button>
          <button type="button" aria-label="Zoom">
            Zoom
          </button>
        </div>

        <div className="window-toolbar__group">
          <button
            type="button"
            className={activeFormats.has('bold') ? 'toolbar-btn--active' : ''}
            onClick={() => onToggleFormat('bold')}
          >B</button>
          <button
            type="button"
            className={activeFormats.has('italic') ? 'toolbar-btn--active' : ''}
            onClick={() => onToggleFormat('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={activeFormats.has('underline') ? 'toolbar-btn--active' : ''}
            onClick={() => onToggleFormat('underline')}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={activeFormats.has('font') ? 'toolbar-btn--active' : ''}
            onClick={() => onToggleFormat('font')}
          >Font</button>
        </div>

        <div className="window-toolbar__group window-toolbar__group--end">
          <button type="button" aria-label="Search">
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Toggle dark mode"
            className={`toolbar-darkmode${darkMode ? ' toolbar-darkmode--active' : ''}`}
            onClick={onToggleDarkMode}
          >
            {darkMode ? <MoonIcon /> : <SunIcon />}
          </button>
          <a className="button-link button-link--toolbar" href="#cta">
            {siteContent.window.toolbarCta}
          </a>
        </div>
      </div>
    </>
  )
}

function CookieBanner({ onClose }: { onClose: () => void }) {
  return (
    <aside className="cookie-banner">
      <button type="button" className="cookie-banner__close" onClick={onClose} aria-label="Close banner">
        ×
      </button>
      <p className="cookie-banner__title">Required local-first banner</p>
      <p>
        TryDogfooding does not run your workflows on our servers. Your data stays on your machine, and telemetry is
        opt-in.
      </p>
      <p>That is the whole point of the starter kit, so we figured the banner should say it plainly.</p>
      <div className="cookie-banner__mark">
        <LogoMark compact />
      </div>
    </aside>
  )
}

function ContextMenu({
  x,
  y,
  onAction,
  darkMode,
  viewMode,
}: {
  x: number
  y: number
  onAction: (action: string) => void
  darkMode: boolean
  viewMode: ViewMode
}) {
  return (
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" onClick={() => onAction('refresh')}>
        ↺ Refresh
      </button>
      <div className="context-menu__divider" />
      <button type="button" onClick={() => onAction('toggle-dark')}>
        {darkMode ? '☀ Light mode' : '☾ Dark mode'}
      </button>
      <button type="button" onClick={() => onAction('toggle-mode')}>
        {viewMode === 'desktop' ? '⊞ Website mode' : '⊞ Desktop mode'}
      </button>
      <div className="context-menu__divider" />
      <button type="button" disabled>
        ⓘ About TryDogfooding
      </button>
    </div>
  )
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={`logo-mark${compact ? ' logo-mark--compact' : ''}`}
      viewBox="0 0 88 88"
      aria-hidden="true"
      fill="none"
    >
      <rect x="8" y="8" width="72" height="72" rx="20" />
      <path d="M22 46H38L48 30L66 58" />
      <circle cx="24" cy="46" r="5" />
      <circle cx="48" cy="30" r="5" />
      <circle cx="66" cy="58" r="5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8H13" />
      <path d="M8 3L13 8L8 13" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.2 10.2L14 14" />
    </svg>
  )
}

function BubbleIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 3.5H13V10.5H8.5L5.5 13V10.5H3Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3.5 13C4.2 10.8 5.8 9.8 8 9.8C10.2 9.8 11.8 10.8 12.5 13" />
    </svg>
  )
}


function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5V3" />
      <path d="M8 13V14.5" />
      <path d="M1.5 8H3" />
      <path d="M13 8H14.5" />
      <path d="M3.4 3.4L4.5 4.5" />
      <path d="M11.5 11.5L12.6 12.6" />
      <path d="M12.6 3.4L11.5 4.5" />
      <path d="M4.5 11.5L3.4 12.6" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13.5 8.5C13.5 12 10.8 14 8 14C4.7 14 2 11.3 2 8C2 5.2 4 2.5 7.5 2.5C6.5 4 6.2 5.8 6.8 7.5C7.4 9.2 8.8 10.5 10.5 11C11.6 11.3 12.7 10.2 13.5 8.5Z" />
    </svg>
  )
}

function shuffleList<T>(items: readonly T[]): T[] {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }

  return copy
}

function isExternalLink(link: { href: string; external?: boolean }) {
  return 'external' in link && Boolean(link.external)
}

export default App
