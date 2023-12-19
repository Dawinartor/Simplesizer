let audioPlayer = document.getElementById('audioPlayer');
let audioFileInput = document.getElementById('audioFile');
let speedInput = document.getElementById('speedInput');
let volumeInput = document.getElementById('volumeInput');
let pitchInput = document.getElementById('pitchInput');
let wavesurfer;

function initWaveSurfer() {
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        backend: 'WebAudio',
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'navy',
        barWidth: 3,
        barHeight: 1,
        plugins: [
            // Aktiviere das Pitch-Shift-Plugin
            WaveSurfer.pitchShift.create({
                // Pitch-Shift-Plugin aktivieren
                active: true
            })
        ]
    });

    wavesurfer.on('ready', function () {
        console.log('WaveSurfer is ready');
        // Setze die anfängliche Tonhöhe basierend auf dem Pitch-Input
        updatePitch();
    });

    wavesurfer.on('play', function () {
        console.log('WaveSurfer is playing');
        updateSpeed();
        updateVolume();
        updatePitch();
    });

    wavesurfer.on('pause', function () {
        console.log('WaveSurfer is paused');
    });

    wavesurfer.on('finish', function () {
        console.log('WaveSurfer finished playing');
        stopAudio();
    });
}

function playAudio() {
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    }
    updateSpeed();
    updateVolume();
    updatePitch();
    wavesurfer.playPause();
}

function pauseAudio() {
    audioPlayer.pause();
    wavesurfer.pause();
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    speedInput.value = 1.0;
    volumeInput.value = 1.0;
    pitchInput.value = 0; // Setze den Pitch auf den Standardwert
    updateSpeed();
    updateVolume();
    updatePitch();
    wavesurfer.stop();
}

function updateSpeed() {
    const speed = parseFloat(speedInput.value);
    audioPlayer.playbackRate = speed;
    wavesurfer.setPlaybackRate(speed);
}

function updateVolume() {
    const volume = parseFloat(volumeInput.value);
    audioPlayer.volume = volume;
    wavesurfer.setVolume(volume);
}

function updatePitch() {
    const pitch = parseFloat(pitchInput.value);
    wavesurfer.setPitch(pitch);
}

audioFileInput.addEventListener('change', function () {
    const file = audioFileInput.files[0];
    if (file) {
        const objectURL = URL.createObjectURL(file);
        audioPlayer.src = objectURL;
        audioPlayer.playbackRate = 1.0;
        audioPlayer.volume = 1.0;
        pitchInput.value = 0; // Setze den Pitch auf den Standardwert
        updateSpeed();
        updateVolume();
        updatePitch();
        wavesurfer.load(objectURL);
    }
});

speedInput.addEventListener('input', updateSpeed);
volumeInput.addEventListener('input', updateVolume);
pitchInput.addEventListener('input', updatePitch);

window.addEventListener('beforeunload', () => {
    audioPlayer.removeEventListener('play', playAudio);
    audioPlayer.removeEventListener('pause', pauseAudio);
    audioPlayer.removeEventListener('ended', stopAudio);
    speedInput.removeEventListener('input', updateSpeed);
    volumeInput.removeEventListener('input', updateVolume);
    pitchInput.removeEventListener('input', updatePitch);
});

// Initialisiere WaveSurfer
initWaveSurfer();
