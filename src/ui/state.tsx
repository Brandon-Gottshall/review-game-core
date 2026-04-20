import { PHASE_STATE_LABELS, PHASE_STATE_ORDER, type PhaseState } from '../scheduler/phase-state.js'
import { cx } from './utils.js'

type StateDotProps = {
  state: PhaseState
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function StateDot({ state, size = 'md', className, label }: StateDotProps) {
  return (
    <span
      className={cx('rg-state-dot', `rg-state-dot--${state}`, `rg-state-dot--${size}`, className)}
      aria-label={label ?? PHASE_STATE_LABELS[state]}
      title={label ?? PHASE_STATE_LABELS[state]}
    />
  )
}

type StateLegendProps = {
  className?: string
}

export function StateLegend({ className }: StateLegendProps) {
  return (
    <div className={cx('rg-card rg-state-legend', className)} aria-label="What the phase dots mean">
      <span className="rg-kicker">Phase legend</span>
      <div className="rg-state-legend__items">
        {PHASE_STATE_ORDER.map((state) => (
          <span key={state} className="rg-state-legend__item">
            <StateDot state={state} />
            <span>{PHASE_STATE_LABELS[state]}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
