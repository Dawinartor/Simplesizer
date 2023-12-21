let audioPlayer = document.getElementById('audioPlayer');
let audioFileInput = document.getElementById('audioFile');
let speedInput = document.getElementById('speedInput');
let speedSlider = document.getElementById('speedSlider');
let volumeInput = document.getElementById('volumeInput');
let volumeSlider = document.getElementById('volumeSlider');
let pitchInput = document.getElementById('pitchInput');
let pitchSlider = document.getElementById('pitchSlider');
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
            WaveSurfer.pitchShift.create()
        ]
    });

    wavesurfer.on('ready', function () {
        console.log('WaveSurfer is ready');
        wavesurfer.pitchShift.setValue(0);
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
    wavesurfer.play();
}

function pauseAudio() {
    audioPlayer.pause();
    wavesurfer.pause();
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    speedInput.value = 1.0;
    speedSlider.value = 1.0;
    volumeInput.value = 1.0;
    volumeSlider.value = 1.0;
    pitchInput.value = 0;
    pitchSlider.value = 0;
    updateSpeed();
    updateVolume();
    updatePitch();
    wavesurfer.stop();
}

function updateSpeed() {
    const speed = parseFloat(speedInput.value);
    speedSlider.value = speed;
    audioPlayer.playbackRate = speed;
    wavesurfer.setPlaybackRate(speed);
}

function updateVolume() {
    const volume = parseFloat(volumeInput.value);
    volumeSlider.value = volume;
    audioPlayer.volume = volume;
    wavesurfer.setVolume(volume);
}

function updatePitch() {
    const pitch = parseFloat(pitchInput.value);
    pitchSlider.value = pitch;
    wavesurfer.pitchShift.setValue(pitch);
}

audioFileInput.addEventListener('change', function () {
    const file = audioFileInput.files[0];
    if (file) {
        const objectURL = URL.createObjectURL(file);
        audioPlayer.src = objectURL;
        audioPlayer.playbackRate = 1.0;
        audioPlayer.volume = 1.0;
        updateSpeed();
        updateVolume();
        updatePitch();
        wavesurfer.load(objectURL);
    }
});

speedInput.addEventListener('input', updateSpeed);
speedSlider.addEventListener('input', function () {
    speedInput.value = speedSlider.value;
    updateSpeed();
});

volumeInput.addEventListener('input', updateVolume);
volumeSlider.addEventListener('input', function () {
    volumeInput.value = volumeSlider.value;
    updateVolume();
});

pitchInput.addEventListener('input', updatePitch);
pitchSlider.addEventListener('input', function () {
    pitchInput.value = pitchSlider.value;
    updatePitch();
});

window.addEventListener('beforeunload', () => {
    audioPlayer.removeEventListener('play', playAudio);
    audioPlayer.removeEventListener('pause', pauseAudio);
    audioPlayer.removeEventListener('ended', stopAudio);
    speedInput.removeEventListener('input', updateSpeed);
    volumeInput.removeEventListener('input', updateVolume);
    pitchInput.removeEventListener('input', updatePitch);
    speedSlider.removeEventListener('input', function () { });
    volumeSlider.removeEventListener('input', function () { });
    pitchSlider.removeEventListener('input', function () { });
});

initWaveSurfer();
