import HeroIllustration from './HeroIllustration'

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero-section" id="home">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span aria-hidden="true" className="eyebrow-mark">♥</span>
            স্বেচ্ছায় রক্তদান, মানবতার বন্ধন
          </div>
          <h1 id="hero-title">
            রক্ত দিন,
            <br />
            <span>জীবন বাঁচান</span>
          </h1>
          <p className="hero-description">
            আপনার এক ব্যাগ রক্ত হতে পারে একজন মানুষের নতুন জীবনের আশার আলো।
            আসুন, স্বেচ্ছায় রক্তদান করি এবং মানুষের পাশে দাঁড়াই।
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/register">
              রক্ত দান করুন <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#blood-request">
              <span aria-hidden="true" className="button-heart">＋</span>
              রক্ত প্রয়োজন?
            </a>
          </div>
          <div className="hero-note">
            <span aria-hidden="true" className="note-line" />
            <span>আহ্বান রক্তদান সংস্থা</span>
            <span aria-hidden="true" className="note-dot" />
            <span>মানবতার পাশে, সবসময়</span>
          </div>
        </div>

        <HeroIllustration />
      </div>
      <div aria-hidden="true" className="hero-bottom-rule" />
    </section>
  )
}

export default Hero
