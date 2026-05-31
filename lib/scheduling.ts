import { timeToMinutes, addMinutesToTime } from './utils'
import type { Booking, BlockedSlot, WorkingDay } from './types'

const BASE_SLOTS = ['16:00', '17:00', '18:00', '19:00']
const END_OF_DAY = '20:00'

export function getAvailableSlots(
  durationMinutes: number,
  bookings: Booking[],
  blockedSlots: BlockedSlot[],
  workingDay: WorkingDay | undefined,
): string[] {
  if (!workingDay || !workingDay.is_active) return []

  const wholeDayBlocked = blockedSlots.some(
    (b) => b.start_time === null && b.end_time === null,
  )
  if (wholeDayBlocked) return []

  const endOfDay = timeToMinutes(END_OF_DAY)

  const candidates = BASE_SLOTS.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + durationMinutes
    return slotEnd <= endOfDay
  })

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')

  return candidates.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + durationMinutes

    const hasBookingConflict = confirmedBookings.some((b) => {
      const bookStart = timeToMinutes(b.start_time)
      const bookEnd = timeToMinutes(b.end_time)
      return slotStart < bookEnd && slotEnd > bookStart
    })
    if (hasBookingConflict) return false

    const hasBlockConflict = blockedSlots.some((b) => {
      if (!b.start_time || !b.end_time) return false
      const blockStart = timeToMinutes(b.start_time)
      const blockEnd = timeToMinutes(b.end_time)
      return slotStart < blockEnd && slotEnd > blockStart
    })
    if (hasBlockConflict) return false

    return true
  })
}

export function computeEndTime(startTime: string, durationMinutes: number): string {
  return addMinutesToTime(startTime, durationMinutes)
}
