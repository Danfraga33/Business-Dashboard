
import { useEffect, useRef, useState, useCallback } from "react"

interface FunnelStage {
  name: string
  total: number
  hot: number
  warm: number
  cold: number
}

interface FunnelFlowProps {
  stages: FunnelStage[]
}

export function FunnelFlow({ stages }: FunnelFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const animRef = useRef(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Animate in
  useEffect(() => {
    progressRef.current = 0
    const startTime = performance.now()
    const duration = 1200

    const animate = (now: number) => {
      const elapsed = now - startTime
      progressRef.current = Math.min(1, elapsed / duration)
      // Ease out cubic
      progressRef.current = 1 - Math.pow(1 - progressRef.current, 3)
      drawCanvas()
      if (progressRef.current < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions])

  // Redraw on hover
  useEffect(() => {
    drawCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredStage])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const progress = progressRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    const width = dimensions.width
    const height = dimensions.height
    const padding = { top: 50, bottom: 65, left: 24, right: 24 }
    const drawWidth = width - padding.left - padding.right
    const drawHeight = height - padding.top - padding.bottom

    ctx.clearRect(0, 0, width, height)

    const maxTotal = stages[0].total
    const numStages = stages.length
    const gapBetween = drawWidth * 0.035
    const sectionWidth = (drawWidth - (numStages - 1) * gapBetween) / numStages

    // Color definitions
    const colors = {
      hot:  { r: 12, g: 35, b: 75 },
      warm: { r: 18, g: 90, b: 160 },
      cold: { r: 45, g: 190, b: 195 },
    }

    const barColors = {
      hot:  [{ r: 8, g: 28, b: 65 }, { r: 16, g: 45, b: 95 }],
      warm: [{ r: 14, g: 78, b: 148 }, { r: 22, g: 108, b: 178 }],
      cold: [{ r: 35, g: 170, b: 175 }, { r: 55, g: 210, b: 205 }],
    }

    const getStageX = (i: number) => padding.left + i * (sectionWidth + gapBetween)
    const getBarH = (total: number) => (total / maxTotal) * drawHeight * progress

    // Compute stage geometry
    const stageGeo = stages.map((s, i) => {
      const barH = getBarH(s.total)
      const centerY = padding.top + (drawHeight - barH) / 2
      const hotH = (s.hot / s.total) * barH
      const warmH = (s.warm / s.total) * barH
      const coldH = (s.cold / s.total) * barH
      const x = getStageX(i)
      return { x, centerY, barH, hotH, warmH, coldH }
    })

    // Draw flow bands between stages
    for (let i = 0; i < numStages - 1; i++) {
      const c = stageGeo[i]
      const n = stageGeo[i + 1]
      const x1 = c.x + sectionWidth
      const x2 = n.x
      const isHovered = hoveredStage === i || hoveredStage === i + 1
      const alpha = isHovered ? 0.92 : 0.78

      // Hot band
      drawFlowBand(ctx, x1, c.centerY, c.centerY + c.hotH, x2, n.centerY, n.centerY + n.hotH, colors.hot, colors.hot, alpha)
      // Warm band
      drawFlowBand(ctx, x1, c.centerY + c.hotH, c.centerY + c.hotH + c.warmH, x2, n.centerY + n.hotH, n.centerY + n.hotH + n.warmH, colors.warm, colors.warm, alpha)
      // Cold band
      drawFlowBand(ctx, x1, c.centerY + c.hotH + c.warmH, c.centerY + c.hotH + c.warmH + c.coldH, x2, n.centerY + n.hotH + n.warmH, n.centerY + n.hotH + n.warmH + n.coldH, colors.cold, colors.cold, alpha)
    }

    // Draw stage bars
    for (let i = 0; i < numStages; i++) {
      const g = stageGeo[i]
      const stage = stages[i]
      const isHovered = hoveredStage === i
      const alpha = isHovered ? 1 : 0.92

      // Hot section
      drawBarSection(ctx, g.x, g.centerY, sectionWidth, g.hotH, barColors.hot, alpha, true, false, i === 0, i === numStages - 1)
      // Warm section
      drawBarSection(ctx, g.x, g.centerY + g.hotH, sectionWidth, g.warmH, barColors.warm, alpha, false, false, false, false)
      // Cold section
      drawBarSection(ctx, g.x, g.centerY + g.hotH + g.warmH, sectionWidth, g.coldH, barColors.cold, alpha, false, true, i === 0, i === numStages - 1)

      // Percentage pill labels
      if (progress > 0.6) {
        const labelAlpha = Math.min(1, (progress - 0.6) / 0.4)
        const fontSize = Math.max(11, Math.min(13, sectionWidth * 0.065))
        ctx.font = `600 ${fontSize}px system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const hotPct = Math.round((stage.hot / stage.total) * 100)
        const warmPct = Math.round((stage.warm / stage.total) * 100)
        const coldPct = 100 - hotPct - warmPct

        const cx = g.x + sectionWidth / 2

        if (g.hotH > 24) {
          drawPillLabel(ctx, `${hotPct}%`, cx, g.centerY + g.hotH / 2, isHovered, labelAlpha)
        }
        if (g.warmH > 24) {
          drawPillLabel(ctx, `${warmPct}%`, cx, g.centerY + g.hotH + g.warmH / 2, isHovered, labelAlpha)
        }
        if (g.coldH > 24) {
          drawPillLabel(ctx, `${coldPct}%`, cx, g.centerY + g.hotH + g.warmH + g.coldH / 2, isHovered, labelAlpha)
        }
      }
    }

    // Stage labels at bottom
    if (progress > 0.4) {
      const labelAlpha = Math.min(1, (progress - 0.4) / 0.3)
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      for (let i = 0; i < numStages; i++) {
        const cx = stageGeo[i].x + sectionWidth / 2
        const y = padding.top + drawHeight + 14

        const isHovered = hoveredStage === i
        const nameAlpha = isHovered ? 0.95 * labelAlpha : 0.75 * labelAlpha
        const countAlpha = isHovered ? 0.7 * labelAlpha : 0.5 * labelAlpha

        ctx.fillStyle = `rgba(170, 200, 225, ${nameAlpha})`
        ctx.font = `700 ${Math.max(10, Math.min(12, sectionWidth * 0.06))}px system-ui, sans-serif`
        ctx.fillText(stages[i].name.toUpperCase(), cx, y)

        ctx.fillStyle = `rgba(130, 165, 200, ${countAlpha})`
        ctx.font = `400 ${Math.max(9, Math.min(11, sectionWidth * 0.055))}px system-ui, sans-serif`
        ctx.fillText(stages[i].total.toLocaleString(), cx, y + 17)
      }
    }
  }, [stages, dimensions, hoveredStage])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pad = { left: 24, right: 24 }
    const dw = dimensions.width - pad.left - pad.right
    const gap = dw * 0.035
    const sw = (dw - (stages.length - 1) * gap) / stages.length

    for (let i = 0; i < stages.length; i++) {
      const sx = pad.left + i * (sw + gap)
      if (x >= sx && x <= sx + sw + gap) {
        setHoveredStage(i)
        return
      }
    }
    setHoveredStage(null)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[350px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ width: dimensions.width || "100%", height: dimensions.height || "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredStage(null)}
        role="img"
        aria-label="Sales funnel flow visualization showing prospects converting through leads, MQL, SQL to converted customers"
      />
    </div>
  )
}

// ---- Drawing helpers ----

function drawFlowBand(
  ctx: CanvasRenderingContext2D,
  x1: number, y1Top: number, y1Bot: number,
  x2: number, y2Top: number, y2Bot: number,
  cFrom: { r: number; g: number; b: number },
  cTo: { r: number; g: number; b: number },
  alpha: number,
) {
  const cp = (x2 - x1) * 0.45
  const gradient = ctx.createLinearGradient(x1, 0, x2, 0)
  gradient.addColorStop(0, `rgba(${cFrom.r}, ${cFrom.g}, ${cFrom.b}, ${alpha})`)
  gradient.addColorStop(1, `rgba(${cTo.r}, ${cTo.g}, ${cTo.b}, ${alpha})`)

  ctx.beginPath()
  ctx.moveTo(x1, y1Top)
  ctx.bezierCurveTo(x1 + cp, y1Top, x2 - cp, y2Top, x2, y2Top)
  ctx.lineTo(x2, y2Bot)
  ctx.bezierCurveTo(x2 - cp, y2Bot, x1 + cp, y1Bot, x1, y1Bot)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()
}

function drawBarSection(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  gradColors: { r: number; g: number; b: number }[],
  alpha: number,
  isTop: boolean, isBottom: boolean,
  isFirst: boolean, isLast: boolean,
) {
  if (h < 0.5) return
  const r = 6
  const tl = isTop && isFirst ? r : isTop ? 3 : 0
  const tr = isTop && isLast ? r : isTop ? 3 : 0
  const bl = isBottom && isFirst ? r : isBottom ? 3 : 0
  const br = isBottom && isLast ? r : isBottom ? 3 : 0

  const gradient = ctx.createLinearGradient(x, y, x, y + h)
  gradient.addColorStop(0, `rgba(${gradColors[0].r}, ${gradColors[0].g}, ${gradColors[0].b}, ${alpha})`)
  gradient.addColorStop(1, `rgba(${gradColors[1].r}, ${gradColors[1].g}, ${gradColors[1].b}, ${alpha})`)
  ctx.fillStyle = gradient

  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  if (tr) ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
  else ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + h - br)
  if (br) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
  else ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + bl, y + h)
  if (bl) ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
  else ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + tl)
  if (tl) ctx.quadraticCurveTo(x, y, x + tl, y)
  else ctx.lineTo(x, y)
  ctx.closePath()
  ctx.fill()
}

function drawPillLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  isHovered: boolean,
  alpha: number,
) {
  const metrics = ctx.measureText(text)
  const pw = metrics.width + 18
  const ph = 22
  const rx = x - pw / 2
  const ry = y - ph / 2

  ctx.fillStyle = isHovered
    ? `rgba(25, 80, 150, ${0.85 * alpha})`
    : `rgba(18, 55, 115, ${0.65 * alpha})`

  ctx.beginPath()
  ctx.moveTo(rx + 11, ry)
  ctx.lineTo(rx + pw - 11, ry)
  ctx.quadraticCurveTo(rx + pw, ry, rx + pw, ry + ph / 2)
  ctx.quadraticCurveTo(rx + pw, ry + ph, rx + pw - 11, ry + ph)
  ctx.lineTo(rx + 11, ry + ph)
  ctx.quadraticCurveTo(rx, ry + ph, rx, ry + ph / 2)
  ctx.quadraticCurveTo(rx, ry, rx + 11, ry)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * alpha})`
  ctx.fillText(text, x, y)
}
