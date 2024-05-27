const todoList= ()=>{
  let todos = [];
  const add=(todo)=>{
    todos.push(todo); 
  } 
  const markAsComplete=(index)=> {
     if (todos[index]) { 
      todos[index].completed = true; 
      } 
  } 
  const overdue=() =>{ 
      const now = new Date().toLocaleDateString('en-CA');
       return todos.filter(todo => todo.dueDate < now && !todo.completed);
  } 
  const dueToday=()=> {
      const today = new Date().toLocaleDateString('en-CA'); 
      return todos.filter(todo => todo.dueDate === today && !todo.completed); 
  } 
  const dueLater=()=> { 
      const today = new Date().toLocaleDateString('en-CA'); 
      return todos.filter(todo => todo.dueDate > today && !todo.completed); 
  } 
  const clearAll = ()=>{ 
      todos = []; 
  } 
  const all = ()=> { 
      return todos; 
  }
  const toDisplayableList = (list) => {
    const today = new Date().toLocaleDateString('en-CA');
    return list.map(todo => {
      const checkbox = todo.completed ? "[x]" : "[ ]"
      const displayDate = todo.dueDate === today ? "" : todo.dueDate
      return `${checkbox} ${todo.title} ${displayDate}`.trim()
    }).join("\n")
  }
  return {add,markAsComplete,overdue,dueToday,dueLater,clearAll,all,toDisplayableList}
}

module.exports = todoList;