// Native Dialogs Example
import { OpenFileDialog, OpenDirectoryDialog, SaveFileDialog, ShowInfoDialog, ShowQuestionDialog } from '../wailsjs/go/main/App'

export async function openFile() {
  try {
    const file = await OpenFileDialog()
    console.log('Selected file:', file)
    return file
  } catch (error) {
    console.error('Error opening file:', error)
  }
}

export async function openDirectory() {
  try {
    const dir = await OpenDirectoryDialog()
    console.log('Selected directory:', dir)
    return dir
  } catch (error) {
    console.error('Error opening directory:', error)
  }
}

export async function saveFile() {
  try {
    const file = await SaveFileDialog()
    console.log('Save location:', file)
    return file
  } catch (error) {
    console.error('Error saving file:', error)
  }
}

export async function showMessage() {
  await ShowInfoDialog('Information', 'This is an info message!')
}

export async function askQuestion() {
  try {
    const answer = await ShowQuestionDialog('Confirm', 'Are you sure?')
    console.log('User answered:', answer)
    return answer === 'Yes'
  } catch (error) {
    console.error('Error showing question:', error)
  }
}
