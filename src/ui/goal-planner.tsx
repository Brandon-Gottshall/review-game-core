import type { FormEvent, ReactNode } from 'react'

import { cx } from './utils.js'

export type GoalPlannerUnitOption = {
  id: string
  label: string
  checked: boolean
  savedScore?: string | number
  detail?: string
}

type ReadinessFloorInputProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ReadinessFloorInput({ value, onChange, className }: ReadinessFloorInputProps) {
  return (
    <label className={cx('rg-field', className)}>
      <span className="rg-kicker">Readiness floor</span>
      <input
        className="rg-input"
        type="number"
        min="1"
        max="100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Readiness floor"
      />
    </label>
  )
}

type DeadlinePickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function DeadlinePicker({ value, onChange, className }: DeadlinePickerProps) {
  return (
    <label className={cx('rg-field', className)}>
      <span className="rg-kicker">Deadline</span>
      <input
        className="rg-input"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Goal deadline"
      />
    </label>
  )
}

type UnitCheckboxListProps = {
  units: readonly GoalPlannerUnitOption[]
  onToggle: (unitId: string) => void
  onSavedScoreChange?: (unitId: string, value: string) => void
  className?: string
}

export function UnitCheckboxList({
  units,
  onToggle,
  onSavedScoreChange,
  className,
}: UnitCheckboxListProps) {
  return (
    <div className={cx('rg-unit-checkbox-list', className)}>
      {units.map((unit) => (
        <div key={unit.id} className="rg-unit-checkbox-list__item">
          <label className="rg-unit-checkbox-list__label">
            <input
              type="checkbox"
              checked={unit.checked}
              onChange={() => onToggle(unit.id)}
            />
            <span>{unit.label}</span>
          </label>
          {typeof onSavedScoreChange === 'function' ? (
            <input
              className="rg-input rg-unit-checkbox-list__score"
              type="number"
              min="0"
              max="100"
              value={unit.savedScore ?? ''}
              onChange={(event) => onSavedScoreChange(unit.id, event.target.value)}
              placeholder="saved score"
              aria-label={`${unit.label} saved score`}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}

type GoalPlannerCardProps = {
  readinessTarget: string
  deadline: string
  units: readonly GoalPlannerUnitOption[]
  activeSummary?: string | null
  message?: string | null
  liveRecommendation?: ReactNode
  className?: string
  onReadinessTargetChange: (value: string) => void
  onDeadlineChange: (value: string) => void
  onToggleUnit: (unitId: string) => void
  onSavedScoreChange?: (unitId: string, value: string) => void
  onSave: () => void
  onClear: () => void
}

export function GoalPlannerCard({
  readinessTarget,
  deadline,
  units,
  activeSummary,
  message,
  liveRecommendation,
  className,
  onReadinessTargetChange,
  onDeadlineChange,
  onToggleUnit,
  onSavedScoreChange,
  onSave,
  onClear,
}: GoalPlannerCardProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave()
  }

  return (
    <section className={cx('rg-card rg-goal-planner', className)} aria-label="Goal planner">
      <p className="rg-kicker">Goal planner</p>
      <h3>Save a reusable goal, then keep editing it.</h3>
      <p className="rg-note">
        This plan keeps recalculating as readiness changes, and you can rewrite the candidates, floor, or deadline any time.
      </p>

      {message ? <p className="rg-note" role="status">{message}</p> : null}
      {activeSummary ? <p className="rg-note"><strong>Active plan:</strong> {activeSummary}</p> : null}

      <form onSubmit={handleSubmit}>
        <div className="rg-goal-planner__fields">
          <ReadinessFloorInput value={readinessTarget} onChange={onReadinessTargetChange} />
          <DeadlinePicker value={deadline} onChange={onDeadlineChange} />
        </div>

        <UnitCheckboxList
          units={units}
          onToggle={onToggleUnit}
          onSavedScoreChange={onSavedScoreChange}
        />

        <div className="rg-button-row">
          <button type="submit" className="rg-button rg-button--primary">
            Save goal plan
          </button>
          <button type="button" className="rg-button rg-button--secondary" onClick={onClear}>
            Clear goal plan
          </button>
        </div>
      </form>

      {liveRecommendation ? (
        <div className="rg-goal-planner__live">
          <p className="rg-kicker">Live recommendation</p>
          {liveRecommendation}
        </div>
      ) : null}
    </section>
  )
}
