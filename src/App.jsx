import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import { exportCanvasToImage } from './utils/exportImage';
import { Undo, Redo, Paintbrush, Sliders, Shapes } from 'lucide-react';
import './App.css';

// Default initial state (SaaS Promotion preset)
const DEFAULT_CANVAS = {
  name: 'Instagram Post',
  width: 1080,
  height: 1080,
  background: {
    type: 'gradient',
    value: { color1: '#6366f1', color2: '#a855f7', direction: 'diagonal' }
  }
};

const DEFAULT_ELEMENTS = [
  {
    id: 'el-badge-bg',
    type: 'shape',
    content: 'badge',
    x: 35,
    y: 15,
    width: 30,
    height: 7,
    color: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 1,
    opacity: 1
  },
  {
    id: 'el-badge-lbl',
    type: 'text',
    content: 'NOVIDADE SAAS',
    x: 35,
    y: 17,
    width: 30,
    height: 5,
    fontSize: 14,
    fontFamily: 'Space Grotesk',
    fontWeight: 'bold',
    color: '#ffffff',
    align: 'center',
    zIndex: 2,
    opacity: 0.95
  },
  {
    id: 'el-title',
    type: 'text',
    content: 'Crie Imagens de Alto Nível no BrandCraft',
    x: 10,
    y: 28,
    width: 80,
    height: 25,
    fontSize: 52,
    fontFamily: 'Outfit',
    fontWeight: 'bold',
    align: 'center',
    zIndex: 3,
    opacity: 1
  },
  {
    id: 'el-sub',
    type: 'text',
    content: 'Um editor visual ultra-rápido para redes sociais e anúncios, rodando 100% no seu navegador com zero custo de APIs.',
    x: 15,
    y: 58,
    width: 70,
    height: 15,
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    color: '#e4e4e7',
    align: 'center',
    lineHeight: 1.4,
    zIndex: 4,
    opacity: 0.85
  },
  {
    id: 'el-btn-bg',
    type: 'shape',
    content: 'rect',
    x: 33,
    y: 78,
    width: 34,
    height: 8,
    color: '#ffffff',
    borderRadius: 8,
    zIndex: 5,
    opacity: 1,
    shadowBlur: 15,
    shadowColor: 'rgba(255, 255, 255, 0.15)'
  },
  {
    id: 'el-btn-lbl',
    type: 'text',
    content: 'Testar Agora Grátis',
    x: 33,
    y: 79.8,
    width: 34,
    height: 5,
    fontSize: 15,
    fontFamily: 'Space Grotesk',
    fontWeight: 'bold',
    color: '#09090c',
    align: 'center',
    zIndex: 6,
    opacity: 1
  }
];

export default function App() {
  const [canvasData, setCanvasData] = useState(DEFAULT_CANVAS);
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);
  const [selectedId, setSelectedId] = useState(null);

  // Undo / Redo / Clipboard Premium States
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [clipboard, setClipboard] = useState(null);

  // Responsive Mobile Panels States
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileInspector, setShowMobileInspector] = useState(false);

  // Helper to snapshot current state before mutation
  const saveToHistory = (customCanvas = canvasData, customElements = elements) => {
    setPast(prev => [...prev, { canvasData: JSON.parse(JSON.stringify(customCanvas)), elements: JSON.parse(JSON.stringify(customElements)) }].slice(-50));
    setFuture([]);
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [{ canvasData: JSON.parse(JSON.stringify(canvasData)), elements: JSON.parse(JSON.stringify(elements)) }, ...prev]);
    setCanvasData(previous.canvasData);
    setElements(previous.elements);
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, { canvasData: JSON.parse(JSON.stringify(canvasData)), elements: JSON.parse(JSON.stringify(elements)) }]);
    setCanvasData(next.canvasData);
    setElements(next.elements);
    setSelectedId(null);
  };

  // Keyboard shortcut listeners (Ctrl+Z, Ctrl+Y, Delete, Esc, Ctrl+C, Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTagName = document.activeElement.tagName;
      if (activeTagName === 'INPUT' || activeTagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
        return;
      }

      // Delete key or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        saveToHistory();
        setElements(prev => prev.filter(el => el.id !== selectedId));
        setSelectedId(null);
      }

      // Escape key to deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }

      // Redo (Ctrl+Y)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Copy (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedId) {
        e.preventDefault();
        const el = elements.find(item => item.id === selectedId);
        if (el) {
          setClipboard(el);
        }
      }

      // Paste (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        saveToHistory();
        const duplicated = {
          ...JSON.parse(JSON.stringify(clipboard)),
          id: `${clipboard.type}-${Date.now()}`,
          x: Math.min(85, clipboard.x + 4),
          y: Math.min(85, clipboard.y + 4),
          zIndex: elements.length + 1
        };
        setElements(prev => [...prev, duplicated]);
        setSelectedId(duplicated.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, clipboard, past, future, canvasData]);

  // 1. Add Text Elements
  const handleAddText = (preset) => {
    saveToHistory();
    let content = 'Clique duas vezes para editar';
    let fontSize = 24;
    let fontWeight = 'normal';
    let fontFamily = 'Inter';

    if (preset === 'heading-large') {
      content = 'Título Chamativo';
      fontSize = 46;
      fontWeight = 'bold';
      fontFamily = 'Outfit';
    } else if (preset === 'heading-medium') {
      content = 'Subtítulo do Banner';
      fontSize = 28;
      fontWeight = '600';
      fontFamily = 'Inter';
    } else if (preset === 'body-text') {
      content = 'Este é um parágrafo descritivo de exemplo adicionado ao estúdio.';
      fontSize = 15;
      fontWeight = 'normal';
      fontFamily = 'Inter';
    }

    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content,
      x: 25,
      y: 40,
      width: 50,
      height: 15,
      fontSize,
      fontFamily,
      fontWeight,
      align: 'center',
      color: '#ffffff',
      zIndex: elements.length + 1,
      opacity: 1,
      rotate: 0
    };

    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  // 2. Add Shape Elements
  const handleAddShape = (shapeType) => {
    saveToHistory();
    const newElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: shapeType,
      x: 35,
      y: 35,
      width: 30,
      height: 30,
      color: '#a855f7',
      borderRadius: shapeType === 'badge' ? 20 : (shapeType === 'circle' ? 0 : 8),
      borderWidth: 0,
      borderColor: '#ffffff',
      zIndex: elements.length + 1,
      opacity: 1,
      rotate: 0,
      fillType: 'solid', // solid vs gradient
      gradientColor1: '#a855f7',
      gradientColor2: '#3b82f6',
      gradientDirection: 'diagonal'
    };

    // Override size for pill badge shape
    if (shapeType === 'badge') {
      newElement.height = 8;
      newElement.width = 25;
    }

    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  // 3. Add Custom Image upload Element
  const handleAddImage = (src) => {
    saveToHistory();
    const newElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: src,
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      zIndex: elements.length + 1,
      opacity: 1,
      rotate: 0
    };

    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  // Add Lucide SVG Icon Element
  const handleAddIcon = (iconName) => {
    saveToHistory();
    const newElement = {
      id: `icon-${Date.now()}`,
      type: 'icon',
      content: iconName,
      x: 45,
      y: 45,
      width: 10,
      height: 10,
      color: '#a855f7',
      zIndex: elements.length + 1,
      opacity: 1,
      rotate: 0
    };

    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  // 4. Update specific properties of elements (drag handles can trigger saveHistory onMouseDown)
  const handleUpdateElement = (id, updatedProperties) => {
    setElements(prev =>
      prev.map((el) => (el.id === id ? { ...el, ...updatedProperties } : el))
    );
  };

  // Helper trigger to save history before starting drag/resize actions (passed to Canvas)
  const handleStartCanvasAction = () => {
    saveToHistory();
  };

  // 5. Delete selected element
  const handleDeleteElement = (id) => {
    saveToHistory();
    setElements(elements.filter((el) => el.id !== id));
    setSelectedId(null);
  };

  // 6. Duplicate Element
  const handleDuplicateElement = (id) => {
    saveToHistory();
    const elToDuplicate = elements.find((el) => el.id === id);
    if (!elToDuplicate) return;

    const duplicated = {
      ...JSON.parse(JSON.stringify(elToDuplicate)),
      id: `${elToDuplicate.type}-${Date.now()}`,
      x: Math.min(90, elToDuplicate.x + 4), // offset slightly
      y: Math.min(90, elToDuplicate.y + 4),
      zIndex: elements.length + 1
    };

    setElements([...elements, duplicated]);
    setSelectedId(duplicated.id);
  };

  // 7. Clear Workspace canvas
  const handleClearCanvas = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os elementos do canvas?')) {
      saveToHistory();
      setElements([]);
      setSelectedId(null);
    }
  };

  // 8. Dimension changes, canvas color configs
  const handleUpdateCanvas = (updatedProps) => {
    saveToHistory(
      { ...canvasData, ...updatedProps },
      elements
    );
    setCanvasData(prev => ({ ...prev, ...updatedProps }));
  };

  // 9. Load pre-designed templates
  const handleSelectTemplate = (templateName) => {
    saveToHistory();
    if (templateName === 'saas-promo') {
      setCanvasData({
        name: 'Instagram Post',
        width: 1080,
        height: 1080,
        background: {
          type: 'gradient',
          value: { color1: '#6366f1', color2: '#a855f7', direction: 'diagonal' }
        }
      });
      setElements(DEFAULT_ELEMENTS.map(el => ({ ...el, rotate: 0 })));
    } else if (templateName === 'quote') {
      setCanvasData({
        name: 'Instagram Post',
        width: 1080,
        height: 1080,
        background: {
          type: 'gradient',
          value: { color1: '#ff5e62', color2: '#ff9966', direction: 'radial' }
        }
      });
      setElements([
        {
          id: 'quote-mark',
          type: 'text',
          content: '“',
          x: 10,
          y: 8,
          width: 80,
          height: 15,
          fontSize: 120,
          fontFamily: 'Outfit',
          fontWeight: 'bold',
          color: 'rgba(255, 255, 255, 0.2)',
          align: 'center',
          zIndex: 1,
          opacity: 1,
          rotate: 0
        },
        {
          id: 'quote-body',
          type: 'text',
          content: 'O único modo de fazer um excelente trabalho é amar o que você faz.',
          x: 15,
          y: 28,
          width: 70,
          height: 38,
          fontSize: 36,
          fontFamily: 'Outfit',
          fontWeight: 'bold',
          color: '#ffffff',
          align: 'center',
          zIndex: 2,
          opacity: 1,
          lineHeight: 1.3,
          rotate: 0
        },
        {
          id: 'quote-author',
          type: 'text',
          content: '- Steve Jobs',
          x: 20,
          y: 72,
          width: 60,
          height: 8,
          fontSize: 16,
          fontFamily: 'Space Grotesk',
          fontWeight: '600',
          color: '#ffffff',
          align: 'center',
          zIndex: 3,
          opacity: 0.9,
          rotate: 0
        }
      ]);
    } else if (templateName === 'youtube') {
      setCanvasData({
        name: 'youtube-thumb',
        width: 1280,
        height: 720,
        background: {
          type: 'color',
          value: '#0f172a'
        }
      });
      setElements([
        {
          id: 'yt-card1',
          type: 'shape',
          content: 'rect',
          x: 5,
          y: 15,
          width: 55,
          height: 24,
          color: '#a855f7',
          borderRadius: 8,
          zIndex: 1,
          opacity: 1,
          rotate: -2 // tilted shape for premium YouTube dynamic style!
        },
        {
          id: 'yt-head1',
          type: 'text',
          content: 'CRIANDO UM SAAS',
          x: 8,
          y: 18,
          width: 50,
          height: 20,
          fontSize: 48,
          fontFamily: 'Outfit',
          fontWeight: 'bold',
          color: '#ffffff',
          zIndex: 2,
          opacity: 1,
          rotate: -2 // tilted text matching background
        },
        {
          id: 'yt-card2',
          type: 'shape',
          content: 'rect',
          x: 5,
          y: 44,
          width: 44,
          height: 18,
          color: '#3b82f6',
          borderRadius: 8,
          zIndex: 3,
          opacity: 1,
          rotate: 1
        },
        {
          id: 'yt-head2',
          type: 'text',
          content: 'DO ZERO EM 2026',
          x: 8,
          y: 46,
          width: 38,
          height: 15,
          fontSize: 32,
          fontFamily: 'Space Grotesk',
          fontWeight: 'bold',
          color: '#ffffff',
          zIndex: 4,
          opacity: 1,
          rotate: 1
        },
        {
          id: 'yt-glow',
          type: 'text',
          content: '100% GRÁTIS E PRÁTICO',
          x: 5,
          y: 75,
          width: 60,
          height: 12,
          fontSize: 22,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#10b981',
          shadowBlur: 15,
          shadowColor: '#10b981',
          zIndex: 5,
          opacity: 1,
          rotate: 0
        }
      ]);
    } else if (templateName === 'linkedin') {
      setCanvasData({
        name: 'linkedin-banner',
        width: 1584,
        height: 396,
        background: {
          type: 'gradient',
          value: { color1: '#09090c', color2: '#1e1b4b', direction: 'horizontal' }
        }
      });
      setElements([
        {
          id: 'li-card',
          type: 'shape',
          content: 'badge',
          x: 6,
          y: 20,
          width: 16,
          height: 20,
          color: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1,
          opacity: 1,
          rotate: 0
        },
        {
          id: 'li-card-lbl',
          type: 'text',
          content: 'FULLSTACK DEVELOPER',
          x: 6,
          y: 25,
          width: 16,
          height: 10,
          fontSize: 10,
          fontFamily: 'Space Grotesk',
          fontWeight: 'bold',
          color: '#3b82f6',
          align: 'center',
          zIndex: 2,
          opacity: 1,
          rotate: 0
        },
        {
          id: 'li-title',
          type: 'text',
          content: 'Alexandre Santana',
          x: 6,
          y: 48,
          width: 45,
          height: 25,
          fontSize: 32,
          fontFamily: 'Outfit',
          fontWeight: 'bold',
          color: '#ffffff',
          zIndex: 3,
          opacity: 1,
          rotate: 0
        },
        {
          id: 'li-bio',
          type: 'text',
          content: 'Desenvolvendo soluções web modernas com React, Node e Inteligência Artificial.',
          x: 6,
          y: 77,
          width: 45,
          height: 15,
          fontSize: 12,
          fontFamily: 'Inter',
          color: '#a1a1aa',
          zIndex: 4,
          opacity: 1,
          rotate: 0
        }
      ]);
    }
    setSelectedId(null);
  };

  // 10. Export Offline image
  const handleExportPNG = async () => {
    try {
      await exportCanvasToImage(canvasData, elements);
    } catch (err) {
      alert('Houve um erro ao renderizar o download: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Studio Header Brand */}
      <header className="app-header glass-panel">
        <div className="logo-section">
          <div className="logo-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <Paintbrush size={22} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }} />
          </div>
          <h1>BrandCraft</h1>
          <span>Beta SaaS</span>
        </div>

        {/* Undo/Redo Premium Controls */}
        <div className="history-controls">
          <button 
            className="history-btn" 
            onClick={handleUndo} 
            disabled={past.length === 0} 
            title="Desfazer (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button 
            className="history-btn" 
            onClick={handleRedo} 
            disabled={future.length === 0} 
            title="Refazer (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="header-meta">
          <div className="plan-badge">Plano Unlimited</div>
          <div className="user-avatar" title="Victor Jerry">VJ</div>
        </div>
      </header>

      {/* Main Designer Grid Workspace with conditional panel open class for split mobile layout */}
      <main className={`studio-layout ${showMobileSidebar || showMobileInspector ? 'panel-open' : ''}`}>
        <div className={`sidebar-wrapper ${showMobileSidebar ? 'active' : ''}`}>
          <button className="mobile-close-btn" onClick={() => setShowMobileSidebar(false)}>✕ Fechar</button>
          <Sidebar 
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onAddImage={handleAddImage}
            onAddIcon={handleAddIcon}
            onUpdateBackground={handleUpdateCanvas}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
        
        <Canvas 
          canvasData={canvasData}
          elements={elements}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onUpdateElement={handleUpdateElement}
          onStartAction={handleStartCanvasAction}
          onDeselectAll={() => setSelectedId(null)}
        />
        
        <div className={`inspector-wrapper ${showMobileInspector ? 'active' : ''}`}>
          <button className="mobile-close-btn" onClick={() => setShowMobileInspector(false)}>✕ Fechar</button>
          <Inspector 
            canvasData={canvasData}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onUpdateCanvas={handleUpdateCanvas}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onClearCanvas={handleClearCanvas}
            onExportPNG={handleExportPNG}
          />
        </div>
      </main>

      {/* Mobile Floating Action Bar with Upgraded premium Vector Icons */}
      <div className="mobile-toolbar">
        <button 
          className={`mobile-tool-btn ${showMobileSidebar ? 'active' : ''}`}
          onClick={() => {
            setShowMobileSidebar(!showMobileSidebar);
            setShowMobileInspector(false);
          }}
        >
          <Shapes size={16} /> Elementos
        </button>
        <button 
          className={`mobile-tool-btn ${showMobileInspector ? 'active' : ''}`}
          onClick={() => {
            setShowMobileInspector(!showMobileInspector);
            setShowMobileSidebar(false);
          }}
        >
          <Sliders size={16} /> Ajustes & Camadas
        </button>
      </div>
    </div>
  );
}
