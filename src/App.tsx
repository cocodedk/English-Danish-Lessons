import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  page: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: '#E5ECF1',
    color: '#14233B',
    fontFamily: "'Bricolage Grotesque Variable', system-ui, sans-serif",
    fontSize: 64,
    fontWeight: 800,
  },
})

export function App() {
  return (
    <main {...stylex.props(styles.page)}>
      <h1>Hej.</h1>
    </main>
  )
}
