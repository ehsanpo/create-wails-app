// App Config Helper
import { LoadConfig, SaveConfig, GetSetting, SetSetting } from '../wailsjs/go/main/App'

export async function loadConfig() {
  try {
    const config = await LoadConfig()
    return config
  } catch (error) {
    console.error('Failed to load config:', error)
    return null
  }
}

export async function saveConfig(config) {
  try {
    await SaveConfig(config)
    console.log('Config saved successfully')
    return true
  } catch (error) {
    console.error('Failed to save config:', error)
    return false
  }
}

export async function getSetting(key) {
  try {
    return await GetSetting(key)
  } catch (error) {
    console.error('Failed to get setting:', error)
    return null
  }
}

export async function setSetting(key, value) {
  try {
    await SetSetting(key, value)
    return true
  } catch (error) {
    console.error('Failed to set setting:', error)
    return false
  }
}

// Example usage
export async function exampleUsage() {
  // Load config
  const config = await loadConfig()
  console.log('Current config:', config)

  // Update theme
  if (config) {
    config.theme = 'dark'
    await saveConfig(config)
  }

  // Set custom setting
  await setSetting('notifications', true)
  
  // Get custom setting
  const notifications = await getSetting('notifications')
  console.log('Notifications enabled:', notifications)
}
