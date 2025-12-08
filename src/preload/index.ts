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
    // Tencent Yuanbao
    inputSelector = 'div[contenteditable="true"]'
    // Fallback or more specific if needed. The spec mentioned textarea.ProseMirror but modern/rich text editors often use contenteditable divs.
    // Let's try multiple potential selectors or stick to spec if confirmed. Spec said "textarea.ProseMirror".
    // I will use a list of strategies.

    // Attempt 1: Protocol based
  } else if (url.includes('deepseek.com') || url.includes('chat.deepseek.com')) {
    inputSelector = 'textarea'
    buttonSelector = 'button[aria-label="Send"]' // Common pattern, need verification
  }

  // Generic heuristic if no specific match or to refine
  const findInput = () => {
    if (inputSelector) return document.querySelector<HTMLElement>(inputSelector)
    return document.querySelector<HTMLElement>('textarea, div[contenteditable="true"]')
  }

  const findButton = () => {
    if (buttonSelector) return document.querySelector<HTMLElement>(buttonSelector)
    // Heuristic: button near input or with specific icon/text
    // This is hard to do generically perfectly.
    return null
  }

  const inputEl = findInput()
  if (inputEl) {
    // Simulate input
    inputEl.focus()
    // For React/Vue controlled inputs, we often need to set value and dispatch events
    if (inputEl.tagName.toLowerCase() === 'textarea') {
      const textarea = inputEl as HTMLTextAreaElement
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, question)
      } else {
        textarea.value = question
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      // Contenteditable
      inputEl.innerText = question
      inputEl.dispatchEvent(new Event('input', { bubbles: true }))
    }

    // Try to find submit button
    setTimeout(() => {
      // Heuristic search for button if not defined
      let btn = findButton()
      if (!btn) {
        // Try to find a button that looks like a send button
        // e.g. svgs inside buttons
        const buttons = Array.from(document.querySelectorAll('button'))
        // DeepSeek often uses an arrow icon or specific class.
        // Yuanbao uses a specific testid or class.
        btn = buttons.find(b => {
          const ariaLabel = b.getAttribute('aria-label') || ''
          const text = b.textContent || ''

          // DeepSeek send button usually has no text, just an icon.
          // Yuanbao might have "发送" or similar.
          return (
            ariaLabel.toLowerCase().includes('send') ||
            ariaLabel.includes('发送') ||
            text.includes('发送') ||
            text.toLowerCase().includes('send')
          )
        }) || null

        // Fallback: finding the last button in the input container?
        // If no button found, look for one with specific SVG path if known?
        // For now, let's trust aria-labels or generic "Send" text.

        // Special case for DeepSeek:
        if (!btn && url.includes('deepseek')) {
          // DeepSeek's send button often distinct.
          // Try looking for the button inside the prompt input area.
          const inputArea = inputEl.closest('div') // Move up a bit
          if (inputArea) {
            btn = inputArea.parentElement?.querySelector('button') || null
          }
        }
      }

      if (btn) {
        console.log('[Preload] Clicking button:', btn)
        // Dispatch 'click' event manually is often better for React
        /*
        btn.click()
        */
        const mouseEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        btn.dispatchEvent(mouseEvent);

      } else {
        console.log('[Preload] Could not find send button, trying Enter key')
        // Try Enter key
        // Some React apps need keydown AND keyup, or specifically "Enter" without modifiers.
        // It's tricky to get right.
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        });
        inputEl.dispatchEvent(enterEvent);
      }
    }, 500)
  }
})
