// Clipboard Utilities Example
import { GetClipboardText, SetClipboardText, CopyToClipboard, PasteFromClipboard } from '../wailsjs/go/main/App'

export async function copyText(text: string) {
  try {
    await SetClipboardText(text)
    console.log('Copied to clipboard:', text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

export async function pasteText(): Promise<string> {
  try {
    const text = await GetClipboardText()
    console.log('Pasted from clipboard:', text)
    return text
  } catch (error) {
    console.error('Failed to paste:', error)
    return ''
  }
}

export async function copyWithFeedback(text: string) {
  const success = await CopyToClipboard(text)
  if (success) {
    console.log('✓ Copied!')
  } else {
    console.error('✗ Copy failed')
  }
  return success
}

// Example: Copy button handler
export async function handleCopyButton(textToCopy: string) {
  const success = await copyText(textToCopy)
  if (success) {
    // Show success notification
    console.log('Copied to clipboard!')
  }
}

// Example: Paste button handler
export async function handlePasteButton() {
  const text = await pasteText()
  // Use the pasted text
  return text
}
