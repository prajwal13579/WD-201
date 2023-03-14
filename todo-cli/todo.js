/* eslint-disable no-undef */
const todoList = () => {
  all = []
  const add = (todoItem) => {
    all.push(todoItem)
  }
  const markAsComplete = (index) => {
    all[index].completed = true
  }

  const overdue = () => {
    // Write the date check condition here and return the array
    // of overdue items accordingly.
    const over = [];
    all.filter(todo => todo.dueDate < today && over.push(todo));
    return over
  }

  const dueToday = () => {
    // Write the date check condition here and return the array
    // of todo items that are due today accordingly.
    return all.filter((todo) => todo.dueDate == today);
  }

  const dueLater = () => {
    // Write the date check condition here and return the array
    // of todo items that are due later accordingly.
    const later =[];
    all.forEach(todo => todo.dueDate > today && later.push(todo));
    return later
  }

  const toDisplayableList = (list) => {
    // Format the To-Do list here, and return the output string
    // as per the format given above.
    let x
        var result = []
        for (x=0;x<list.length;x++) {
            if (list[x].completed === false) {
                if (list[x].dueDate === today) {
                    result.push(`[ ] ${list[x].title}`)
                }
                else {
                    result.push(`[ ] ${list[x].title} ${list[x].dueDate}`)
                }
            }
            else {
                if (list[x].dueDate===today) {
                    result.push(`[x] ${list[x].title}`)
                }
                else {
                    result.push(`[x] ${list[x].title} ${list[x].dueDate}`)
                }          
            }
      }
      return result.join('\n')
    }

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList
  };
};

const today = new Date().toISOString().slice(0, 10);

module.exports = todoList;
