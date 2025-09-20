import Navigation from "../Components/Navigation"
import { Link } from "react-router-dom"
import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from "react-router-dom";

export default function Work(){
    const navigate = useNavigate(); 

    const menuItems = [{ name: "Logout", url: "/"}, { name: "Analytics", url: "/analytics"}, { name: "Work", url: "/work"}, { name: "To-Do", url: "/to-do"}]    
    const [renderTimer, setRenderTimer] = useState(false);
    const [dropDownOptions, setDropDownOptions] = useState([]);
    const [count, setCount] = useState(0); 
    const [isRunning, setIsRunning] = useState(false); 
    const [isWork, setIsWork] = useState(true); 

    const workTime = useRef(0); 
    const breakTime = useRef(0); 
    const intervalRef = useRef(null); 

    const timeSpent = useRef(0); 
    const workTimeSpent = useRef(0); 
    const breakTimeSpent = useRef(0); 

    function updateTime(){
        timeSpent.current = timeSpent.current + 1; 
    }

    useEffect(() => {
        const timeSpentInterval = setInterval(updateTime, 1000); 
        return () => clearInterval(timeSpentInterval); 
    }, []); 
 
    function loadTimer(){
        setRenderTimer(true);
    }

    function loadSettings(){
        setRenderTimer(false);
    }

    useEffect(() => {
        async function populateDropdown() {
            const date = new Date(); 
    
            const params = new URLSearchParams({
                date_time: date.toDateString(),
            });
            
            try {
                const response = await fetch(`http://localhost:5001/fetchTasks?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                });
            
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
            
                const tasks = await response.json(); // Convert response to JSON
    
                // Set the dropdown options state
                setDropDownOptions(tasks.map(item => item.task));
    
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        }

        populateDropdown(); // Fetch the tasks when the component mounts

    }, []);

    async function handleSubmit(event){
        event.preventDefault(); 
        const formEl = event.currentTarget; 
        const formData = new FormData(formEl)

        workTime.current = 3600 * parseInt(formData.get("work_hours")) + 60 * parseInt(formData.get("work_minutes")) + parseInt(formData.get("work_seconds"));
        breakTime.current = 3600 * parseInt(formData.get("break_hours")) + 60 * parseInt(formData.get("break_minutes")) + parseInt(formData.get("break_seconds"));

        setCount(workTime.current); 
        setRenderTimer(true);
    }

    function displayTime(){
        let stopWatch = "00:00:00"

        const hours = Math.floor(count / 3600);
        const minutes = Math.floor((count - hours * 3600)/60);
        const seconds = (count - hours * 3600 - minutes * 60) % 60;

        if(hours >= 10){
            stopWatch = hours + ":";
        }
        else{
            stopWatch = "0" + hours + ":";
        }

        if(minutes >= 10){
            stopWatch = stopWatch + minutes + ":"; 
        }
        else{
            stopWatch = stopWatch + "0" + minutes + ":";
        }

        if(seconds >= 10){
            stopWatch = stopWatch + seconds;
        }
        else{
            stopWatch = stopWatch + "0" + seconds;
        }

        return stopWatch;
    }

    useEffect(() => {
        if(isRunning){
            intervalRef.current = setInterval(() => {
                isWork ? workTimeSpent.current += 1 : breakTimeSpent.current += 1; 
                setCount(prevCount => {
                    if(prevCount <= 1){
                        clearInterval(intervalRef.current)
                        setIsWork(prev => !prev)
                        setIsRunning(prev => !isRunning)
                        if(isWork){
                            return breakTime.current; 
                        }
                        else{
                            return workTime.current;  
                        }
                    }
                    return prevCount - 1; 
                }); 
            }, 1000); 
        }

        return () => clearInterval(intervalRef.current); 
    }, [isRunning]); 

    function toggleTimer(){
        setIsRunning(prev => !prev);
    }

    function resetTimer(){
        setIsRunning(false); 
        setCount(isWork ? workTime.current : breakTime.current); 
    }

    function skipTimer(){
        if(isWork){
            setCount(breakTime.current); 
            setIsWork(false);
        }
        else{
            setCount(workTime.current); 
            setIsWork(true); 
        }
    }

    async function finishWork(){
        try{
            clearInterval(intervalRef.current);

            console.log("Adding task"); 

            const date = new Date(); 

            const response = await fetch('http://localhost:5001/add-work', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                }, 
                credentials: 'include',
                body: JSON.stringify({
                    date_time: date.toISOString(),
                    timeSpent: timeSpent.current / 60,
                    workTime: workTimeSpent.current / 60, 
                    breakTime: breakTimeSpent.current / 60,
                })
            })

            if(response.ok){
                navigate('/to-do');
            }
        }
        catch (error){
            console.error('Error adding work: ', error);
        }
    } 

    return(
        <>
            <Navigation menuItems={menuItems} />
            <div id = "work_container">
                <div id = "side_panel">
                    <ul id = "options">
                        <li className = "side_option" onClick = {loadTimer}>Timer</li>
                        <li className = "side_option" onClick = {loadSettings}>Settings</li>
                    </ul>
                </div>

                {renderTimer && <div className = "stopwatch-container">
                    <p id = "timer_label">{isWork ? "Work" : "Break"}</p>
                    <h1 id = "stopwatch">{displayTime()}</h1>
                    <div className = "buttons">
                        <button id = "startStop" onClick={toggleTimer}>{isRunning ? "Stop" : "Start"}</button>
                        <button id = "reset" onClick={resetTimer}>Reset</button>
                        <button id = "skip" onClick={skipTimer}>Skip</button>
                        <button id = "finish" onClick={finishWork}>Finish</button>
                    </div>
                </div>}

                {!renderTimer && <div id = "form_container">
                    <form id = "timer_settings" onSubmit={handleSubmit}>
                        <div className = "timer_inputs">
                            <h2>Work Timer</h2>
                            <div className = "inputs">
                                <div className = "input_field">
                                    <label htmlFor = "work_hours">Hours</label>
                                    <br />
                                    <input type = "number" name = "work_hours" id = "hours" required />
                                </div>
                                
                                <div className = "input_field">
                                    <label htmlFor = "work_minutes">Minutes</label>
                                    <br />
                                    <input type = "number" name = "work_minutes" required />
                                </div>
                                                        
                                <div className = "input_field">
                                    <label htmlFor = "work_seconds">Seconds</label>
                                    <br />
                                    <input type = "number" name = "work_seconds" required />
                                </div>
                            </div>
                        </div>

                        <div className = "timer_inputs">
                            <h2>Break Timer</h2>
                            <div className = "inputs">
                                <div className = "input_field">
                                    <label htmlFor = "break_hours">Hours</label>
                                    <br />
                                    <input type = "number" name = "break_hours" required />
                                </div>
                                
                                <div className = "input_field">
                                    <label htmlFor = "break_minutes">Minutes</label>
                                    <br />
                                    <input type = "number" name = "break_minutes" required />
                                </div>

                                <div className = "input_field">
                                    <label htmlFor = "break_seconds">Seconds</label>
                                    <br />
                                    <input type = "number" name = "break_seconds" required />
                                </div>
                            </div>
                        </div>

                        <div className = "timer_inputs">
                            <h2>Choose Event</h2>
                            <div className = "inputs">
                                <div className = "input_field">
                                    <label htmlFor = "dropdown">Select Task</label>
                                    <br />
                                    <select id = "dropdown" name = "tasks" required>
                                        {dropDownOptions.map((item, index) => (
                                            <option key = {index} value = {item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>                   
                        </div>

                        <input id = "submit" type = "submit" value = "submit" /> 
                    </form>
                </div>}
            </div>   
        </>
    )
}