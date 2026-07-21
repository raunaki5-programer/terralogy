import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 600, margin: '0 auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </pre>
          <button
            style={{ marginTop: 20, padding: '8px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
