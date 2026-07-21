import { useState, useEffect } from 'react'

interface ConsoleMessage {
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

interface BottomPanelProps {
  messages: ConsoleMessage[]
  height: number
}

export default function BottomPanel({ messages, height }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState('console')
  const [isMinimized, setIsMinimized] = useState(false)

  const tabs = ['Console', 'Processing', 'AI Logs', 'Downloads', 'Recent Tasks']

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ'
      case 'success': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✗'
      default: return '•'
    }
  }

  return (
    <div className="bottom-panel" style={{ height: isMinimized ? 32 : height }}>
      <div className="bottom-tabs">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`bottom-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ padding: '4px 8px' }}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button className="btn btn-sm btn-ghost" style={{ padding: '4px 8px' }}>✕</button>
        </div>
      </div>

      {!isMinimized && (
        <div className="bottom-content">
          {activeTab === 'console' && messages.map((msg, i) => (
            <div key={i} className={`console-line console-${msg.type}`}>
              <span className="console-timestamp">[{msg.timestamp}]</span>
              <span>{getIcon(msg.type)} {msg.message}</span>
            </div>
          ))}

          {activeTab === 'processing' && (
            <div>
              <div className="console-line console-info">
                <span className="console-timestamp">[10:24:15]</span>
                <span>✓ Processing completed: NDVI calculation</span>
              </div>
              <div className="console-line console-info">
                <span className="console-timestamp">[10:24:18]</span>
                <span>⚠ Processing time: 3.2 seconds (above threshold)</span>
              </div>
            </div>
          )}

          {activeTab === 'ai logs' && (
            <div>
              <div className="console-line console-success">
                <span className="console-timestamp">[10:27:42]</span>
                <span>✓ LULC Classification completed in 3m 17s</span>
              </div>
              <div className="console-line console-info">
                <span className="console-timestamp">[10:27:43]</span>
                <span>Overall Accuracy: 92.34%</span>
              </div>
              <div className="console-line console-info">
                <span className="console-timestamp">[10:27:42]</span>
                <span>Kappa Coefficient: 0.89</span>
              </div>
            </div>
          )}

          {activeTab === 'downloads' && (
            <div className="empty">
              <div className="empty-icon"></div>
              <div className="empty-text">No active downloads</div>
            </div>
          )}

          {activeTab === 'recent tasks' && (
            <div>
              <div className="console-line console-info">
                <span className="console-timestamp">[10:24:15]</span>
                <span>Project loaded successfully</span>
              </div>
              <div className="console-line console-info">
                <span className="console-timestamp">[10:24:16]</span>
                <span>Sentinel-2 L2A image loaded (2024-05-20)</span>
              </div>
              <div className="console-line console-success">
                <span className="console-timestamp">[10:24:18]</span>
                <span>NDVI layer generated successfully</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
