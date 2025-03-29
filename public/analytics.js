const backendUrl = "https://pomodoro-schedular-829cab746192.herokuapp.com"; 

let date = new Date();
let dayOfWeek = date.getDay();

let monday = new Date(date);
monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));

let sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);

let chart;  // This will hold the reference to the chart

async function setChartTitle() {
    const title = document.getElementById("chart_title");

    let formattedMonday = `${monday.getMonth() + 1}/${monday.getDate()}/${monday.getFullYear()}`;
    let formattedSunday = `${sunday.getMonth() + 1}/${sunday.getDate()}/${sunday.getFullYear()}`;

    title.textContent = `${formattedMonday} - ${formattedSunday}`;
}

async function fetchWorkStatsForDate(date) {
    // Fetch work statistics from the server based on the current date
    const response = await fetch(`${backendUrl}/fetchWorkStats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
        const dateobj = new Date(workStats[i].date_time);
        const dayIndex = (dateobj.getDay() + 6) % 7; // Adjust index to make Monday=0

        workTimeData[dayIndex] = workStats[i].work_time;
        breakTimeData[dayIndex] = workStats[i].break_time;
        otherTimeData[dayIndex] = workStats[i].time_spent - (workStats[i].work_time + workStats[i].break_time);
    }

    // Check if chart already exists, and update it if it does
    if (chart) {
        chart.data.datasets[0].data = workTimeData;
        chart.data.datasets[1].data = breakTimeData;
        chart.data.datasets[2].data = otherTimeData;
        chart.update();  // Update the existing chart
    } else {
        // Create a new canvas element if it doesn't exist
        const canvas = document.createElement('canvas');
        canvas.id = 'myChart';
        document.getElementById('chart-container').appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Create a new chart and store the reference
        chart = new Chart(ctx, {
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
    // Move the date 7 days forward to the next week
    date.setDate(date.getDate() + 7);
    dayOfWeek = date.getDay();

    // Calculate the new Monday and Sunday for the next week based on the new date
    monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));

    sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setChartTitle();

    // Fetch work stats for the new date
    fetchWorkStatsForDate(date);
}

function prev_week() {
    // Move the date 7 days back to the previous week
    date.setDate(date.getDate() - 7);
    dayOfWeek = date.getDay();

    // Calculate the new Monday and Sunday for the previous week based on the new date
    monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));

    sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setChartTitle();

    // Fetch work stats for the new date
    fetchWorkStatsForDate(date);
}

document.addEventListener('DOMContentLoaded', async function() {
    // Fetch work statistics from the server when the page loads
    fetchWorkStatsForDate(date);
});

window.onload = () => {
    setChartTitle();
};
