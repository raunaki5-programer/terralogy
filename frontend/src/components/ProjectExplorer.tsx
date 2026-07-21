import { useState } from 'react'

interface Layer {
  id: string
  name: string
  type: 'basemap' | 'satellite' | 'vector' | 'analysis'
  visible: boolean
  locked: boolean
  opacity: number
  color?: string
}

interface Folder {
  name: string
  layers: Layer[]
}

interface ProjectExplorerProps {
  projectName: string
  folders: Folder[]
  selectedLayer: Layer | null
  onSelectLayer: (layer: Layer) => void
}

export default function ProjectExplorer({ projectName, folders, selectedLayer, onSelectLayer }: ProjectExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    Layers: true,
    'Satellite Images': true,
    'Vector Layers': true,
    AOI: true,
    'AI Results': true,
    Reports: false,
    Exports: false,
  })

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const toggleLayer = (layer: Layer) => {
    onSelectLayer({ ...layer, visible: !layer.visible })
  }

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'basemap': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
      case 'satellite': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      case 'vector': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      case 'analysis': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
    }
  }

  return (
    <div className="panel panel-left">
      <div className="panel-header">Project Explorer</div>
      <div className="panel-content">
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{projectName}</span>
            <button className="btn btn-sm btn-ghost">⋮</button>
          </div>
        </div>

        <div className="explorer-tree">
          {folders.map((folder) => (
            <div key={folder.name} style={{ marginBottom: 8 }}>
              <div className="tree-folder" onClick={() => toggleFolder(folder.name)}>
                <span style={{ transform: expandedFolders[folder.name] ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: 'var(--warning)' }}>
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                <span>{folder.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {folder.layers.length}
                </span>
              </div>
              {expandedFolders[folder.name] && (
                <div className="tree-children">
                  {folder.layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`layer-item ${selectedLayer?.id === layer.id ? 'active' : ''}`}
                      onClick={() => onSelectLayer(layer)}
                    >
                      <div className={`layer-checkbox ${layer.visible ? 'checked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLayer(layer); }}>
                        {layer.visible && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div className="layer-icon" style={{ color: layer.color || 'var(--text-secondary)' }}>
                        {getLayerIcon(layer.type)}
                      </div>
                      <span className="layer-name">{layer.name}</span>
                      <div className="layer-actions">
                        <button className="layer-action-btn" title="Lock">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}>
                            {layer.locked ? (
                              <>
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0110 0v4"/>
                              </>
                            ) : (
                              <>
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 019.9-1"/>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
