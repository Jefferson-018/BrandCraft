import React, { useRef, useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import './Canvas.css';

export default function Canvas({ 
  canvasData, 
  elements, 
  selectedId, 
  onSelectElement, 
  onUpdateElement,
  onStartAction,
  onDeselectAll
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // 1. Calculate optimal scale to fit canvas inside workspace viewport
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      const containerW = containerRef.current.clientWidth - 80; // margins
      const containerH = containerRef.current.clientHeight - 80;
      const canvasW = canvasData.width;
      const canvasH = canvasData.height;

      const scaleX = containerW / canvasW;
      const scaleY = containerH / canvasH;
      const optimalScale = Math.min(scaleX, scaleY, 1); // cap at 1 to prevent blur

      setScale(optimalScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasData.width, canvasData.height]);

  // Handle clicking on empty canvas space to deselect
  const handleCanvasClick = (e) => {
    if (e.target.classList.contains('canvas-artboard') || e.target.classList.contains('canvas-viewport')) {
      onDeselectAll();
    }
  };

  // 2. Drag Element Logic (Mouse)
  const handleElementMouseDown = (e, el) => {
    e.stopPropagation();
    onSelectElement(el.id);
    setIsDragging(true);
    
    // Snapshot current state in history stack BEFORE dragging elements
    if (onStartAction) onStartAction();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialElX = el.x;
    const initialElY = el.y;

    const handleMouseMove = (moveEvent) => {
      if (!canvasRef.current) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Convert pixel delta to canvas percentage coordinates
      const canvasWidthPx = canvasRef.current.clientWidth;
      const canvasHeightPx = canvasRef.current.clientHeight;

      const dxPercent = (dx / canvasWidthPx) * 100;
      const dyPercent = (dy / canvasHeightPx) * 100;

      // Keep positioning inside a reasonable bounds
      const newX = Math.max(-50, Math.min(150, initialElX + dxPercent));
      const newY = Math.max(-50, Math.min(150, initialElY + dyPercent));

      onUpdateElement(el.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 2.1 Drag Element Logic (Touch for Mobile devices)
  const handleElementTouchStart = (e, el) => {
    e.stopPropagation();
    onSelectElement(el.id);
    setIsDragging(true);
    
    if (onStartAction) onStartAction();

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const initialElX = el.x;
    const initialElY = el.y;

    const handleTouchMove = (moveEvent) => {
      if (!canvasRef.current) return;
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - startX;
      const dy = moveTouch.clientY - startY;

      const canvasWidthPx = canvasRef.current.clientWidth;
      const canvasHeightPx = canvasRef.current.clientHeight;

      const dxPercent = (dx / canvasWidthPx) * 100;
      const dyPercent = (dy / canvasHeightPx) * 100;

      const newX = Math.max(-50, Math.min(150, initialElX + dxPercent));
      const newY = Math.max(-50, Math.min(150, initialElY + dyPercent));

      onUpdateElement(el.id, { x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // 3. Resize Element Logic (via corner handles - Mouse)
  const handleResizeMouseDown = (e, el, handle) => {
    e.stopPropagation();
    setIsResizing(true);

    // Snapshot state in history stack BEFORE resizing
    if (onStartAction) onStartAction();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = el.width;
    const initialH = el.height;
    const initialX = el.x;
    const initialY = el.y;
    const initialFontSize = el.fontSize || 24;

    const handleMouseMove = (moveEvent) => {
      if (!canvasRef.current) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const canvasWidthPx = canvasRef.current.clientWidth;
      const canvasHeightPx = canvasRef.current.clientHeight;

      // Convert pixel delta to canvas percentage
      const dxPercent = (dx / canvasWidthPx) * 100;
      const dyPercent = (dy / canvasHeightPx) * 100;

      let newW = initialW;
      let newH = initialH;
      let newX = initialX;
      let newY = initialY;
      let newFontSize = initialFontSize;

      // Resize math depending on which anchor is being dragged
      if (handle === 'bottom-right') {
        newW = Math.max(2, initialW + dxPercent);
        newH = Math.max(2, initialH + dyPercent);
        
        // Scale font size proportionally for text elements during resize
        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      } else if (handle === 'bottom-left') {
        newW = Math.max(2, initialW - dxPercent);
        newH = Math.max(2, initialH + dyPercent);
        newX = initialX + (initialW - newW);

        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      } else if (handle === 'top-right') {
        newW = Math.max(2, initialW + dxPercent);
        newH = Math.max(2, initialH - dyPercent);
        newY = initialY + (initialH - newH);

        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      } else if (handle === 'top-left') {
        newW = Math.max(2, initialW - dxPercent);
        newH = Math.max(2, initialH - dyPercent);
        newX = initialX + (initialW - newW);
        newY = initialY + (initialH - newH);

        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      }

      onUpdateElement(el.id, { 
        width: newW, 
        height: newH, 
        x: newX, 
        y: newY,
        fontSize: Math.round(newFontSize)
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 3.1 Resize Element Logic (via corner handles - Touch)
  const handleResizeTouchStart = (e, el, handle) => {
    e.stopPropagation();
    setIsResizing(true);

    if (onStartAction) onStartAction();

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const initialW = el.width;
    const initialH = el.height;
    const initialX = el.x;
    const initialY = el.y;
    const initialFontSize = el.fontSize || 24;

    const handleTouchMove = (moveEvent) => {
      if (!canvasRef.current) return;
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - startX;
      const dy = moveTouch.clientY - startY;

      const canvasWidthPx = canvasRef.current.clientWidth;
      const canvasHeightPx = canvasRef.current.clientHeight;

      const dxPercent = (dx / canvasWidthPx) * 100;
      const dyPercent = (dy / canvasHeightPx) * 100;

      let newW = initialW;
      let newH = initialH;
      let newX = initialX;
      let newY = initialY;
      let newFontSize = initialFontSize;

      if (handle === 'bottom-right') {
        newW = Math.max(2, initialW + dxPercent);
        newH = Math.max(2, initialH + dyPercent);
        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      } else if (handle === 'bottom-left') {
        newW = Math.max(2, initialW - dxPercent);
        newH = Math.max(2, initialH + dyPercent);
        newX = initialX + (initialW - newW);
        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      } else if (handle === 'top-right') {
        newW = Math.max(2, initialW + dxPercent);
        newH = Math.max(2, initialH - dyPercent);
        newY = initialY + (initialH - newH);
        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      } else if (handle === 'top-left') {
        newW = Math.max(2, initialW - dxPercent);
        newH = Math.max(2, initialH - dyPercent);
        newX = initialX + (initialW - newW);
        newY = initialY + (initialH - newH);
        if (el.type === 'text') {
          const ratio = newW / initialW;
          newFontSize = Math.max(8, Math.min(120, initialFontSize * ratio));
        }
      }

      onUpdateElement(el.id, { 
        width: newW, 
        height: newH, 
        x: newX, 
        y: newY,
        fontSize: Math.round(newFontSize)
      });
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Get background style
  const getBackgroundStyle = () => {
    const { background } = canvasData;
    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }
    if (background.type === 'gradient') {
      const { color1, color2, direction } = background.value;
      let dir = '135deg';
      if (direction === 'horizontal') dir = 'to right';
      if (direction === 'vertical') dir = 'to bottom';
      if (direction === 'radial') return { background: `radial-gradient(circle, ${color1}, ${color2})` };
      return { background: `linear-gradient(${dir}, ${color1}, ${color2})` };
    }
    if (background.type === 'image') {
      return { 
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return { backgroundColor: '#12121a' };
  };

  return (
    <div 
      className="canvas-viewport" 
      ref={containerRef} 
      onClick={handleCanvasClick}
    >
      <div 
        className="canvas-artboard glow-effect"
        ref={canvasRef}
        style={{
          width: `${canvasData.width}px`,
          height: `${canvasData.height}px`,
          transform: `scale(${scale})`,
          ...getBackgroundStyle()
        }}
      >
        {/* Render Canvas Elements */}
        {elements.map((el) => {
          const isSelected = el.id === selectedId;
          const elementStyle = {
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: `${el.height}%`,
            zIndex: el.zIndex,
            opacity: el.opacity ?? 1,
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `rotate(${el.rotate || 0}deg)`,
            transformOrigin: 'center center'
          };

          // Combine glows & filters if present
          if (el.shadowBlur && el.shadowBlur > 0) {
            elementStyle.filter = `drop-shadow(${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur}px ${el.shadowColor || 'rgba(0,0,0,0.5)'})`;
          }

          return (
            <div
              key={el.id}
              id={el.id}
              className={`canvas-element-wrapper ${isSelected ? 'selected' : ''}`}
              style={elementStyle}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              onTouchStart={(e) => handleElementTouchStart(e, el)}
            >
              {/* Element Visual Content */}
              {el.type === 'text' && (
                <div 
                  className="canvas-text-el"
                  style={{
                    fontFamily: el.fontFamily || 'Inter',
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.fontWeight || 400,
                    fontStyle: el.fontStyle || 'normal',
                    color: el.color || '#ffffff',
                    textAlign: el.align || 'left',
                    width: '100%',
                    height: '100%',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: el.lineHeight || 1.2,
                    letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal'
                  }}
                >
                  {el.content}
                </div>
              )}

              {el.type === 'shape' && (
                <div 
                  className={`canvas-shape-el ${el.content}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: el.fillType === 'gradient' 
                      ? `linear-gradient(${el.gradientDirection === 'horizontal' ? 'to right' : (el.gradientDirection === 'vertical' ? 'to bottom' : '135deg')}, ${el.gradientColor1 || '#a855f7'}, ${el.gradientColor2 || '#3b82f6'})` 
                      : 'none',
                    backgroundColor: el.fillType === 'gradient' ? 'transparent' : (el.color || '#a855f7'),
                    border: el.borderWidth > 0 ? `${el.borderWidth}px solid ${el.borderColor || '#ffffff'}` : 'none',
                    borderRadius: el.content === 'circle' ? '50%' : `${el.borderRadius || 0}px`
                  }}
                />
              )}

              {el.type === 'image' && (
                <img 
                  src={el.content} 
                  alt="uploaded element" 
                  className="canvas-image-el"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none' // allow click to bubble to wrapper
                  }}
                />
              )}

              {el.type === 'icon' && (() => {
                const IconComponent = Icons[el.content] || Icons.Sparkles;
                return (
                  <div className="canvas-icon-el" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: el.color || '#a855f7' }}>
                    <IconComponent size="100%" strokeWidth={2} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
                  </div>
                );
              })()}

              {/* Bounding Resize Anchors (renders only if selected) */}
              {isSelected && (
                <>
                  <div className="resize-outline" />
                  <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, el, 'top-left')} onTouchStart={(e) => handleResizeTouchStart(e, el, 'top-left')} />
                  <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, el, 'top-right')} onTouchStart={(e) => handleResizeTouchStart(e, el, 'top-right')} />
                  <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, el, 'bottom-left')} onTouchStart={(e) => handleResizeTouchStart(e, el, 'bottom-left')} />
                  <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, el, 'bottom-right')} onTouchStart={(e) => handleResizeTouchStart(e, el, 'bottom-right')} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
