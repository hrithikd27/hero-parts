import type { MilestoneWithStatus } from '../../utils/serviceSchedule'

interface Props {
  milestone: MilestoneWithStatus
}

const STATUS_STYLES: Record<
  string,
  { border: string; badge: string; badgeText: string; dim?: boolean }
> = {
  done: {
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-500',
    badgeText: 'Completed',
    dim: true,
  },
  overdue: {
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Due now',
  },
  soon: {
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-700',
    badgeText: 'Coming soon',
  },
  upcoming: {
    border: 'border-hero-border',
    badge: 'bg-gray-100 text-gray-600',
    badgeText: 'Upcoming',
  },
  next: {
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-700',
    badgeText: 'Next service',
  },
}

export default function ServiceMilestoneCard({ milestone }: Props) {
  const style = STATUS_STYLES[milestone.status]

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-card ${style.border} ${
        style.dim ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-gray-900 font-semibold text-sm">{milestone.label}</p>
          <p className="text-gray-500 text-xs">{milestone.km.toLocaleString('en-IN')} km</p>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
            {style.badgeText}
          </span>
          {milestone.status !== 'done' && (
            <p className="text-xs text-gray-400 mt-1">
              {milestone.kmLeft.toLocaleString('en-IN')} km left
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {milestone.tasks.map((t) => (
          <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
