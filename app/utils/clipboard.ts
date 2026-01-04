/**
 * Clipboard utility functions
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    throw new Error('Clipboard API unavailable')
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback:', err)
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text

      // Ensure it's not visible but part of the DOM
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      textArea.style.top = '0'
      document.body.appendChild(textArea)

      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      return successful
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
      return false
    }
  }
}

export async function pasteFromClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch (err) {
    console.error('Failed to read from clipboard:', err)
    return null
  }
}
