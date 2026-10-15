import { useState } from 'react'
import Reveal from '../shared/Reveal'

function BloodRequest() {
  const [notice, setNotice] = useState('')

  return (
    <section
      aria-labelledby="blood-request-title"
      className="section request-section"
      id="blood-request"
    >
      <div className="section-container">
        <Reveal className="request-card">
          <div aria-hidden="true" className="request-decoration request-decoration-one" />
          <div aria-hidden="true" className="request-decoration request-decoration-two" />
          <div className="request-content">
            <span className="request-kicker">
              <span aria-hidden="true" className="request-pulse" />
              জরুরি রক্তের প্রয়োজন?
            </span>
            <h2 id="blood-request-title">
              সময়মতো রক্ত,
              <br />
              বাঁচাতে পারে একটি জীবন
            </h2>
            <p>
              রোগীর রক্তের গ্রুপ ও প্রয়োজনীয় তথ্য প্রস্তুত রাখুন। আমাদের
              রক্তদাতা খোঁজার সুবিধা চালু হলে এখান থেকেই আবেদন করতে পারবেন।
            </p>
            <button
              className="button request-button"
              onClick={() => setNotice('অনলাইন রক্তের আবেদন সুবিধাটি শিগগিরই চালু হবে।')}
              type="button"
            >
              রক্তের আবেদন করুন <span aria-hidden="true">↗</span>
            </button>
            <p aria-live="polite" className="request-notice">
              {notice || 'অনলাইন আবেদন এখনো চালু হয়নি। জরুরি পরিস্থিতিতে নিকটস্থ হাসপাতাল বা ব্লাড ব্যাংকের সঙ্গে যোগাযোগ করুন।'}
            </p>
          </div>
          <div aria-hidden="true" className="request-visual">
            <div className="request-visual-ring">
              <svg viewBox="0 0 160 190" fill="none">
                <path d="M80 15c-17 26-37 46-37 72a37 37 0 0 0 74 0c0-26-20-46-37-72Z" fill="currentColor" />
                <path d="M62 88c2 12 9 19 20 22" stroke="white" strokeLinecap="round" strokeWidth="7" opacity=".58" />
              </svg>
            </div>
            <span className="request-visual-caption">একটু সহায়তা, অনেকটা আশা</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default BloodRequest
