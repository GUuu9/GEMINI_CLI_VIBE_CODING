"use strict";
let startTime;
function updateElapsedTime() {
    const elapsedTimeElement = document.getElementById('elapsedTime');
    if (elapsedTimeElement) {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        elapsedTimeElement.textContent = `Time on page: ${minutes}m ${seconds}s`;
    }
}
window.onload = () => {
    startTime = Date.now();
    setInterval(updateElapsedTime, 1000);
};
