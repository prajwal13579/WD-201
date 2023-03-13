/* eslint-disable no-undef */
const todoList = require('../todo');
const {all, markAsComplete, add} = todoList();

describe("Todolist Test Suite", () =>{
    beforeAll(() => {
        add(
            {
            title: "Test todo",
            completed: false,
            dueDate: new Date().toISOString(0,10)
            }
        );
    })
    test("Should add new todo", () =>{
        const todoItemsCount = all.length;
        add(
            {
            title: "Test todo",
            completed: false,
            dueDate: new Date().toISOString(0,10)
            }
        );
        expect(all.length).toBe(todoItemsCount + 1);
     });

    test("Should mark a todo as complete", () => {
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    });

    test("Overdue items", () =>{
        var yesterday = new Date(Date.now() - 864e5);
        add({
            title: "Overdue items",
            completed: true,
            dueDate: yesterday.toISOString(0,10)
        });

        expect(overdue().length).toBe(1);
    });

    test("Due today", () =>{
        var today = new Date();
        add({
            title: "Due Today",
            completed: false,
            dueDate: today.toISOString(0,10)
        });

        expect(dueToday().length).toBe(2);
    });

    test("Due later", ()=>{
        var tomorrow = new Date(Date.now() + 864e5);
        add({
            title: "Due later",
            completed: false,
            dueDate: tomorrow.toISOString(0,10)
        });

    });
});