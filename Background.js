// import { NativeModules, NativeEventEmitter } from "react-native"
// import { log } from "./Utils"

// // Events emitted by PLXBackground module.
// const BackgroundTaskExpired = "BackgroundTaskExpired"
// const BackgroundProcessingExecuting = "BackgroundProcessingExecuting"
// const BackgroundProcessingExpired = "BackgroundProcessingExpired"

// // Getting handles to background module and its event emitter.
// const PLXBackground = NativeModules.PLXBackground
// if (PLXBackground == null) {
//   console.error("PLXBackground is not defined!")
// }
// const PLXEventEmitter = new NativeEventEmitter(PLXBackground)

// // Timers identifiers.
// let nextTimeoutId = 0

// /**
//  * Create a timer.
//  * @param callback Callback invoked when timer fires.
//  * @param timeout  Time after which timer fires.
//  */
// const setTimeout = (callback, timeout) => {
//   const timeoutId = nextTimeoutId++
//   PLXBackground.setTimeout(timeout, timeoutId.toString()).then(() => {
//     callback()
//   })
//   return timeoutId
// }

// /**
//  * Clears timer with specified id.
//  * @param timeoutId Timer ID.
//  */
// const clearTimeout = timeoutId => {
//   PLXBackground.clearTimeout(timeoutId.toString())
// }

// /**
//  * Starts background task.
//  * @param taskName        Name of a task
//  * @param expiredCallback Callback invoked when task expired. User should call
//  *                        `endBackgroundTask` as soon as possible.
//  */
// const startBackgroundTask = async (taskName, expiredCallback) => {
//   const listener = event => {
//     if (event.taskName === taskName) {
//       expiredCallback(event.taskName)
//       PLXEventEmitter.removeListener(BackgroundTaskExpired, listener)
//     }
//   }

//   try {
//     PLXEventEmitter.addListener(BackgroundTaskExpired, listener)
//     await PLXBackground.startBackgroundTask(taskName)
//   } catch {
//     PLXEventEmitter.removeListener(BackgroundTaskExpired, listener)
//   }
//   return taskName
// }

// let registeredCallbacks = {}

// /**
//  *
//  * @param taskName              Task name to execute.
//  * @param timeout               Timeout in millisecond after which task executes.
//  * @param taskExecutionCallback Callback invoked when task execution started.
//  * @param taskExpiredCallback   Callback invoked when task execution expired.
//  */
// const scheduleBackgroundProcessingTask = async (
//   taskName,
//   timeout,
//   taskExecutionCallback,
//   taskExpiredCallback
// ) => {
//   const executingCallback = event => {
//     taskExecutionCallback(event.taskName)
//   }
//   const expiredCallback = event => {
//     taskExpiredCallback(event.taskName)
//   }
//   PLXEventEmitter.addListener(BackgroundProcessingExecuting, executingCallback)
//   PLXEventEmitter.addListener(BackgroundProcessingExpired, expiredCallback)
//   log("Here");
//   try {
//     await PLXBackground.scheduleBackgroundProcessing(taskName, timeout)
//     registeredCallbacks[taskName] = {
//       execution: executingCallback,
//       expired: expiredCallback
//     }
//   } catch (error) {
//     PLXEventEmitter.removeListener(
//       BackgroundProcessingExecuting,
//       executingCallback
//     )
//     PLXEventEmitter.removeListener(BackgroundProcessingExpired, expiredCallback)
//     throw error
//   }
// }

// /**
//  * Mark background processing task as completed.
//  * @param taskName Task name.
//  * @param result   True if task completed successfully
//  */
// const completeBackgroundProcessingTask = (taskName, result) => {
//   const callbacks = registeredCallbacks[taskName]
//   if (callbacks != null) {
//     PLXEventEmitter.removeListener(
//       BackgroundProcessingExecuting,
//       callbacks.execution
//     )
//     PLXEventEmitter.removeListener(
//       BackgroundProcessingExpired,
//       callbacks.expired
//     )
//     delete registeredCallbacks[taskName]
//   }
//   PLXBackground.completeBackgroundProcessing(taskName, result)
// }

// /**
//  * Cancel background processing task.
//  * @param taskName Task name
//  */
// const cancelBackgroundProcessingTask = taskName => {
//   console.log(taskName);
//   const callbacks = registeredCallbacks[taskName]
  
//   // if (callbacks != null) {
//   //   PLXEventEmitter.removeListener(
//   //     BackgroundProcessingExecuting,
//   //     callbacks.execution
//   //   )
//   //   PLXEventEmitter.removeListener(
//   //     BackgroundProcessingExpired,
//   //     callbacks.expired
//   //   )
//   //   PLXEventEmitter.removeAllListeners();
//   //   delete registeredCallbacks[taskName]
//   // }
//   PLXBackground.cancelBackgroundProcess(taskName)
// }

// /**
//  * Cancel all background processing tasks
//  */
// const cancelAllBackgroundProcessingTasks = () => {
//   PLXEventEmitter.removeAllListeners(BackgroundProcessingExecuting)
//   PLXEventEmitter.removeAllListeners(BackgroundProcessingExpired)
//   registeredCallbacks = {}
// }

// export default {
//   setTimeout,
//   clearTimeout,
//   startBackgroundTask,
//   endBackgroundTask: PLXBackground.endBackgroundTask,
//   scheduleBackgroundProcessingTask,
//   completeBackgroundProcessingTask,
//   cancelBackgroundProcessingTask,
//   cancelAllBackgroundProcessingTasks
// }
