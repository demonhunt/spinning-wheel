import { WheelOption } from '../../shared/types/wheel';

// 1.2 = 120% zoom for the center logo image inside the hub clip.
const CENTER_LOGO_ZOOM = 1.2;
const WHEEL_BLUE = '#0b74de';
const WHEEL_WHITE = '#ffffff';

function drawCenterHub(
  ctx: CanvasRenderingContext2D,
  centerLogo: HTMLImageElement | null,
  center: number,
  centerHubRadius: number
): void {
  // Clip to a circle so the center logo always stays inside the hub.
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, centerHubRadius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  if (centerLogo) {
    const hubDiameter = centerHubRadius * 2;
    // Cover-fit the image, then apply extra zoom.
    const scale = Math.max(
      hubDiameter / centerLogo.naturalWidth,
      hubDiameter / centerLogo.naturalHeight
    ) * CENTER_LOGO_ZOOM;
    const drawWidth = centerLogo.naturalWidth * scale;
    const drawHeight = centerLogo.naturalHeight * scale;
    const drawX = center - drawWidth / 2;
    const drawY = center - drawHeight / 2;

    ctx.drawImage(centerLogo, drawX, drawY, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(
      center - centerHubRadius,
      center - centerHubRadius,
      centerHubRadius * 2,
      centerHubRadius * 2
    );
  }

  ctx.restore();
  ctx.beginPath();
  ctx.arc(center, center, centerHubRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(center, center, centerHubRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string
): string[] {
  ctx.font = font;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (ctx.measureText(word).width > maxWidth) {
      let chunk = '';
      for (const ch of word) {
        const testChunk = chunk + ch;
        if (ctx.measureText(testChunk).width > maxWidth && chunk) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = '';
          }
          lines.push(chunk);
          chunk = ch;
        } else {
          chunk = testChunk;
        }
      }
      if (chunk) {
        if (currentLine) {
          const testLine = `${currentLine} ${chunk}`;
          if (ctx.measureText(testLine).width <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = chunk;
          }
        } else {
          currentLine = chunk;
        }
      }
    } else {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function autoFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  startSize: number,
  minSize: number,
  maxLines: number
): { size: number; lines: string[] } {
  for (let size = startSize; size >= minSize; size--) {
    const font = `bold ${size}px Arial`;
    const lines = wrapText(ctx, text, maxWidth, font);
    const lineHeight = size * 1.25;
    const fits =
      lines.length <= maxLines &&
      lines.length * lineHeight <= maxHeight &&
      lines.every((line) => ctx.measureText(line).width <= maxWidth);

    if (fits) return { size, lines };
  }

  const font = `bold ${minSize}px Arial`;
  const lines = wrapText(ctx, text, maxWidth, font);
  const limited = lines.slice(0, maxLines);

  if (lines.length > maxLines && limited.length > 0) {
    let last = limited[limited.length - 1];
    while (last.length > 0 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    limited[limited.length - 1] = last ? `${last}...` : '...';
  }

  return { size: minSize, lines: limited };
}

export function drawWheel(
  ctx: CanvasRenderingContext2D,
  options: WheelOption[],
  currentRotation: number,
  centerLogo: HTMLImageElement | null = null
): void {
  // Derive all geometry from the current canvas size for responsive rendering.
  const wheelSize = Math.min(ctx.canvas.width, ctx.canvas.height);
  const center = wheelSize / 2;
  const radius = center - 10;
  // Hub radius scales with wheel size and is clamped between 52 and 156 px.
  const centerHubRadius = Math.max(52, Math.min(156, Math.round(wheelSize * 1.00)));

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const totalRatio = options.reduce((sum, opt) => sum + opt.ratio, 0);
  let startAngle = currentRotation;

  // Draw each option as a slice whose angle is proportional to its ratio.
  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    const sliceAngle = (option.ratio / totalRatio) * 2 * Math.PI;
    const isBlueSlice = index % 2 === 1;
    const sliceBackgroundColor = isBlueSlice ? WHEEL_BLUE : WHEEL_WHITE;
    const sliceTextColor = isBlueSlice ? WHEEL_WHITE : WHEEL_BLUE;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = sliceBackgroundColor;
    ctx.fill();
    ctx.strokeStyle = sliceTextColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.fillStyle = sliceTextColor;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Keep text inside a readable radial band between hub and outer edge.
    const innerPadding = centerHubRadius + 14;
    const outerPadding = 14;
    const radialSpace = Math.max(20, radius - innerPadding - outerPadding);
    const textX = innerPadding + radialSpace / 2;
    const maxWidthByArc = Math.max(24, sliceAngle * textX - 10);
    const maxWidth = Math.max(24, Math.min(radialSpace, maxWidthByArc));
    const maxTextHeight = Math.max(14, radialSpace * 0.85);
    const maxLines = 3;
    // Scale label font bounds with wheel size, then auto-fit within slice constraints.
    const baseFontSize = Math.max(12, Math.min(30, Math.round(wheelSize * 0.025)));
    const minFontSize = Math.max(8, Math.round(baseFontSize * 0.55));

    const { size: fontSize, lines } = autoFontSize(
      ctx,
      option.label,
      maxWidth,
      maxTextHeight,
      baseFontSize,
      minFontSize,
      maxLines
    );
    ctx.font = `bold ${fontSize}px Arial`;
    const lineHeight = fontSize * 1.25;
    const totalHeight = lines.length * lineHeight;
    const startY = -totalHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], textX, startY + i * lineHeight);
    }

    ctx.restore();
    startAngle += sliceAngle;
  }

  // Draw the center hub (logo + ring) after slices so it sits on top.
  drawCenterHub(ctx, centerLogo, center, centerHubRadius);
}
