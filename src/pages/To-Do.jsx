import Navigation from "../Components/Navigation"
import { useRef } from 'react'; 
import { Link } from "react-router-dom"
import React, { useState, useEffect } from 'react'; 

export default function ToDo(){
    const inputRef = useRef(); 
    
    const menuItems = [{ name: "Logout", url: "/"}, { name: "Analytics", url: "/analytics"}, { name: "Work", url: "/work"}, { name: "To-Do", url: "/to-do"}]

    const [date, setDate] = useState(new Date())
    const [taskList, setTaskList] = useState([])

    let year = date.getFullYear()
    let month = date.getMonth()

    const prevDates = []
    const currDates = []
    const afterDates = []


    function populateLists(){
        let dayOne = new Date(year, month, 1).getDay(); 
        let lastdate = new Date(year, month + 1, 0).getDate(); 
        let dayend = new Date(year, month, lastdate).getDay(); 
        let monthlastdate = new Date(year, month, 0).getDate();
    
        for(let i = dayOne; i > 0; i--){
            prevDates.push(monthlastdate - i + 1)
        }
    
        for(let i = 1; i <= lastdate; i++){
            currDates.push(i)
        }
    
        for(let i = dayend; i < 6; i++){
            afterDates.push(i - dayend + 1)
        }
            
    }

    populateLists()

    const prevDateItems = prevDates.map((item, index) => (
        <li key = {index} className = 'inactive'>{item}</li>
    ))

    const currDateItems = currDates.map((item, index) => {
        let isToday = item === date.getDate() ? "active" : ""
        return <li key = {index} className= {isToday} onClick={() => changeDay(item)}>{item}</li>
    })

    const afterDateItems = afterDates.map((item, index) => (
        <li key = {index} className = 'inactive'>{item}</li>
    ))

    function changeDay(selectedDay){
        const newDate = new Date(date.getFullYear(), date.getMonth(), selectedDay);
        setDate(newDate); 
    }

    function decrementMonth(){
        month = month - 1; 
        setDate(new Date(year, month, date.getDate()));
    }

    function incrementMonth(){
        month = month + 1; 
        setDate(new Date(year, month, date.getDate()));
    }

    async function addTask() {
        const taskDescription = inputRef.current.value; 
        const username = localStorage.getItem('username')

        if (taskDescription === ''){
            alert("You must write something"); 
            return; 
        }

        try {
            const response = await fetch('http://localhost:5001/add-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    task_description: taskDescription,
                    date_time: date.toDateString(), 
                }),
            });
            if(response.ok){
                setTaskList(prevTaskList => [...prevTaskList, taskDescription])
                inputRef.current.value = ""; 
            }
            else{
                console.log('Failed to add task')
            }
        } catch (error){
            alert('error')
            console.error('Error adding task:', error)
        }
    }

    useEffect(() => {
        const fetchTasks = async () => {
            const params = new URLSearchParams({
                date_time: date.toDateString(),
            });
    
            try {
                const response = await fetch(`http://localhost:5001/fetchTasks?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include'
                });
    
                if (response.ok) {
                    const tasks = await response.json();
                    const updatedList = tasks.map(item => item.task);
                    setTaskList(updatedList);
                } else {
                    console.log("No tasks found or user not logged in");
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
    
        fetchTasks();
    }, [date]);
    

    async function removeTask(taskDescription, specificIndex){
        try {
            const response = await fetch('http://localhost:5001/remove-task', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    task_description: taskDescription,
                    date_time: date.toDateString(),
                    username: localStorage.getItem('username'),
                }),
            }); 

            if(response.ok){
                setTaskList(prevTaskList => prevTaskList.filter((_, index) => index !== specificIndex));
            }
            else {
                console.log('Failed to remove task');
            }
        } catch (error) {
            console.error('Error removing task:', error);
        }
    }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    return(
        <>
            <Navigation menuItems={menuItems} />
            <div id = "To-Do-and-Calendar-container">
                <div className = "calendar-container">
                    <div id = "calendar">
                        <header className = "calendar-header">
                            <p className = "calendar-current-date">{months[month]} {year}</p>
                            <div className = "calendar-navigation">
                                <span id = "calendar-prev" className = "material-symbols-rounded" onClick={decrementMonth}>Chevron_left</span>
                                <span id = "calendar-next" className = "material-symbols-rounded" onClick={incrementMonth}>Chevron_right</span>
                            </div>
                        </header>
                        <div className = "calendar-body">
                            <ul className = "calendar-weekdays">
                                <li>Sun</li>
                                <li>Mon</li>
                                <li>Tu</li>
                                <li>Wed</li>
                                <li>Thu</li>
                                <li>Fri</li>
                                <li>Sat</li>
                            </ul>
                            <ul className = "calendar-dates">
                                {prevDateItems}
                                {currDateItems}
                                {afterDateItems}
                            </ul>
                        </div>
                    </div>
                </div>

                <div id = "To-Do-container">
                    <div id = "To-Do">
                        <h1>To-Do List</h1>
                        <div className = "input-section">
                            <input type = "text" id = "taskInput" placeholder="Add your text" ref = {inputRef}></input>
                            <button id = "addTask" onClick={addTask}>Add</button>
                        </div>

                        <ul id = "taskList">
                            {taskList.map((item, index) => (
                                <li key = {index}>{item}<span onClick = {() => removeTask(item, index)}>&times;</span></li>
                            ))}
                        </ul>
                        <button id = "start_work"><Link id = "To-Do_link_tag" to = "/Work">Start Working</Link></button>
                    </div>
                </div>
            </div>
        </>
    )
}