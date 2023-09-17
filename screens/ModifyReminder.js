import { useEffect, useLayoutEffect, useState } from "react"
import {
  createReminder,
  deleteReminder,
  getReminderDetails,
  updateReminder
} from "../util/database"
import { Reminder } from "../models/reminder"
import LoadingOverlay from "../Components/UI/LoadingOverlay"
import ErrorOverlay from "../Components/UI/ErrorOverlay"
import { Pressable, StyleSheet, View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { GlobalStyles } from "../constants/styles"
import ReminderForm from "../Components/Forms/ReminderForm"
import * as Notifications from "expo-notifications"

const ModifyReminder = ({ route, navigation }) => {
  const reminderId = route.params?.reminderId
  const isEditing = !!reminderId

  const [reminder, setReminder] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useLayoutEffect(() => {
    navigation.setOptions({
      title: reminderId ? "Reminder Details" : "New Reminder",

      headerRight: () => (
        <>
          {isEditing && (
            <Pressable onPress={onDelete}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                color={GlobalStyles.colors.error}
                size={24}
              />
            </Pressable>
          )}
        </>
      )
    })
  }, [reminderId, navigation])

  useEffect(() => {
    async function loadReminder() {
      try {
        if (!reminderId) return
        setIsLoading(true)
        const response = await getReminderDetails(reminderId)
        setReminder(response)
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        setErrorMessage("Unable to fetch reminder.")
      }
    }

    loadReminder()
  }, [reminderId])

  async function cancelNotification() {
    if (reminder?.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        reminder.notificationId
      )
    }
  }

  async function onDelete() {
    if (!reminderId) return
    setIsLoading(true)
    try {
      await cancelNotification()
      await deleteReminder(reminderId)
      navigation.goBack()
    } catch (error) {
      console.log(error)
      setIsLoading(false)
      setErrorMessage("Unable to delete reminder")
    }
  }

  async function onComplete() {
    if (!reminderId || !reminder) return
    setIsLoading(true)
    try {
      reminder.complete = true
      await cancelNotification()
      await updateReminder(reminder)
      navigation.goBack()
    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setErrorMessage("Unable to mark as done")
    }
  }

  async function scheduleNotification(title, description, date) {
    await cancelNotification()
    const currentDate = new Date()
    if (date.getTime() <= currentDate.getTime()) return
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${title}`,
        body: description,
        data: {
          reminderId
        }
      },
      trigger: date
    })
  }

  async function onSubmit({ title, description, date }) {
    setIsLoading(true)
    try {
      const notificationId = await scheduleNotification(
        title,
        description,
        date
      )

      if (isEditing) {
        const updateReminderData = new Reminder(
          reminderId,
          title,
          description,
          "reminder",
          false,
          date,
          notificationId
        )
        await updateReminder(updateReminderData)
      } else {
        await createReminder({
          title,
          description,
          date,
          type: "reminder",
          notificationId
        })
      }

      navigation.navigate("ReminderList")
    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setErrorMessage("Unable to save reminder")
    }
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (errorMessage) {
    return <ErrorOverlay message={errorMessage} />
  }

  return (
    <View style={styles.container}>
      <ReminderForm
        reminder={reminder}
        onSubmit={onSubmit}
        onComplete={onComplete}
        onCancel={() => navigation.goBack()}
        complete={reminder?.complete}
      />
    </View>
  )
}

export default ModifyReminder

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24
  }
})
