import { useState } from 'react'
import ServiceMilestoneCard from '../components/service/ServiceMilestoneCard'
import { getMilestonesForOdometer } from '../utils/serviceSchedule'

export default function ServiceTab() {
  const [odometer, setOdometer] = useState('')
  const km = parseInt(odometer, 10) || 0
  const milestones = km > 0 ? getMilestonesForOdometer(km) : []
  const nextService = milestones.find((m) => m.status !== 'done')

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-gray-900 font-semibold mb-1">Service Schedule</h2>
        <p className="text-xs text-gray-500">
          Enter current odometer reading to see upcoming service milestones.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-hero-border rounded-xl px-4 py-2.5 focus-within:border-hero-red transition-colors shadow-sm">
          <span className="text-gray-400 text-sm">km</span>
          <input
            type="number"
            min={0}
            max={200000}
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="e.g. 12500"
            className="bg-transparent text-gray-900 text-sm outline-none w-32"
          />
        </div>
        {odometer && (
          <button
            onClick={() => setOdometer('')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {nextService && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
          <span className="text-blue-600">Next service: </span>
          <span className="text-gray-900 font-semibold">{nextService.label}</span>
          <span className="text-gray-500"> in {nextService.kmLeft.toLocaleString('en-IN')} km</span>
        </div>
      )}

      {milestones.length > 0 ? (
        <div className="flex flex-col gap-3">
          {milestones.map((m) => (
            <ServiceMilestoneCard key={m.km} milestone={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          Enter odometer reading above to view service milestones.
        </div>
      )}

      {km > 0 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Intervals follow Hero MotoCorp official service schedule.
        </p>
      )}
    </div>
  )
}
