import { AppState } from "react-native"
import Background from "./Background"
import AsyncStorage from "@react-native-async-storage/async-storage"

let inForeground = true
AppState.addEventListener("change", state => {
  inForeground = state === "active"
  log(`App state: ${state}`)
})

let logListeners = []

export function addLogListener(listener) {
  logListeners.push(listener)
}

export function removeLogListener(listener) {
  logListeners = logListeners.filter(currentListener => {
    return currentListener !== listener
  })
}

export function log(message) {
  const time = Date.now().toString()
  const messageWithTime = `${time}: ${message}`
  console.log(messageWithTime)
  AsyncStorage.setItem(time, messageWithTime).catch(error => {
    console.warn(
      `Failed to send log: "${messageWithTime}" due to error: ${error.message}`
    )
  })
  if (inForeground) {
    for (const listener of logListeners) {
      listener(messageWithTime)
    }
  }
}

export async function collectLogs() {
  const keys = await AsyncStorage.getAllKeys()
  let keyValueArray = []
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key)
    if (value == null) {
      continue
    }
    keyValueArray.push([key, value])
  }
  return keyValueArray
    .sort((a, b) => {
      return b < a ? 1 : -1
    })
    .map(array => {
      return array[1]
    })
}

export function clearAllLogs() {
  return AsyncStorage.clear()
}

export function delay(timeout) {
  return new Promise(resolve => {
    Background.setTimeout(resolve, timeout)
  })
}
