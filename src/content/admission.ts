/** Owner policy: weekly house nights are free; ticketed bookings are separate events. */
export function isFreeHouseNight(slug: string | null | undefined): boolean {
  return slug === 'oasis-fridays' || slug === 'oasis-latin-saturdays';
}
