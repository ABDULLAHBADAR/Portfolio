import { useState } from 'react'
import { WEB3FORMS_ACCESS_KEY } from '../../data/content'
import { rv } from '../../hooks/useReveal'
import styles from './Contact.module.css'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.grid}>
        <div>
          <div ref={rv} className={`${styles.eyebrow} rv`}>
            (09) · Contact
          </div>
          <h2 ref={rv} className={`${styles.title} rv`} style={{ '--d': '0.08s' } as React.CSSProperties}>
            Let&apos;s build something that{' '}
            <span className={styles.titleEm}>works</span>.
          </h2>
        </div>
        <div ref={rv} className="rv" style={{ '--d': '0.2s' } as React.CSSProperties}>
          {status === 'sent' ? (
            <div className={styles.thanks}>
              <div className={styles.thanksTitle}>Message sent ✓</div>
              <div className={styles.thanksSub}>
                Thanks — it&apos;s in my inbox. I&apos;ll get back to you soon.
              </div>
            </div>
          ) : (
            /* no backend of our own: Web3Forms relays the message to my
               inbox without the address ever shipping with the site */
            <form
              className={styles.form}
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                setStatus('sending')
                try {
                  const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      access_key: WEB3FORMS_ACCESS_KEY,
                      subject: `Project inquiry · ${fd.get('name')}`,
                      name: fd.get('name'),
                      email: fd.get('email'),
                      message: fd.get('message'),
                    }),
                  })
                  const data = await res.json()
                  setStatus(data.success ? 'sent' : 'error')
                } catch {
                  setStatus('error')
                }
              }}
            >
              <input
                className={styles.input}
                required
                name="name"
                autoComplete="name"
                placeholder="Your name"
              />
              <input
                className={styles.input}
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
              />
              <textarea
                className={styles.textarea}
                required
                name="message"
                rows={3}
                placeholder="Tell me about your project"
              />
              <button
                type="submit"
                className={styles.submit}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  'Sending…'
                ) : (
                  <>
                    Send message <span className={styles.submitArrow}>→</span>
                  </>
                )}
              </button>
              {status === 'error' && (
                <div className={styles.error}>
                  Something went wrong — please try again in a moment.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
