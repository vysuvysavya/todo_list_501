const todoList = () => {
  let all = []

  const add = (todoItem) => {
    all.push(todoItem)
  }

  const markAsComplete = (index) => {
    all[index].completed = true
  }

  const overdue = () => {
    const today = formattedDate(new Date())
    return all.filter(todo => todo.dueDate < today)
  }

  const dueToday = () => {
    const today = formattedDate(new Date())
    return all.filter(todo => todo.dueDate === today)
  }

  const dueLater = () => {
    const today = formattedDate(new Date())
    return all.filter(todo => todo.dueDate > today)
  }

  const toDisplayableList = (list) => {
    const today = formattedDate(new Date())
    return list.map(todo => {
      const checkbox = todo.completed ? "[x]" : "[ ]"
      const displayDate = todo.dueDate === today ? "" : todo.dueDate
      return `${checkbox} ${todo.title} ${displayDate}`.trim()
    }).join("\n")
  }

  return { all, add, markAsComplete, overdue, dueToday, dueLater, toDisplayableList }
}


// ####################################### #
// DO NOT CHANGE ANYTHING BELOW THIS LINE. #
// ####################################### #

const todos = todoList();

const formattedDate = d => {
  return d.toISOString().split("T")[0]
}

var dateToday = new Date()
const today = formattedDate(dateToday)
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1))
)
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1))
)

todos.add({ title: 'Submit assignment', dueDate: yesterday, completed: false })
todos.add({ title: 'Pay rent', dueDate: today, completed: true })
todos.add({ title: 'Service Vehicle', dueDate: today, completed: false })
todos.add({ title: 'File taxes', dueDate: tomorrow, completed: false })
todos.add({ title: 'Pay electric bill', dueDate: tomorrow, completed: false })

console.log("My Todo-list\n\n")

console.log("Overdue")
var overdues = todos.overdue()
var formattedOverdues = todos.toDisplayableList(overdues)
console.log(formattedOverdues)
console.log("\n\n")

console.log("Due Today")
let itemsDueToday = todos.dueToday()
let formattedItemsDueToday = todos.toDisplayableList(itemsDueToday)
console.log(formattedItemsDueToday)
console.log("\n\n")

console.log("Due Later")
let itemsDueLater = todos.dueLater()
let formattedItemsDueLater = todos.toDisplayableList(itemsDueLater)
console.log(formattedItemsDueLater)
console.log("\n\n")