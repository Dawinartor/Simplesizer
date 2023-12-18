let audioPlayer = document.getElementById('audioPlayer');
let audioFileInput = document.getElementById('audioFile');
let speedInput = document.getElementById('speedInput');
let volumeInput = document.getElementById('volumeInput');

function playAudio() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    updateSpeed();
    updateVolume();
}

function pauseAudio() {
    audioPlayer.pause();
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    speedInput.value = 1.0; // Setze die Geschwindigkeit auf den Standardwert im Eingabefeld zurück
    volumeInput.value = 1.0; // Setze die Lautstärke auf den Standardwert im Eingabefeld zurück
    updateSpeed(); // Aktualisiere die Geschwindigkeit entsprechend
    updateVolume(); // Aktualisiere die Lautstärke entsprechend
}

function updateSpeed() {
    const speed = parseFloat(speedInput.value);
    audioPlayer.playbackRate = speed;
}

function updateVolume() {
    const volume = parseFloat(volumeInput.value);
    audioPlayer.volume = volume;
}

audioFileInput.addEventListener('change', function() {
    const file = audioFileInput.files[0];
    if (file) {
        const objectURL = URL.createObjectURL(file);
        audioPlayer.src = objectURL;
        audioPlayer.playbackRate = 1.0; // Setze die Geschwindigkeit auf den Standardwert
        audioPlayer.volume = 1.0; // Setze die Lautstärke auf den Standardwert
    }
});

speedInput.addEventListener('input', updateSpeed);
volumeInput.addEventListener('input', updateVolume);

// Eventlistener zum Entfernen
window.addEventListener('beforeunload', () => {
    audioPlayer.removeEventListener('play', playAudio);
    audioPlayer.removeEventListener('pause', pauseAudio);
    audioPlayer.removeEventListener('ended', stopAudio);
    speedInput.removeEventListener('input', updateSpeed);
    volumeInput.removeEventListener('input', updateVolume);
});
