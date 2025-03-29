const backendUrl = "https://pomodoro-schedular-829cab746192.herokuapp.com"; 

const params = new URLSearchParams(window.location.search)

let count = 3600 * parseInt(params.get('work_hours')) + 60 * parseInt(params.get('work_minutes')) + parseInt(params.get('work_seconds'));  

if (isNaN(count)) {
    count = 0;
}

let isRunning = false; 
let workTimer = true; 
let interval; 
let time_spent_interval; 

let task = params.get('tasks'); 
let time_spent = 0; 
let work_time = 0; 
let break_time = 0; 
let pause_time = 0; 

const startButton = document.getElementById("startStop"); 
const resetButton = document.getElementById("reset"); 
const skipButton = document.getElementById("skip"); 
const finishButton = document.getElementById("finish"); 

displayTime(); 

function update_time(){
    time_spent += 1; 
}

function start_time(){
    time_spent_interval = setInterval(update_time, 1000); 
}

function displayTime() {
    const timer = document.getElementById("stopwatch") 

    const hours = Math.floor(count / 3600); 
    const minutes = Math.floor((count - hours * 3600)/60); 
    const seconds = (count - hours * 3600 - minutes * 60) % 60; 

    if(hours >= 10){
        timer.textContent = hours + ":"; 
    }
    else{
        timer.textContent = "0" + hours + ":"; 
    }

    if(minutes >= 10){
        timer.textContent = timer.textContent + minutes + ":";
    }
    else{
        timer.textContent = timer.textContent + "0" + minutes + ":";
    }

    if(seconds >= 10){
        timer.textContent = timer.textContent + seconds; 
    }
    else{
        timer.textContent = timer.textContent + "0" + seconds; 
    }
}

function updateStopWatch() {
    if(count == 0 && workTimer == true){
        const button = document.getElementById("startStop");
        const element = document.getElementById("timer_label"); 
        count = 3600 * parseInt(params.get('break_hours')) + 60 * parseInt(params.get('break_minutes')) + parseInt(params.get('break_seconds')) + 1; 
        workTimer = false; 
        button.textContent = "Start"; 
        element.textContent = "Break"; 
        clearInterval(interval)
        isRunning = !isRunning;
    }
    else if(count == 0 && workTimer == false){
        const button = document.getElementById("startStop");
        const element = document.getElementById("timer_label");
        count = 3600 * parseInt(params.get('work_hours')) + 60 * parseInt(params.get('work_minutes')) + parseInt(params.get('work_seconds')) + 1
        workTimer = true; 
        button.textContent = "Start"; 
        element.textContent = "Work";
        clearInterval(interval)
        isRunning = !isRunning;
    }
    else if(workTimer == true){
        work_time += 1; 
    }
    else{
        break_time += 1; 
    }
    count -= 1; 
    displayTime(); 
}

startButton.addEventListener("click", () => {
    const button = document.getElementById("startStop");
    if(isRunning){
        button.textContent = "Start"; 
        clearInterval(interval)
        isRunning = !isRunning;
    }
    else{
        button.textContent = "Stop";
        interval = setInterval(updateStopWatch, 1000)
        isRunning = !isRunning;  
    }
});

resetButton.addEventListener("click", () => {
    const button = document.getElementById("startStop")
    if(workTimer == true){
        count = 3600 * parseInt(params.get('work_hours')) + 60 * parseInt(params.get('work_minutes')) + parseInt(params.get('work_seconds'));
    }  
    else{
        count = 3600 * parseInt(params.get('break_hours')) + 60 * parseInt(params.get('break_minutes')) + parseInt(params.get('break_seconds'));
    }
    button.textContent = "Start";
    clearInterval(interval); 
    isRunning = false; 

    displayTime(); 
}); 

skipButton.addEventListener("click", () => {
    const button = document.getElementById("startStop");
    const element = document.getElementById("timer_label"); 
    if(workTimer == true){
        count = 3600 * parseInt(params.get('break_hours')) + 60 * parseInt(params.get('break_minutes')) + parseInt(params.get('break_seconds')); 
        workTimer = false; 
        button.textContent = "Start"; 
        element.textContent = "Break"; 
        clearInterval(interval)
        isRunning = !isRunning;
    }
    else{
        count = 3600 * parseInt(params.get('work_hours')) + 60 * parseInt(params.get('work_minutes')) + parseInt(params.get('work_seconds')); 
        workTimer = true; 
        button.textContent = "Start"; 
        element.textContent = "Work";
        clearInterval(interval)
        isRunning = !isRunning;
    }

    displayTime(); 
}); 

finishButton.addEventListener("click", () => {
    try {
        clearInterval(time_spent_interval); 
        storedDate = new Date(); 

        const response = fetch(`${backendUrl}/add-work`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            }, 
            body: JSON.stringify({
                date_time: storedDate.toDateString(),
                timeSpent: time_spent/60, 
                workTime: work_time/60, 
                breakTime: break_time/60
            })
        })
    }
    catch (error){
        console.error('Error adding work: ', error); 
    }

    window.location.href = 'To-Do.html'; 
}); 

document.addEventListener("DOMContentLoaded", start_time);