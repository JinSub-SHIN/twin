import { useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import styles from './DayClock.module.css'

type HandKind = 'sleep' | 'wake'

type DayClockProps = {
  sleepHour: number | null
  wakeHour: number | null
  active: HandKind
  onActiveChange: (next: HandKind) => void
  onChange: (kind: HandKind, hour: number) => void
}

const SIZE = 260
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER = 112
const INNER = 58
const HANDLE_R = 10
const HIT_R = 28

/** 0시 = 12시 방향, 시계방향 */
function hourAngle(hour: number) {
  return ((hour % 24) / 24) * Math.PI * 2 - Math.PI / 2
}

function polar(r: number, hour: number) {
  const a = hourAngle(hour)
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
}

/** sleep → wake 수면 구간(시계방향) 도넛 아크 path */
function sleepArcPath(sleep: number, wake: number) {
  let span = (wake - sleep + 24) % 24
  if (span === 0) span = 24

  const start = hourAngle(sleep)
  const end = hourAngle(wake)
  const large = span > 12 ? 1 : 0

  const o1 = { x: CX + Math.cos(start) * OUTER, y: CY + Math.sin(start) * OUTER }
  const o2 = { x: CX + Math.cos(end) * OUTER, y: CY + Math.sin(end) * OUTER }
  const i1 = { x: CX + Math.cos(end) * INNER, y: CY + Math.sin(end) * INNER }
  const i2 = { x: CX + Math.cos(start) * INNER, y: CY + Math.sin(start) * INNER }

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ')
}

function formatHour(h: number | null) {
  if (h == null) return '--시'
  return `${h}시`
}

function clientToLocal(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
) {
  const rect = svg.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * SIZE - CX,
    y: ((clientY - rect.top) / rect.height) * SIZE - CY,
  }
}

function hourFromPoint(x: number, y: number) {
  let rad = Math.atan2(y, x) + Math.PI / 2
  if (rad < 0) rad += Math.PI * 2
  return Math.round((rad / (Math.PI * 2)) * 24) % 24
}

export function DayClock({
  sleepHour,
  wakeHour,
  active,
  onActiveChange,
  onChange,
}: DayClockProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragKindRef = useRef<HandKind | null>(null)
  const [dragging, setDragging] = useState<HandKind | null>(null)

  const ticks = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => {
        const outer = polar(OUTER - 2, hour)
        const inner = polar(hour % 6 === 0 ? OUTER - 14 : OUTER - 8, hour)
        const label = polar(OUTER - 28, hour)
        return { hour, outer, inner, label }
      }),
    [],
  )

  const sleepPos = sleepHour != null ? polar(OUTER - 6, sleepHour) : null
  const wakePos = wakeHour != null ? polar(OUTER - 6, wakeHour) : null
  const sleepLabel = polar(OUTER + 4, sleepHour ?? 0)
  const wakeLabel = polar(OUTER + 4, wakeHour ?? 0)
  const hasArc = sleepHour != null && wakeHour != null

  const pickNearestHand = (x: number, y: number): HandKind | null => {
    const candidates: { kind: HandKind; dist: number }[] = []
    if (sleepPos) {
      candidates.push({
        kind: 'sleep',
        dist: Math.hypot(x + CX - sleepPos.x, y + CY - sleepPos.y),
      })
    }
    if (wakePos) {
      candidates.push({
        kind: 'wake',
        dist: Math.hypot(x + CX - wakePos.x, y + CY - wakePos.y),
      })
    }
    if (!candidates.length) return null
    candidates.sort((a, b) => a.dist - b.dist)
    return candidates[0].dist <= HIT_R ? candidates[0].kind : null
  }

  const applyHour = (kind: HandKind, clientX: number, clientY: number) => {
    const el = svgRef.current
    if (!el) return
    const { x, y } = clientToLocal(el, clientX, clientY)
    onChange(kind, hourFromPoint(x, y))
  }

  const startDrag = (kind: HandKind, e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragKindRef.current = kind
    setDragging(kind)
    onActiveChange(kind)
    svgRef.current?.setPointerCapture(e.pointerId)
    applyHour(kind, e.clientX, e.clientY)
  }

  const onSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const el = svgRef.current
    if (!el) return
    const { x, y } = clientToLocal(el, e.clientX, e.clientY)
    const dist = Math.hypot(x, y)
    if (dist < INNER - 8 || dist > OUTER + 16) return

    const near = pickNearestHand(x, y)
    const kind = near ?? active
    dragKindRef.current = kind
    setDragging(kind)
    onActiveChange(kind)
    el.setPointerCapture(e.pointerId)
    onChange(kind, hourFromPoint(x, y))
  }

  const onSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragKindRef.current) return
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    applyHour(dragKindRef.current, e.clientX, e.clientY)
  }

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragKindRef.current = null
    setDragging(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.modeRow} role="tablist" aria-label="시간 선택 모드">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'sleep'}
          className={cn(styles.modeBtn, active === 'sleep' && styles.modeSleep)}
          onClick={() => onActiveChange('sleep')}
        >
          <span className={styles.modeDot} data-tone="sleep" />
          취침 {formatHour(sleepHour)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === 'wake'}
          className={cn(styles.modeBtn, active === 'wake' && styles.modeWake)}
          onClick={() => onActiveChange('wake')}
        >
          <span className={styles.modeDot} data-tone="wake" />
          기상 {formatHour(wakeHour)}
        </button>
      </div>

      <p className={styles.hint}>바늘을 드래그하거나, 시계를 눌러 시간을 골라요</p>

      <div className={styles.clockFrame}>
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="하루 일과 시계"
          onPointerDown={onSvgPointerDown}
          onPointerMove={onSvgPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <circle cx={CX} cy={CY} r={OUTER} className={styles.face} />
          <circle cx={CX} cy={CY} r={INNER} className={styles.innerFace} />

          {hasArc ? (
            <path
              d={sleepArcPath(sleepHour, wakeHour)}
              className={styles.sleepArc}
            />
          ) : null}

          {ticks.map(({ hour, outer, inner, label }) => (
            <g key={hour}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className={hour % 6 === 0 ? styles.tickMajor : styles.tick}
              />
              {hour % 3 === 0 ? (
                <text
                  x={label.x}
                  y={label.y}
                  className={styles.hourText}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {hour}
                </text>
              ) : null}
            </g>
          ))}

          {sleepPos ? (
            <g
              className={cn(
                styles.handGroup,
                dragging === 'sleep' && styles.handDragging,
              )}
              onPointerDown={(e) => startDrag('sleep', e)}
            >
              <line
                x1={CX}
                y1={CY}
                x2={sleepPos.x}
                y2={sleepPos.y}
                className={styles.handSleep}
              />
              {/* 넓은 터치 영역 */}
              <circle
                cx={sleepPos.x}
                cy={sleepPos.y}
                r={HIT_R}
                className={styles.hitArea}
              />
              <circle
                cx={sleepPos.x}
                cy={sleepPos.y}
                r={HANDLE_R}
                className={styles.handleSleep}
              />
              <text
                x={sleepLabel.x}
                y={sleepLabel.y}
                className={styles.badgeSleep}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                취침
              </text>
            </g>
          ) : null}

          {wakePos ? (
            <g
              className={cn(
                styles.handGroup,
                dragging === 'wake' && styles.handDragging,
              )}
              onPointerDown={(e) => startDrag('wake', e)}
            >
              <line
                x1={CX}
                y1={CY}
                x2={wakePos.x}
                y2={wakePos.y}
                className={styles.handWake}
              />
              <circle
                cx={wakePos.x}
                cy={wakePos.y}
                r={HIT_R}
                className={styles.hitArea}
              />
              <circle
                cx={wakePos.x}
                cy={wakePos.y}
                r={HANDLE_R}
                className={styles.handleWake}
              />
              <text
                x={wakeLabel.x}
                y={wakeLabel.y}
                className={styles.badgeWake}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                기상
              </text>
            </g>
          ) : null}

          <text
            x={CX}
            y={CY - 8}
            className={styles.centerTitle}
            textAnchor="middle"
          >
            나의 하루
          </text>
          <text
            x={CX}
            y={CY + 12}
            className={styles.centerSub}
            textAnchor="middle"
          >
            {hasArc
              ? `잠 ${((wakeHour - sleepHour + 24) % 24) || 24}시간`
              : '일과표'}
          </text>
        </svg>
      </div>
    </div>
  )
}
