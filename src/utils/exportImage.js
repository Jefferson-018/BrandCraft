/**
 * Utility to export the dynamic canvas content to a high-resolution PNG image
 * by rendering elements onto an HTML5 canvas based on active design dimensions.
 */
export const exportCanvasToImage = async (canvasData, elements) => {
  return new Promise((resolve, reject) => {
    try {
      // 1. Get real output dimensions (e.g. 1080x1080 for Instagram Post)
      const { width: realWidth, height: realHeight, background } = canvasData;
      
      // 2. Create high-resolution offline canvas
      const canvas = document.createElement('canvas');
      canvas.width = realWidth;
      canvas.height = realHeight;
      const ctx = canvas.getContext('2d');
      
      // Apply smoothing for high-quality graphics
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 3. Draw Background
      if (background.type === 'color') {
        ctx.fillStyle = background.value;
        ctx.fillRect(0, 0, realWidth, realHeight);
        drawRest();
      } else if (background.type === 'gradient') {
        const { color1, color2, direction } = background.value;
        let grad;
        if (direction === 'horizontal') {
          grad = ctx.createLinearGradient(0, 0, realWidth, 0);
        } else if (direction === 'diagonal') {
          grad = ctx.createLinearGradient(0, 0, realWidth, realHeight);
        } else if (direction === 'radial') {
          grad = ctx.createRadialGradient(realWidth/2, realHeight/2, 10, realWidth/2, realHeight/2, Math.max(realWidth, realHeight)/1.5);
        } else {
          grad = ctx.createLinearGradient(0, 0, 0, realHeight); // vertical default
        }
        
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, realWidth, realHeight);
        drawRest();
      } else if (background.type === 'image') {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.onload = () => {
          // Draw image to cover canvas (center crop)
          const imgRatio = bgImg.width / bgImg.height;
          const canvasRatio = realWidth / realHeight;
          let drawWidth, drawHeight, x, y;

          if (imgRatio > canvasRatio) {
            drawHeight = realHeight;
            drawWidth = realHeight * imgRatio;
            x = (realWidth - drawWidth) / 2;
            y = 0;
          } else {
            drawWidth = realWidth;
            drawHeight = realWidth / imgRatio;
            x = 0;
            y = (realHeight - drawHeight) / 2;
          }

          ctx.drawImage(bgImg, x, y, drawWidth, drawHeight);
          drawRest();
        };
        bgImg.onerror = () => {
          // Fallback to solid color on load error
          ctx.fillStyle = '#12121a';
          ctx.fillRect(0, 0, realWidth, realHeight);
          drawRest();
        };
        bgImg.src = background.value;
      }

      // 4. Draw Canvas Elements
      function drawRest() {
        // Sort elements by zIndex to draw in correct layer order
        const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
        
        // Count images/icons that need loading
        let imagePromises = [];

        sortedElements.forEach((el) => {
          // Translate screen percentage coordinates to real canvas pixel coordinates
          const elX = (el.x / 100) * realWidth;
          const elY = (el.y / 100) * realHeight;
          const elW = (el.width / 100) * realWidth;
          const elH = (el.height / 100) * realHeight;

          // Save context state for rotation, opacity, and clip masking
          ctx.save();
          ctx.globalAlpha = el.opacity ?? 1;

          // Apply glowing/shadow effects if configured
          if (el.shadowBlur && el.shadowBlur > 0) {
            ctx.shadowColor = el.shadowColor || 'rgba(0, 0, 0, 0.5)';
            // Scale shadow blur relative to export resolution
            ctx.shadowBlur = (el.shadowBlur / 100) * realWidth;
            ctx.shadowOffsetX = (el.shadowX / 100) * realWidth || 0;
            ctx.shadowOffsetY = (el.shadowY / 100) * realWidth || 0;
          }

          // Translate coordinate system origin to the element's center
          ctx.translate(elX + elW / 2, elY + elH / 2);
          // Apply rotation
          ctx.rotate(((el.rotate || 0) * Math.PI) / 180);

          if (el.type === 'text') {
            // Setup Font size scaling
            const scaledFontSize = (el.fontSize / 500) * realWidth; // normalized ratio
            ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 'normal'} ${scaledFontSize}px ${el.fontFamily || 'Inter'}`;
            ctx.fillStyle = el.color || '#ffffff';
            ctx.textBaseline = 'top';

            // Text alignment setup - relative to center
            ctx.textAlign = el.align || 'left';
            let startX = -elW / 2;
            if (el.align === 'center') startX = 0;
            if (el.align === 'right') startX = elW / 2;

            // Multi-line word wrapping algorithm
            const words = el.content.split(' ');
            let line = '';
            let currentY = -elH / 2;
            const lineHeight = scaledFontSize * (el.lineHeight || 1.2);

            for (let n = 0; n < words.length; n++) {
              let testLine = line + words[n] + ' ';
              let metrics = ctx.measureText(testLine);
              let testWidth = metrics.width;
              
              if (testWidth > elW && n > 0) {
                ctx.fillText(line, startX, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, startX, currentY);

          } else if (el.type === 'shape') {
            // Support Solid or Gradient fill for shape
            if (el.fillType === 'gradient') {
              let grad;
              const gDir = el.gradientDirection || 'diagonal';
              if (gDir === 'horizontal') {
                grad = ctx.createLinearGradient(-elW / 2, 0, elW / 2, 0);
              } else if (gDir === 'vertical') {
                grad = ctx.createLinearGradient(0, -elH / 2, 0, elH / 2);
              } else {
                grad = ctx.createLinearGradient(-elW / 2, -elH / 2, elW / 2, elH / 2);
              }
              grad.addColorStop(0, el.gradientColor1 || '#a855f7');
              grad.addColorStop(1, el.gradientColor2 || '#3b82f6');
              ctx.fillStyle = grad;
            } else {
              ctx.fillStyle = el.color || '#a855f7';
            }

            ctx.strokeStyle = el.borderColor || 'transparent';
            ctx.lineWidth = (el.borderWidth || 0) / 100 * realWidth;

            const radius = (el.borderRadius || 0) / 100 * Math.min(realWidth, realHeight);

            ctx.beginPath();
            if (el.content === 'circle') {
              ctx.arc(0, 0, Math.min(elW, elH) / 2, 0, 2 * Math.PI);
            } else {
              // Rounded rectangle path drawing relative to origin
              ctx.roundRect ? ctx.roundRect(-elW / 2, -elH / 2, elW, elH, radius) : ctx.rect(-elW / 2, -elH / 2, elW, elH);
            }
            
            ctx.fill();
            if (el.borderWidth > 0) ctx.stroke();

          } else if (el.type === 'image') {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            const promise = new Promise((imgResolve) => {
              img.onload = () => {
                ctx.drawImage(img, -elW / 2, -elH / 2, elW, elH);
                imgResolve();
              };
              img.onerror = () => {
                // Draw a fallback colored placeholder card
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(-elW / 2, -elH / 2, elW, elH);
                ctx.fillStyle = '#ff4444';
                ctx.font = '14px sans-serif';
                ctx.fillText('Erro ao carregar imagem', -elW / 2 + 10, -elH / 2 + 20);
                imgResolve();
              };
              img.src = el.content;
            });
            imagePromises.push(promise);

          } else if (el.type === 'icon') {
            const promise = new Promise((iconResolve) => {
              const svgDom = document.getElementById(el.id)?.querySelector('svg');
              if (svgDom) {
                // Clone SVG and set explicit styling attributes
                const svgClone = svgDom.cloneNode(true);
                svgClone.setAttribute('width', elW);
                svgClone.setAttribute('height', elH);
                svgClone.setAttribute('color', el.color || '#a855f7');
                svgClone.style.color = el.color || '#a855f7';

                const svgString = new XMLSerializer().serializeToString(svgClone);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const URL = window.URL || window.webkitURL || window;
                const blobURL = URL.createObjectURL(svgBlob);
                
                const iconImg = new Image();
                iconImg.onload = () => {
                  ctx.drawImage(iconImg, -elW / 2, -elH / 2, elW, elH);
                  URL.revokeObjectURL(blobURL);
                  iconResolve();
                };
                iconImg.onerror = () => {
                  ctx.fillStyle = el.color || '#a855f7';
                  ctx.fillRect(-elW / 2, -elH / 2, elW, elH);
                  URL.revokeObjectURL(blobURL);
                  iconResolve();
                };
                iconImg.src = blobURL;
              } else {
                ctx.fillStyle = el.color || '#a855f7';
                ctx.fillRect(-elW / 2, -elH / 2, elW, elH);
                iconResolve();
              }
            });
            imagePromises.push(promise);
          }

          ctx.restore();
        });

        // Trigger download once all image layers are fully drawn
        Promise.all(imagePromises).then(() => {
          try {
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            
            // Create download anchor trigger
            const downloadLink = document.createElement('a');
            const fileName = `brandcraft-${canvasData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
            downloadLink.download = fileName;
            downloadLink.href = dataUrl;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
