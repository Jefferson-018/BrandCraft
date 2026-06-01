import { Trash2, Copy, ChevronUp, ChevronDown, Download, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type, Square, Sparkles, Image } from 'lucide-react';
import './Inspector.css';

// Preset colors for sliders
const TEXT_COLORS = ['#ffffff', '#000000', '#a855f7', '#3b82f6', '#10b981', '#f43f5e', '#eab308'];

export default function Inspector({ 
  canvasData, 
  elements, 
  selectedId, 
  onSelectElement,
  onUpdateCanvas, 
  onUpdateElement, 
  onDeleteElement,
  onDuplicateElement,
  onClearCanvas,
  onExportPNG
}) {
  // Find currently active element
  const activeEl = elements.find((el) => el.id === selectedId);

  // Dimension presets handler
  const handleDimensionChange = (presetName) => {
    let width = 1080;
    let height = 1080;
    
    if (presetName === 'instagram-story') {
      width = 1080;
      height = 1920;
    } else if (presetName === 'youtube-thumb') {
      width = 1280;
      height = 720;
    } else if (presetName === 'linkedin-banner') {
      width = 1584;
      height = 396;
    }

    onUpdateCanvas({ name: presetName, width, height });
  };

  return (
    <aside className="inspector glass-panel">
      <div className="inspector-content">
        
        {/* If NO element is selected, show global canvas settings */}
        {!activeEl ? (
          <div className="inspector-section">
            <h3>Configuração Global</h3>
            <p className="section-desc">Ajuste o formato do canvas e configurações de fundo.</p>

            <div className="control-group">
              <label>Formato do Canvas</label>
              <select 
                value={canvasData.name} 
                onChange={(e) => handleDimensionChange(e.target.value)}
                className="inspector-select"
              >
                <option value="Instagram Post">Instagram Post (1:1)</option>
                <option value="instagram-story">Instagram Story (9:16)</option>
                <option value="youtube-thumb">YouTube Thumbnail (16:9)</option>
                <option value="linkedin-banner">LinkedIn Banner (4:1)</option>
              </select>
              <div className="resolution-indicator">
                {canvasData.width}px × {canvasData.height}px
              </div>
            </div>

            {/* Custom Background Colors */}
            <div className="control-group">
              <label>Fundo Customizado</label>
              <div className="color-picker-wrapper">
                <input 
                  type="color" 
                  value={canvasData.background.type === 'color' ? canvasData.background.value : '#09090c'} 
                  onChange={(e) => onUpdateCanvas({ 
                    background: { type: 'color', value: e.target.value } 
                  })}
                  className="color-input"
                />
                <span>Escolher cor personalizada</span>
              </div>
            </div>

            {/* Clear Button */}
            <button className="clear-all-btn" onClick={onClearCanvas}>
              <Trash2 size={16} /> Limpar Canvas
            </button>
          </div>
        ) : (
          /* If an element IS selected, show element details */
          <div className="inspector-section">
            <div className="section-header">
              <h3>Propriedades</h3>
              <div className="header-actions">
                <button 
                  className="icon-action-btn" 
                  onClick={() => onDuplicateElement(activeEl.id)}
                  title="Duplicar Elemento"
                >
                  <Copy size={16} />
                </button>
                <button 
                  className="icon-action-btn delete" 
                  onClick={() => onDeleteElement(activeEl.id)}
                  title="Deletar Elemento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* TEXT SPECIFIC CONTROLS */}
            {activeEl.type === 'text' && (
              <>
                <div className="control-group">
                  <label>Conteúdo do Texto</label>
                  <textarea 
                    value={activeEl.content}
                    onChange={(e) => onUpdateElement(activeEl.id, { content: e.target.value })}
                    className="inspector-textarea"
                    placeholder="Escreva seu texto aqui..."
                  />
                </div>

                <div className="control-group">
                  <label>Fonte</label>
                  <select 
                    value={activeEl.fontFamily || 'Inter'}
                    onChange={(e) => onUpdateElement(activeEl.id, { fontFamily: e.target.value })}
                    className="inspector-select"
                  >
                    <option value="Outfit">Outfit (Moderna)</option>
                    <option value="Inter">Inter (Limpa)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech)</option>
                  </select>
                </div>

                <div className="control-group">
                  <div className="label-row">
                    <label>Tamanho</label>
                    <span className="value-label">{activeEl.fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="8" 
                    max="120" 
                    value={activeEl.fontSize} 
                    onChange={(e) => onUpdateElement(activeEl.id, { fontSize: parseInt(e.target.value) })}
                    className="inspector-range"
                  />
                </div>

                <div className="control-group">
                  <label>Alinhamento e Estilo</label>
                  <div className="format-btn-row">
                    <button 
                      className={`format-btn ${activeEl.align === 'left' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { align: 'left' })}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button 
                      className={`format-btn ${activeEl.align === 'center' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { align: 'center' })}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button 
                      className={`format-btn ${activeEl.align === 'right' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { align: 'right' })}
                    >
                      <AlignRight size={16} />
                    </button>
                    <button 
                      className={`format-btn ${activeEl.fontWeight === 'bold' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { 
                        fontWeight: activeEl.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold size={16} />
                    </button>
                    <button 
                      className={`format-btn ${activeEl.fontStyle === 'italic' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { 
                        fontStyle: activeEl.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic size={16} />
                    </button>
                  </div>
                </div>

                <div className="control-group">
                  <label>Cor do Texto</label>
                  <div className="preset-colors-row">
                    {TEXT_COLORS.map((col) => (
                      <button 
                        key={col}
                        className={`color-dot ${activeEl.color === col ? 'active' : ''}`}
                        style={{ backgroundColor: col }}
                        onClick={() => onUpdateElement(activeEl.id, { color: col })}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={activeEl.color || '#ffffff'} 
                      onChange={(e) => onUpdateElement(activeEl.id, { color: e.target.value })}
                      className="custom-color-dot"
                    />
                  </div>
                </div>

                <div className="control-group">
                  <div className="label-row">
                    <label>Espaçamento de Letras</label>
                    <span className="value-label">{activeEl.letterSpacing || 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-2" 
                    max="15" 
                    value={activeEl.letterSpacing || 0} 
                    onChange={(e) => onUpdateElement(activeEl.id, { letterSpacing: parseInt(e.target.value) })}
                    className="inspector-range"
                  />
                </div>

                <div className="control-group">
                  <div className="label-row">
                    <label>Altura da Linha</label>
                    <span className="value-label">{activeEl.lineHeight || 1.2}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.8" 
                    max="2.5" 
                    step="0.1"
                    value={activeEl.lineHeight || 1.2} 
                    onChange={(e) => onUpdateElement(activeEl.id, { lineHeight: parseFloat(e.target.value) })}
                    className="inspector-range"
                  />
                </div>
              </>
            )}

            {/* SHAPE SPECIFIC CONTROLS */}
            {activeEl.type === 'shape' && (
              <>
                {/* Solid vs Gradient Fill Selector */}
                <div className="control-group">
                  <label>Estilo de Preenchimento</label>
                  <div className="fill-type-row">
                    <button 
                      className={`fill-type-btn ${activeEl.fillType !== 'gradient' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { fillType: 'solid' })}
                    >
                      Sólido
                    </button>
                    <button 
                      className={`fill-type-btn ${activeEl.fillType === 'gradient' ? 'active' : ''}`}
                      onClick={() => onUpdateElement(activeEl.id, { fillType: 'gradient' })}
                    >
                      Gradiente
                    </button>
                  </div>
                </div>

                {activeEl.fillType === 'gradient' ? (
                  <>
                    <div className="control-group">
                      <label>Cores do Gradiente</label>
                      <div className="gradient-pickers-row">
                        <div className="color-picker-wrapper">
                          <input 
                            type="color" 
                            value={activeEl.gradientColor1 || '#a855f7'} 
                            onChange={(e) => onUpdateElement(activeEl.id, { gradientColor1: e.target.value })}
                            className="color-input"
                          />
                          <span>Cor 1</span>
                        </div>
                        <div className="color-picker-wrapper">
                          <input 
                            type="color" 
                            value={activeEl.gradientColor2 || '#3b82f6'} 
                            onChange={(e) => onUpdateElement(activeEl.id, { gradientColor2: e.target.value })}
                            className="color-input"
                          />
                          <span>Cor 2</span>
                        </div>
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Direção do Gradiente</label>
                      <select 
                        value={activeEl.gradientDirection || 'diagonal'}
                        onChange={(e) => onUpdateElement(activeEl.id, { gradientDirection: e.target.value })}
                        className="inspector-select"
                      >
                        <option value="diagonal">Diagonal</option>
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="control-group">
                    <label>Cor de Preenchimento</label>
                    <div className="preset-colors-row">
                      {TEXT_COLORS.map((col) => (
                        <button 
                          key={col}
                          className={`color-dot ${activeEl.color === col ? 'active' : ''}`}
                          style={{ backgroundColor: col }}
                          onClick={() => onUpdateElement(activeEl.id, { color: col })}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={activeEl.color || '#a855f7'} 
                        onChange={(e) => onUpdateElement(activeEl.id, { color: e.target.value })}
                        className="custom-color-dot"
                      />
                    </div>
                  </div>
                )}

                {activeEl.content !== 'circle' && (
                  <div className="control-group">
                    <div className="label-row">
                      <label>Arredondar Cantos</label>
                      <span className="value-label">{activeEl.borderRadius || 0}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      value={activeEl.borderRadius || 0} 
                      onChange={(e) => onUpdateElement(activeEl.id, { borderRadius: parseInt(e.target.value) })}
                      className="inspector-range"
                    />
                  </div>
                )}

                <div className="control-group">
                  <div className="label-row">
                    <label>Espessura da Borda</label>
                    <span className="value-label">{activeEl.borderWidth || 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="15" 
                    value={activeEl.borderWidth || 0} 
                    onChange={(e) => onUpdateElement(activeEl.id, { borderWidth: parseInt(e.target.value) })}
                    className="inspector-range"
                  />
                </div>

                {activeEl.borderWidth > 0 && (
                  <div className="control-group">
                    <label>Cor da Borda</label>
                    <div className="color-picker-wrapper">
                      <input 
                        type="color" 
                        value={activeEl.borderColor || '#ffffff'} 
                        onChange={(e) => onUpdateElement(activeEl.id, { borderColor: e.target.value })}
                        className="color-input"
                      />
                      <span>Escolher cor da borda</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ICON SPECIFIC CONTROLS */}
            {activeEl.type === 'icon' && (
              <div className="control-group">
                <label>Cor do Ícone</label>
                <div className="preset-colors-row">
                  {TEXT_COLORS.map((col) => (
                    <button 
                      key={col}
                      className={`color-dot ${activeEl.color === col ? 'active' : ''}`}
                      style={{ backgroundColor: col }}
                      onClick={() => onUpdateElement(activeEl.id, { color: col })}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={activeEl.color || '#a855f7'} 
                    onChange={(e) => onUpdateElement(activeEl.id, { color: e.target.value })}
                    className="custom-color-dot"
                  />
                </div>
              </div>
            )}

            {/* SHARED STYLING (OPACITY & GLOWS) */}
            <div className="control-group separator">
              <div className="label-row">
                <label>Opacidade</label>
                <span className="value-label">{Math.round((activeEl.opacity ?? 1) * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={Math.round((activeEl.opacity ?? 1) * 100)} 
                onChange={(e) => onUpdateElement(activeEl.id, { opacity: parseFloat(e.target.value) / 100 })}
                className="inspector-range"
              />
            </div>

            {/* Rotation slider */}
            <div className="control-group">
              <div className="label-row">
                <label>Rotação (Ângulo)</label>
                <span className="value-label">{activeEl.rotate || 0}°</span>
              </div>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={activeEl.rotate || 0} 
                onChange={(e) => onUpdateElement(activeEl.id, { rotate: parseInt(e.target.value) })}
                className="inspector-range"
              />
            </div>

            <div className="control-group">
              <div className="label-row">
                <label>Intensidade do Brilho / Glow</label>
                <span className="value-label">{activeEl.shadowBlur || 0}px</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="40" 
                value={activeEl.shadowBlur || 0} 
                onChange={(e) => onUpdateElement(activeEl.id, { 
                  shadowBlur: parseInt(e.target.value),
                  shadowColor: activeEl.shadowColor || 'rgba(168, 85, 247, 0.4)',
                  shadowX: 0,
                  shadowY: 0
                })}
                className="inspector-range"
              />
            </div>

            {activeEl.shadowBlur > 0 && (
              <div className="control-group">
                <label>Cor do Brilho (Neon)</label>
                <div className="color-picker-wrapper">
                  <input 
                    type="color" 
                    value={activeEl.shadowColor || '#a855f7'} 
                    onChange={(e) => onUpdateElement(activeEl.id, { shadowColor: e.target.value })}
                    className="color-input"
                  />
                  <span>Mudar cor do glow</span>
                </div>
              </div>
            )}

            {/* LAYERING DEPTH */}
            <div className="control-group">
              <label>Posição da Camada (Layer)</label>
              <div className="layer-btn-row">
                <button 
                  className="layer-btn" 
                  onClick={() => onUpdateElement(activeEl.id, { zIndex: (activeEl.zIndex || 0) + 1 })}
                >
                  <ChevronUp size={16} /> Trazer para Frente
                </button>
                <button 
                  className="layer-btn" 
                  onClick={() => onUpdateElement(activeEl.id, { zIndex: Math.max(0, (activeEl.zIndex || 0) - 1) })}
                >
                  <ChevronDown size={16} /> Enviar para Trás
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Gerenciador de Camadas (Layers Manager) - Sempre visível na parte inferior */}
        <div className="inspector-section layers-manager-section separator">
          <div className="section-header">
            <h3>Gerenciador de Camadas</h3>
          </div>
          <p className="section-desc">Selecione, reordene ou apague elementos da tela:</p>

          {elements.length === 0 ? (
            <div className="no-layers-placeholder">Nenhuma camada ativa.</div>
          ) : (
            <div className="layers-list">
              {[...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)).map((el) => {
                const isSelected = el.id === selectedId;
                
                let displayName = 'Elemento';
                if (el.type === 'text') {
                  displayName = el.content ? (el.content.length > 18 ? el.content.substring(0, 16) + '...' : el.content) : 'Texto';
                } else if (el.type === 'shape') {
                  displayName = `Forma: ${el.content === 'rect' ? 'Retângulo' : (el.content === 'circle' ? 'Círculo' : 'Badge')}`;
                } else if (el.type === 'image') {
                  displayName = 'Imagem / Upload';
                } else if (el.type === 'icon') {
                  displayName = `Ícone: ${el.content}`;
                }

                const renderLayerIcon = (type) => {
                  if (type === 'text') return <Type size={13} style={{ color: 'var(--primary-hover)' }} />;
                  if (type === 'shape') return <Square size={13} style={{ color: 'var(--secondary)' }} />;
                  if (type === 'icon') return <Sparkles size={13} style={{ color: 'var(--accent)' }} />;
                  return <Image size={13} style={{ color: '#e4e4e7' }} />;
                };

                return (
                  <div 
                    key={el.id} 
                    className={`layer-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectElement(el.id)}
                  >
                    <div className="layer-info">
                      <span className="layer-symbol" style={{ display: 'flex', alignItems: 'center' }}>
                        {renderLayerIcon(el.type)}
                      </span>
                      <span className="layer-name">{displayName}</span>
                    </div>

                    <div className="layer-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="layer-action-btn"
                        onClick={() => onUpdateElement(el.id, { zIndex: (el.zIndex || 0) + 1 })}
                        title="Subir Camada"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button 
                        className="layer-action-btn"
                        onClick={() => onUpdateElement(el.id, { zIndex: Math.max(0, (el.zIndex || 0) - 1) })}
                        title="Descer Camada"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button 
                        className="layer-action-btn delete"
                        onClick={() => onDeleteElement(el.id)}
                        title="Deletar Camada"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Persistent Export Button at the bottom */}
      <div className="inspector-footer">
        <button className="export-btn glow-effect" onClick={onExportPNG}>
          <Download size={18} /> Baixar Arte (PNG)
        </button>
      </div>
    </aside>
  );
}
