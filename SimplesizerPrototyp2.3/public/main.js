let player;
let pitchShift;
let toneFFT;
let analyser;
let canvas, canvasCtx;

let lineY;
let lineX;
let isDraggingH = false;
let isDraggingV = false;
let offsetY = 0;
let offsetX = 0;
let positionUpdating = false;
let timedifference = 0;
let lasttime = 0;

async function uploadAudio() {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Upload der Datei: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBufferObj = await Tone.context.decodeAudioData(audioBuffer);

        initializePlayer(audioBufferObj);
        initializeVisualizer();
    } catch (error) {
        console.error(error.message);
    }
}

function initializePlayer(audioBuffer) {
    if (player) {
        player.stop();
        player.dispose();
    }

    pitchShift = new Tone.PitchShift().toDestination();
    player = new Tone.Player({
        url: audioBuffer,
        loop: false,
        autostart: false
    }).connect(pitchShift);

    toneFFT = new Tone.FFT();
    pitchShift.connect(toneFFT).toDestination();

    player.sync().start(0);

    const playPauseButton = document.getElementById('playPauseButton');
    playPauseButton.addEventListener('click', () => {
        playpause();
    });

    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        backtostart();
    });

    const speedInput = document.getElementById('speedSlider');
    speedInput.addEventListener('input', () => {
        changeSpeed();
    });

    const volumeInput = document.getElementById('volumeSlider');
    volumeInput.addEventListener('input', () => {
        changeVolume();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            playpause();
        }
    });
}

function initializeVisualizer() {
    // Starte die Audioanalyse
    analyser = Tone.context.createAnalyser();
    analyser.fftSize = 256;
    toneFFT.connect(analyser);

    // Starte die Canvas
    canvas = document.getElementById('waveform');
    canvasCtx = canvas.getContext('2d');

    lineY = canvas.height / 2; // Startposition der Horizontallinie
    lineX = canvas.width / 2; // Startposition der Vertikallinie

    // Event Listener für die Canvas
    canvas.addEventListener('mousedown', (e) => {
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;

        if (isMouseNearLineH(mouseY)) {
            isDraggingH = true;
            offsetY = mouseY - lineY;
        }

        if (isMouseNearLineV(mouseX)) {
            isDraggingV = true;
            offsetX = mouseX - lineX;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        isDraggingH = false;
        isDraggingV = false;
        canvas.style.cursor = 'auto';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDraggingH) {
            const mouseY = e.clientY - canvas.getBoundingClientRect().top;
            lineY = mouseY - offsetY;
            changePitch((100 / canvas.height * lineY - 50)/ -4);
        }
        if (isDraggingV) {
            positionUpdating = true;
            const mouseX = e.clientX - canvas.getBoundingClientRect().left;
            lineX = mouseX - offsetX;
            updatePosition();
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;

        if (isMouseNearLineV(mouseX) && isMouseNearLineH(mouseY)){
            canvas.style.cursor = 'move';
        } else if (isMouseNearLineH(mouseY)){
            canvas.style.cursor = 'ns-resize';
        } else if (isMouseNearLineV(mouseX)){
            canvas.style.cursor = 'ew-resize';
        }else {
            canvas.style.cursor = 'auto'
        }
    })

    // Starte die Animationsschleife für die Visualisierung
    requestAnimationFrame(drawVisualizer);
}

function drawVisualizer() {
    // Hol die Audiodaten vom Analyser
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Zeichne die Daten auf die Canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.setLineDash([]);
    canvasCtx.beginPath();
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.globalAlpha = 0.8;
    canvasCtx.lineTo(canvas.width, (dataArray[bufferLength-1]/128.0)*canvas.height/2);
    canvasCtx.stroke();
    canvasCtx.globalAlpha = 1;

    const currentTime = Tone.TransportTime().toSeconds();
    const speedInput = document.getElementById('speedSlider');
    const speedValue = parseFloat(speedInput.value);
    const baretime = timedifference + currentTime;
    const time = lasttime + (baretime - lasttime) * speedValue;
    timedifference = timedifference + time - baretime;
    lasttime = time;

    if (!isDraggingV && !positionUpdating) {
        const totalDuration = player.buffer.duration;

        lineX = (100 / totalDuration * (time))/100*canvas.width;
    }

    canvasCtx.setLineDash([]);
    canvasCtx.beginPath();
    canvasCtx.moveTo(lineX, 0);
    canvasCtx.lineTo(lineX, canvas.height);
    canvasCtx.stroke();

    canvasCtx.setLineDash([5, 5]);
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, lineY);
    canvasCtx.lineTo(canvas.width, lineY);
    canvasCtx.stroke();

    canvasCtx.setLineDash([5, 5]);
    canvasCtx.globalAlpha = 0.35;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, canvas.height/2);
    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
    canvasCtx.globalAlpha = 1;

    // Rufe nächsten Frame der Animation auf
    requestAnimationFrame(drawVisualizer);
}

function playpause() {
    if (player.state === "started") {
        Tone.Transport.pause();
    } else if (player.state === "stopped") {
        Tone.Transport.start();
    }
}

function backtostart() {
    if (player) {
        Tone.Transport.pause();
        Tone.Transport.seconds = 0;
        timedifference = 0;
        lasttime = 0;
        document.getElementById('positionSlider').value = 0;
    }
}

function changeSpeed() {
    const speedInput = document.getElementById('speedSlider');
    const speedValue = parseFloat(speedInput.value);

    if (!isNaN(speedValue)) {
        player.playbackRate = speedValue;
    } else {
        console.error('Ungültige Geschwindigkeitswert.');
    }
}

function changeVolume() {
    const volumeInput = document.getElementById('volumeSlider');
    const volumeValue = parseFloat(volumeInput.value);

    if (!isNaN(volumeValue)) {
        player.volume.value = Tone.gainToDb(volumeValue);
    } else {
        console.error('Ungültige Lautstärkewert.');
    }
}

function changePitch(pitch) {
    const newPitch = parseFloat(pitch);

    if (!isNaN(newPitch)) {
        pitchShift.pitch = newPitch;
    } else {
        console.error('Ungültiger Wert für Tonhöhe');
    }
}

function updatePosition() {
    const newPosition = 100/canvas.width*lineX / 100;

    if (!isNaN(newPosition)) {
        const currentTime = Tone.TransportTime().toSeconds();
        const duration = player.buffer.duration;
        const newTime = newPosition * duration;
        timedifference = newTime - currentTime;
        player.seek(newTime);
    } else {
        console.error('Ungültiger Positionswert.');
    }
    positionUpdating = false;
}

function isMouseNearLineH(mouseY) {
    return Math.abs(mouseY - lineY) < 15; // Anpassbare Entfernung
}

function isMouseNearLineV(mouseX) {
    return Math.abs(mouseX - lineX) < 15; // Anpassbare Entfernung
}