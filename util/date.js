import moment from "moment"

export function getFormattedDate(date) {
  return moment(date).format("MM/DD/YYYY h:mm A")
}

// mongodb+srv://sonali:<1234>@atlascluster.tbcgefh.mongodb.net/