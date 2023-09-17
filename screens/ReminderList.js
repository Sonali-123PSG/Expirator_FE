import { FlatList, StyleSheet, Text, View } from "react-native"
import { useEffect, useState } from "react"
import { useIsFocused } from "@react-navigation/native"
import { getReminders } from "../util/database"
import ErrorOverlay from "../Components/UI/ErrorOverlay"
import ReminderItem from "../Components/Reminders/ReminderItem"

const ReminderList = ({}) => {
  const isFocused = useIsFocused()

  const [reminders, setReminders] = useState([])
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadReminders() {
      try {
        const response = await getReminders("reminder")
        setReminders(response)
      } catch (error) {
        console.error(error)
        setErrorMessage("Unable to fetch reminders")
      }
    }

    if (isFocused) {
      loadReminders()
    }
  }, [isFocused])

  if (errorMessage) {
    return <ErrorOverlay message={errorMessage} />
  }

  if (reminders.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No items have been added</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        renderItem={itemData => <ReminderItem reminder={itemData.item} />}
      />
    </View>
  )
}

export default ReminderList

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyStateText: {
    fontSize: 18
  }
})
