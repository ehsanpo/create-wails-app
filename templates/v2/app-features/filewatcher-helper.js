// File Watcher Helper
import { WatchFile, UnwatchFile, StopWatching, OnFileChange } from '../wailsjs/go/main/App'

export async function watchFile(path) {
  try {
    await WatchFile(path)
    console.log('Started watching:', path)
  } catch (error) {
    console.error('Failed to watch file:', error)
  }
}

export async function unwatchFile(path) {
  try {
    await UnwatchFile(path)
    console.log('Stopped watching:', path)
  } catch (error) {
    console.error('Failed to unwatch file:', error)
  }
}

export async function stopAllWatching() {
  try {
    await StopWatching()
    console.log('Stopped all file watching')
  } catch (error) {
    console.error('Failed to stop watching:', error)
  }
}

// Example usage
export async function setupFileWatcher() {
  // Watch a specific file
  await watchFile('/path/to/config.json')
  
  // Watch a directory
  await watchFile('/path/to/directory')
  
  // Handle file changes (in production, use Wails events)
  // wails.Events.On('file:changed', (path) => {
  //   console.log('File changed:', path)
  // })
}
