export interface ServiceMilestone {
  km: number
  label: string
  tasks: string[]
}

export const SERVICE_MILESTONES: ServiceMilestone[] = [
  {
    km: 1000,
    label: 'First Service',
    tasks: ['Engine oil change', 'Chain lubrication', 'Tyre pressure check', 'Brake adjustment'],
  },
  {
    km: 6000,
    label: '6,000 km Service',
    tasks: [
      'Engine oil change',
      'Oil filter',
      'Air filter clean',
      'Spark plug check',
      'Brake pads check',
    ],
  },
  {
    km: 12000,
    label: '12,000 km Service',
    tasks: [
      'Engine oil change',
      'Oil filter replace',
      'Air filter replace',
      'Spark plug replace',
      'Chain kit inspect',
      'Fork oil check',
    ],
  },
  {
    km: 24000,
    label: '24,000 km Service',
    tasks: [
      'Engine oil change',
      'Oil filter',
      'Air filter',
      'Spark plug',
      'Chain kit replace',
      'Brake shoe inspect',
      'Coolant check',
    ],
  },
  {
    km: 36000,
    label: '36,000 km Service',
    tasks: [
      'Engine oil change',
      'Oil filter',
      'Air filter',
      'Spark plug',
      'Brake shoe replace',
      'Chain kit replace',
      'Full inspection',
    ],
  },
]

export type MilestoneStatus = 'done' | 'next' | 'upcoming' | 'soon' | 'overdue'

export interface MilestoneWithStatus extends ServiceMilestone {
  status: MilestoneStatus
  kmLeft: number
}

export function getMilestonesForOdometer(odometerKm: number): MilestoneWithStatus[] {
  return SERVICE_MILESTONES.map((m) => {
    const kmLeft = m.km - odometerKm
    let status: MilestoneStatus

    if (kmLeft <= 0) {
      status = 'done'
    } else if (kmLeft <= 500) {
      status = 'overdue'
    } else if (kmLeft <= 2000) {
      status = 'soon'
    } else {
      status = 'upcoming'
    }

    return { ...m, status, kmLeft }
  })
}
