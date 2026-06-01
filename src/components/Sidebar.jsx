import React, { useState } from 'react';
import { 
  LayoutTemplate, Type, Square, Palette, UploadCloud, Plus, Sparkles,
  Rocket, Zap, Shield, Terminal, Cpu, Target, Code, Globe, Activity, 
  Star, Heart, CheckCircle, AlertCircle, MessageSquare, Award, Flame, 
  Lightbulb, Compass, Share2, Crown, Anchor
} from 'lucide-react';
import './Sidebar.css';

// Preset stock background images
const PRESET_BG_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=60',
];

// Preset Gradients
const PRESET_GRADIENTS = [
  { name: 'Sunset Glow', color1: '#ff5e62', color2: '#ff9966', direction: 'vertical' },
  { name: 'Royal Neon', color1: '#a855f7', color2: '#3b82f6', direction: 'diagonal' },
  { name: 'Aurora Dark', color1: '#10b981', color2: '#0b3c5d', direction: 'vertical' },
  { name: 'Cyberpunk', color1: '#f43f5e', color2: '#eab308', direction: 'horizontal' },
];

const PRESET_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Rocket', icon: Rocket },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Terminal', icon: Terminal },
  { name: 'Cpu', icon: Cpu },
  { name: 'Target', icon: Target },
  { name: 'Code', icon: Code },
  { name: 'Globe', icon: Globe },
  { name: 'Activity', icon: Activity },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'AlertCircle', icon: AlertCircle },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Award', icon: Award },
  { name: 'Flame', icon: Flame },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Compass', icon: Compass },
  { name: 'Share2', icon: Share2 },
  { name: 'Crown', icon: Crown },
  { name: 'Anchor', icon: Anchor }
];

export default function Sidebar({ onAddText, onAddShape, onAddImage, onAddIcon, onUpdateBackground, onSelectTemplate }) {
  const [activeTab, setActiveTab] = useState('templates');

  // Handle local image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      onAddImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="sidebar glass-panel">
      {/* Icon Tab Bar */}
      <div className="tab-bar">
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
          title="Templates"
        >
          <LayoutTemplate size={20} />
          <span>Presets</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
          title="Texto"
        >
          <Type size={20} />
          <span>Texto</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'shapes' ? 'active' : ''}`}
          onClick={() => setActiveTab('shapes')}
          title="Formas"
        >
          <Square size={20} />
          <span>Formas</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'icons' ? 'active' : ''}`}
          onClick={() => setActiveTab('icons')}
          title="Ícones"
        >
          <Sparkles size={20} />
          <span>Ícones</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'background' ? 'active' : ''}`}
          onClick={() => setActiveTab('background')}
          title="Fundo"
        >
          <Palette size={20} />
          <span>Fundos</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
          title="Uploads"
        >
          <UploadCloud size={20} />
          <span>Uploads</span>
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div className="tab-content">
        
        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="panel-section">
            <h3>Templates Premium</h3>
            <p className="panel-desc">Escolha um preset profissional de partida:</p>
            <div className="templates-grid">
              <div className="template-card saas-promo" onClick={() => onSelectTemplate('saas-promo')}>
                <div className="template-thumb grad-purple">
                  <span>SaaS Card</span>
                </div>
                <span>Promoção SaaS</span>
              </div>
              
              <div className="template-card quote" onClick={() => onSelectTemplate('quote')}>
                <div className="template-thumb grad-coral">
                  <span>Citação</span>
                </div>
                <span>Frase do Dia</span>
              </div>

              <div className="template-card youtube" onClick={() => onSelectTemplate('youtube')}>
                <div className="template-thumb grad-dark">
                  <span>Thumb</span>
                </div>
                <span>YouTube Thumb</span>
              </div>

              <div className="template-card banner-linkedin" onClick={() => onSelectTemplate('linkedin')}>
                <div className="template-thumb grad-blue">
                  <span>Header</span>
                </div>
                <span>LinkedIn Banner</span>
              </div>
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="panel-section">
            <h3>Inserir Texto</h3>
            <p className="panel-desc">Clique para adicionar títulos ou parágrafos ao canvas:</p>
            
            <button className="add-text-btn heading-large" onClick={() => onAddText('heading-large')}>
              <Plus size={16} /> Adicionar Título Principal
            </button>
            <button className="add-text-btn heading-medium" onClick={() => onAddText('heading-medium')}>
              <Plus size={16} /> Adicionar Subtítulo
            </button>
            <button className="add-text-btn body-text" onClick={() => onAddText('body-text')}>
              <Plus size={16} /> Adicionar Parágrafo
            </button>

            <div className="typography-presets">
              <h4>Dica de Fontes</h4>
              <div className="font-tip">
                <span className="font-fam" style={{ fontFamily: 'Outfit' }}>Outfit:</span> 
                <span>Foco em cabeçalhos chamativos de alta tecnologia.</span>
              </div>
              <div className="font-tip">
                <span className="font-fam" style={{ fontFamily: 'Inter' }}>Inter:</span> 
                <span>Legibilidade perfeita para corpo e descrições.</span>
              </div>
              <div className="font-tip">
                <span className="font-fam" style={{ fontFamily: 'Space Grotesk' }}>Space Grotesk:</span> 
                <span>Estilo moderno, tech e futurista.</span>
              </div>
            </div>
          </div>
        )}

        {/* SHAPES TAB */}
        {activeTab === 'shapes' && (
          <div className="panel-section">
            <h3>Formas e Adornos</h3>
            <p className="panel-desc">Insira caixas e fundos para destacar textos:</p>
            
            <div className="shapes-grid">
              <button className="shape-add-card" onClick={() => onAddShape('rect')}>
                <div className="shape-preview rect"></div>
                <span>Retângulo</span>
              </button>
              <button className="shape-add-card" onClick={() => onAddShape('circle')}>
                <div className="shape-preview circle"></div>
                <span>Círculo</span>
              </button>
              <button className="shape-add-card" onClick={() => onAddShape('badge')}>
                <div className="shape-preview badge-p"></div>
                <span>Pílula/Badge</span>
              </button>
            </div>
          </div>
        )}

        {/* ICONS TAB */}
        {activeTab === 'icons' && (
          <div className="panel-section">
            <h3>Biblioteca de Ícones</h3>
            <p className="panel-desc">Selecione um ícone SaaS premium para inserir na tela:</p>
            <div className="icons-grid">
              {PRESET_ICONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button 
                    key={item.name} 
                    className="icon-select-card"
                    onClick={() => onAddIcon(item.name)}
                    title={item.name}
                  >
                    <IconComponent size={24} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BACKGROUNDS TAB */}
        {activeTab === 'background' && (
          <div className="panel-section">
            <h3>Fundo do Design</h3>
            <p className="panel-desc">Personalize o pano de fundo do seu banner:</p>

            <div className="bg-sub-section">
              <h4>Cores Sólidas</h4>
              <div className="solid-colors-row">
                {['#09090c', '#181824', '#ffffff', '#1e293b', '#dc2626', '#3b82f6'].map((color) => (
                  <button 
                    key={color}
                    className="solid-color-dot"
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdateBackground({ background: { type: 'color', value: color } })}
                  />
                ))}
              </div>
            </div>

            <div className="bg-sub-section">
              <h4>Gradients Premium</h4>
              <div className="gradients-list">
                {PRESET_GRADIENTS.map((grad, idx) => (
                  <button 
                    key={idx}
                    className="gradient-bar"
                    style={{ background: `linear-gradient(135deg, ${grad.color1}, ${grad.color2})` }}
                    onClick={() => onUpdateBackground({ background: { type: 'gradient', value: grad } })}
                  >
                    <span>{grad.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-sub-section">
              <h4>Imagens Abstratas (Stock)</h4>
              <div className="bg-images-grid">
                {PRESET_BG_IMAGES.map((imgUrl, idx) => (
                  <button 
                    key={idx}
                    className="bg-img-card"
                    style={{ backgroundImage: `url(${imgUrl})` }}
                    onClick={() => onUpdateBackground({ background: { type: 'image', value: imgUrl } })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="panel-section">
            <h3>Seus Uploads</h3>
            <p className="panel-desc">Adicione capturas de tela, logotipos ou avatares locais:</p>
            
            <label className="upload-dropzone">
              <UploadCloud size={32} />
              <span>Escolher Imagem</span>
              <span className="upload-sub">PNG, JPG, SVG de até 5MB</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        )}

      </div>
    </aside>
  );
}
