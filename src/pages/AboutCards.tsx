import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { BUILD_DATE, FIRST_PUBLISHED, formatDate } from '../about/buildInfo'
import { ExternalLink } from '../components/ExternalLink'
import { COCODE, DDO, ISSUES, LICENSE_URL, OFL, REPO } from '../links'
import { space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'

const styles = stylex.create({ card: { display: 'flex', flexDirection: 'column', gap: space.s12 } })

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} {...stylex.props(ui.card, styles.card)}>
      <h2 id={id} {...stylex.props(ui.h2)}>{title}</h2>
      {children}
    </section>
  )
}

const P = ({ children }: { children: ReactNode }) => <p {...stylex.props(ui.body)}>{children}</p>

/** The seven cards of the About page, in order. */
export function AboutCards() {
  return (
    <>
      <Card id="about-what" title="What it is">
        <P>
          Hej. teaches English speakers to hear and say Danish. Each lesson is a house on your street, and every word you hear and say lights a window.
        </P>
        <P>It is free, has no accounts and no ads, and runs entirely in your browser.</P>
      </Card>
      <Card id="about-made-by" title="Made by">
        <P>Made by Babak at <ExternalLink href={COCODE}>cocode.dk</ExternalLink>.</P>
        <P>First published {formatDate(FIRST_PUBLISHED)}.</P>
        <P>Updated {formatDate(BUILD_DATE)}.</P>
      </Card>
      <Card id="about-how" title="How it works">
        <P>
          Hear each Danish word, say it out loud, then tap “I said it” to light its window. On a lesson word you can also record yourself and listen back; your recording never leaves your device. The Sounds page covers the letters and sounds English speakers trip on.
        </P>
      </Card>
      <Card id="about-danish" title="Where the Danish comes from">
        <P>
          The pronunciation symbols (IPA) are taken from Den Danske Ordbog (<ExternalLink href={DDO}>ordnet.dk</ExternalLink>). The sound you hear is your own device’s Danish voice reading the word: it is not a recording from the dictionary or from a native speaker, and it can differ from how a Dane says it. The English sound guides are written by hand and are approximate.
        </P>
        <P>
          The Danish and its sound guides are a draft until a Danish speaker has read them. If you spot a mistake, please <ExternalLink href={ISSUES}>tell us on GitHub</ExternalLink>.
        </P>
      </Card>
      <Card id="about-privacy" title="Your privacy">
        <P>
          Hej. saves your name, your progress and your colour choice in this browser only. Nothing is sent anywhere, and there are no accounts, no ads and no tracking.
        </P>
      </Card>
      <Card id="about-credits" title="Credits">
        <P>
          Built with React, Vite and StyleX. Fonts: Bricolage Grotesque, Atkinson Hyperlegible Next and Noto Sans, under the <ExternalLink href={OFL}>SIL Open Font License</ExternalLink>. The Danish flag icon is the Dannebrog.
        </P>
        <P>
          Source code on <ExternalLink href={REPO}>GitHub</ExternalLink>, licensed under the Apache License 2.0 (<ExternalLink href={LICENSE_URL}>licence</ExternalLink>).
        </P>
      </Card>
      <Card id="about-agents" title="For agents">
        <P>
          This site declares WebMCP tools on every page, so an agent in your browser can read what is on screen. They are listed in{' '}
          <a href="./llms.txt" {...stylex.props(ui.focusable, ui.textLink)}>llms.txt</a>.
        </P>
      </Card>
    </>
  )
}
