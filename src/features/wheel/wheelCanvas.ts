import { WheelOption } from '../../shared/types/wheel';

export const WHEEL_SIZE = 400;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 10;

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
  currentRotation: number
): void {
  ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

  const totalRatio = options.reduce((sum, opt) => sum + opt.ratio, 0);
  let startAngle = currentRotation;

  for (const option of options) {
    const sliceAngle = (option.ratio / totalRatio) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = option.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const innerPadding = 52;
    const outerPadding = 14;
    const radialSpace = Math.max(20, RADIUS - innerPadding - outerPadding);
    const textX = innerPadding + radialSpace / 2;
    const maxWidthByArc = Math.max(24, sliceAngle * textX - 10);
    const maxWidth = Math.max(24, Math.min(radialSpace, maxWidthByArc));
    const maxTextHeight = Math.max(14, radialSpace * 0.85);
    const maxLines = 3;

    const { size: fontSize, lines } = autoFontSize(
      ctx,
      option.label,
      maxWidth,
      maxTextHeight,
      14,
      8,
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

  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 20, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
}
