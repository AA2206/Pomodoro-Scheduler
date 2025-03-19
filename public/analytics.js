document.addEventListener('DOMContentLoaded', async function() {
    // Fetch work statistics from the server
    const response = await fetch('/fetchWorkStats'); 
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

    // Create a canvas element dynamically
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    document.getElementById('chart-container').appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Create a stacked bar chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Work Time',
                    data: workTimeData,
                    backgroundColor: 'rgba(75, 192, 192, 0.8)', // Green
                    borderColor: 'rgba(75, 192, 192, 0.8)',
                    borderWidth: 1
                },
                {
                    label: 'Break Time',
                    data: breakTimeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue
                    borderColor: 'rgba(54, 162, 235, 0.8)',
                    borderWidth: 1
                },
                {
                    label: 'Other Time',
                    data: otherTimeData,
                    backgroundColor: 'rgba(255, 206, 86, 0.8)', //Yellow
                    borderColor: 'rgba(255, 206, 86, 0.8)',
                    borderWidth: 1
                }
                
            ]
        },
        options: {
            responsive: true,
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
                    beginAtZero: true
                }
            }
        }
    });
});
