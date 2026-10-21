const ENTERED_KEY = 'pet-trainer-entered'

export function hasEnteredApp(): boolean {
  try {
    return sessionStorage.getItem(ENTERED_KEY) === '1'
  } catch {
    return false
  }
}

export function markAppEntered(): void {
  try {
    sessionStorage.setItem(ENTERED_KEY, '1')
  } catch {
    // ignore
  }
}
