let audioPlayer = document.getElementById('audioPlayer');
let audioFileInput = document.getElementById('audioFile');

function playAudio() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
}

function pauseAudio() {
    audioPlayer.pause();
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}



audioFileInput.addEventListener('change', function() {
    const file = audioFileInput.files[0];
    if (file) {
        const objectURL = URL.createObjectURL(file);
        audioPlayer.src = objectURL;
    }
});

// Eventlistener zum Entfernen
window.addEventListener('beforeunload', () => {
    audioPlayer.removeEventListener('play', playAudio);
    audioPlayer.removeEventListener('pause', pauseAudio);
    audioPlayer.removeEventListener('ended', stopAudio);
});
