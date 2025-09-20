import Navigation from "../Components/Navigation"
import React, { useEffect, useRef, useState } from "react";

export default function Analytics(){
    const menuItems = [{ name: "Logout", url: "/"}, { name: "Analytics", url: "/analytics"}, { name: "Work", url: "/work"}, { name: "To-Do", url: "/to-do"}]

    const chartTitle = useRef(null); 
    const chart = useRef(null); 
    const chartInstance = useRef(null);
    const [date, setDate] = useState(new Date());
    
    console.log(date.toDateString()); 

    let dayOfWeek = date.getDay();

    let monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));

    let sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    let formattedMonday = `${monday.getMonth() + 1}/${monday.getDate()}/${monday.getFullYear()}`;
    let formattedSunday = `${sunday.getMonth() + 1}/${sunday.getDate()}/${sunday.getFullYear()}`;

    async function fetchWorkStatsForDate(date) {
        // Fetch work statistics from the server based on the current date
        const response = await fetch('http://localhost:5001/fetchWorkStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                date: date.toISOString(),
            }),
        });

        const workStats = await response.json();

        // Initialize arrays for work, break, and other time
        const workTimeData = [0, 0, 0, 0, 0, 0, 0];
        const breakTimeData = [0, 0, 0, 0, 0, 0, 0];
        const otherTimeData = [0, 0, 0, 0, 0, 0, 0];

        // Loop through workStats and map the values to the correct days
        for (let i = 0; i < workStats.length; i++) {
            const dateobj = new Date(workStats[i].date);
            const dayIndex = (dateobj.getDay() + 6) % 7; // Adjust index to make Monday=0

            workTimeData[dayIndex] = workStats[i].work_time;
            breakTimeData[dayIndex] = workStats[i].break_time;
            otherTimeData[dayIndex] = workStats[i].time_spent - (workStats[i].work_time + workStats[i].break_time);
        }

        // Check if chart already exists, and update it if it does
        if (chartInstance.current) {
            chartInstance.current.data.datasets[0].data = workTimeData;
            chartInstance.current.data.datasets[1].data = breakTimeData;
            chartInstance.current.data.datasets[2].data = otherTimeData;
            chartInstance.current.update();  // Update the existing chart
        } else {
            // Create a new canvas element if it doesn't exist
            const ctx = chart.current.getContext('2d');

            // Create a new chart and store the reference
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        {
                            label: 'Work Time (Minutes)',
                            data: workTimeData,
                            backgroundColor: 'rgba(75, 192, 192, 0.8)', // Green
                            borderColor: 'rgba(75, 192, 192, 0.8)',
                            borderWidth: 1
                        },
                        {
                            label: 'Break Time (Minutes)',
                            data: breakTimeData,
                            backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue
                            borderColor: 'rgba(54, 162, 235, 0.8)',
                            borderWidth: 1
                        },
                        {
                            label: 'Other Time (Minutes)',
                            data: otherTimeData,
                            backgroundColor: 'rgba(255, 206, 86, 0.8)', //Yellow
                            borderColor: 'rgba(255, 206, 86, 0.8)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                        }
                    }
                }
            });
        }
    }

    function next_week() {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + 7);
        setDate(newDate);
    }

    function prev_week() {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() - 7);
        setDate(newDate);
    }

    useEffect(() => {
        fetchWorkStatsForDate(date);
        chartTitle.current.textContent = `${formattedMonday} - ${formattedSunday}`;
    }, [date]);

    return(
        <>
            <Navigation menuItems={menuItems} />

            <header id = "chart_header">
                <span id = "calendar-prev" className = "material-symbols-rounded" onClick= {prev_week}>Chevron_left</span>
                <h1 id = "chart_title" ref = {chartTitle}></h1>
                <span id = "calendar-next" className = "material-symbols-rounded" onClick={next_week}>Chevron_right</span>
            </header>

            <div id="chart-container">
                <canvas ref = {chart} id = "myChart"></canvas>
            </div>
            
        </>
    )
}