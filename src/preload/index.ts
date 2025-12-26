import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

// Global listener for question sync (Runs in BrowserViews)

ipcRenderer.on('question:sync', (_event, question) => {
  console.log('[Preload] Received question:', question)

  const url = window.location.href
  let inputSelector: string | null = null
  let buttonSelector: string | null = null

  // Site-specific selectors
  if (url.includes('yuanbao.tencent.com')) {
    inputSelector = 'div[contenteditable="true"]'
  } else if (url.includes('deepseek.com') || url.includes('chat.deepseek.com')) {
    inputSelector = 'textarea'
    buttonSelector = 'button[aria-label="Send"]'
  } else if (url.includes('manus.im')) {
    inputSelector = 'div[contenteditable], textarea'
  } else if (url.includes('chat.z.ai')) {
    inputSelector = 'textarea#chat-input'
    buttonSelector = 'button#send-message-button'
  } else if (url.includes('doubao.com')) {
    inputSelector = 'textarea.semi-input-textarea'
    buttonSelector = '#flow-end-msg-send'
  }

  // Generic heuristic if no specific match
  const findInput = () => {
    if (inputSelector) return document.querySelector<HTMLElement>(inputSelector)
    return document.querySelector<HTMLElement>('textarea, div[contenteditable="true"]')
  }

  const findButton = () => {
    if (buttonSelector) return document.querySelector<HTMLElement>(buttonSelector)

    // Heuristic search for button
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.find(b => {
      const ariaLabel = (b.getAttribute('aria-label') || '').toLowerCase()
      const text = (b.textContent || '').toLowerCase()
      const svgTitle = b.querySelector('svg title')?.textContent?.toLowerCase() || ''


      // Exclude obvious non-send buttons if possible, but inclusive search is better
      const isSendLike =
        ariaLabel.includes('send') ||
        ariaLabel.includes('发送') ||
        text.includes('send') ||
        text.includes('发送') ||
        svgTitle.includes('send')

      return isSendLike
    }) || null
  }

  const inputEl = findInput()
  if (inputEl) {
    console.log('[Preload] Found input element:', inputEl)

    // VISUAL DEBUGGING: Flash border red
    const originalBorder = inputEl.style.border
    inputEl.style.border = '4px solid red'
    setTimeout(() => {
      inputEl.style.border = originalBorder
    }, 500)

    // Focus and clear/set value
    inputEl.focus()

    // Handle different input types

    if (inputEl.tagName.toLowerCase() === 'textarea') {
      const textarea = inputEl as HTMLTextAreaElement
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, question)
      } else {
        textarea.value = question
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      textarea.dispatchEvent(new Event('change', { bubbles: true }))
    } else {
      // Contenteditable
      // Try execCommand first as it works better with some frameworks (like ProseMirror/Manua)
      inputEl.focus()
      const success = document.execCommand('insertText', false, question)

      if (!success) {
        console.log('[Preload] execCommand failed, falling back to innerText')
        inputEl.innerText = question
        inputEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    // Try to find submit button
    setTimeout(() => {
      let btn = findButton()

      // Fallback strategies for finding button
      if (!btn) {
        // DeepSeek specific: button might be in a shadow DOM or nearby
        if (url.includes('deepseek')) {
          const inputContainer = inputEl.closest('div')
          if (inputContainer) {
            btn = inputContainer.parentElement?.querySelector('button') || null
          }
        }
        // Generic: Look for button next to input
        if (!btn) {
          // Look up to 4 levels for a button
          let current = inputEl.parentElement
          for (let i = 0; i < 4 && current; i++) {
            btn = current.querySelector('button, div[role="button"]') as HTMLElement
            if (btn) break
            current = current.parentElement
          }
        }
      }

      if (btn) {
        console.log('[Preload] Clicking button:', btn)
        if (!(btn as HTMLButtonElement).disabled) {
          const mouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          btn.dispatchEvent(mouseEvent);
        } else {
          console.log('[Preload] Button is disabled, waiting...')
          // Try simulating more events to enable it? 
          // Sometimes focusout/blur helps?
          inputEl.dispatchEvent(new Event('blur', { bubbles: true }))
        }
      } else {
        console.log('[Preload] Could not find send button, trying Enter key')
        // Enhance Enter key simulation
        const keyOps = {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        }
        inputEl.dispatchEvent(new KeyboardEvent('keydown', keyOps));
        inputEl.dispatchEvent(new KeyboardEvent('keypress', keyOps));
        inputEl.dispatchEvent(new KeyboardEvent('keyup', keyOps));
      }
    }, 600) // Increased delay slightly to allow UI updates
  } else {
    console.warn('[Preload] Input element not found')
  }
})
