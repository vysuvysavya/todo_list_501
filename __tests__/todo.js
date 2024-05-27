const todoList = require('../todo_list');
const { all, markAsComplete, add, overdue, dueToday, dueLater, clearAll,toDisplayableList } = todoList();

describe("Todolist test suite", () => {
    beforeEach(() => {
        clearAll();  
    });

    test("Should add new todo", () => {
        const todoItemsCount = all().length;
        add({
            title: 'Test todo',
            completed: false,
            dueDate: new Date().toLocaleDateString('en-CA')
        });
        expect(all().length).toBe(todoItemsCount + 1);
    });

    test("Should mark a todo as complete", () => {
        add({
            title: 'Test todo',
            completed: false,
            dueDate: new Date().toLocaleDateString('en-CA')
        });
        expect(all()[0].completed).toBe(false);
        markAsComplete(0);
        expect(all()[0].completed).toBe(true);
    });

    test("Should retrieve overdue items", () => {
        add({
            title: 'Overdue test todo',
            completed: false,
            dueDate: new Date(Date.now() - 86400000).toLocaleDateString('en-CA') 
        });
        const overdueItems = overdue();
        expect(overdueItems.length).toBe(1);
        expect(overdueItems[0].title).toBe('Overdue test todo');
    });

    test("Should retrieve due today items", () => {
        add({
            title: 'Due today test todo',
            completed: false,
            dueDate: new Date().toLocaleDateString('en-CA')
        });
        const dueTodayItems = dueToday();
        expect(dueTodayItems.length).toBe(1);
        expect(dueTodayItems[0].title).toBe('Due today test todo');
    });

    test("Should retrieve due later items", () => {
        add({
            title: 'Due later test todo',
            completed: false,
            dueDate: new Date(Date.now() + 86400000).toLocaleDateString('en-CA') 
        });
        const dueLaterItems = dueLater();
        expect(dueLaterItems.length).toBe(1);
        expect(dueLaterItems[0].title).toBe('Due later test todo');
    });
    test("Should display todos in a displayable list format", () => {
        const today = new Date().toLocaleDateString('en-CA');
        add({
            title: 'Due today test todo',
            completed: false,
            dueDate: today
        });
        add({
            title: 'Due later test todo',
            completed: false,
            dueDate: new Date(Date.now() + 86400000).toLocaleDateString('en-CA')
        });
        markAsComplete(0);
        
        const displayableList = toDisplayableList(all());
        const expectedDisplayableList = `[x] Due today test todo\n[ ] Due later test todo ${new Date(Date.now() + 86400000).toLocaleDateString('en-CA')}`;
        expect(displayableList).toBe(expectedDisplayableList);
    });
});
