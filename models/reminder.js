export class Reminder {
  constructor(id, title, description, type, complete, date, notificationId) {
    this.id = id
    this.title = title
    this.description = description
    this.type = type
    this.complete = complete
    this.date = date
    this.notificationId = notificationId
  }
}
