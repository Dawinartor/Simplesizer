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
    var fileInput = document.getElementById('fileInput');
    var fileNameContainer = document.getElementById('audiotext');

    if (fileInput.files.length > 0) {
        var fileName = fileInput.files[0].name;
        var fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, ""); // Entferne Dateierweiterung

        fileNameContainer.innerHTML = fileNameWithoutExtension;
    } else {
        fileNameContainer.innerHTML = ""; // Leeren, wenn keine Datei ausgewählt ist
    }

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Upload der Datei: ${response.statusText}`);
        }

        switchBodies();

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

    const downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', () => {
        openPopup();
    });


    const speedInput = document.getElementById('speedSlider');
    speedInput.addEventListener('input', () => {
        document.getElementById('speedfeld').value = speedInput.value;
        changeSpeed();
    });


    const volumeInput = document.getElementById('volumeSlider');
    volumeInput.addEventListener('input', () => {
        document.getElementById('volumefeld').value = volumeInput.value;
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

    pfeile = document.getElementById("pfeile");

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
        changeVolume();
    });


    canvas.addEventListener('mousemove', (e) => {
        if (isDraggingH) {
            pitchfeld = document.getElementById("pitchfeld");
            const mouseY = e.clientY - canvas.getBoundingClientRect().top;
            lineY = mouseY - offsetY;
            newPitch = (100 / canvas.height * lineY - 50)/ -4;
            changePitch(newPitch);
            pitchfeld.value = newPitch;
            pfeile.style.top = lineY + 54 + canvas.style.top + "px";
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

    const upButton = document.getElementById('pfeilUp');
    upButton.addEventListener('click', () => {
        pitchUp();
    });

    const downButton = document.getElementById('pfeilDown');
    downButton.addEventListener('click', () => {
        pitchDown();
    });

    // Starte die Animationsschleife für die Visualisierung
    requestAnimationFrame(drawVisualizer);
}

function drawVisualizer() {
    // Hol die Audiodaten vom Analyser
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const speedInput = document.getElementById('speedfeld');
    let speedValue = parseFloat(speedInput.value);
    if (speedInput.value === "" || speedValue < 0 || isNaN(speedValue)) {
        speedValue = 0;
    }

    // Zeichne die Daten auf die Canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    if (player.state === "started" && player.volume !== 0 && speedValue !== 0) {
        canvasCtx.strokeStyle = '#FFBF9B'
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
    }

    if (!isDraggingV && !positionUpdating) {
        const currentTime = Tone.TransportTime().toSeconds();
        const baretime = timedifference + currentTime;
        const time = lasttime + (baretime - lasttime) * speedValue;
        timedifference = timedifference + time - baretime;
        lasttime = time;

        const totalDuration = player.buffer.duration;

        lineX = (100 / totalDuration * time)/100*canvas.width;
    }

    canvasCtx.setLineDash([]);
    canvasCtx.strokeStyle = '#B46060'
    canvasCtx.lineWidth = 4;
    canvasCtx.beginPath();
    canvasCtx.moveTo(lineX, 0);
    canvasCtx.lineTo(lineX, canvas.height);
    canvasCtx.stroke();
    canvasCtx.lineWidth = 1;

    canvasCtx.strokeStyle = '#FFF4E0'
    canvasCtx.setLineDash([5, 5]);
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, lineY);
    canvasCtx.lineTo(canvas.width, lineY);
    canvasCtx.stroke();

    canvasCtx.strokeStyle = '#FFBF9B'
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
        playPauseButton.src = "img/icon_music_play_button.png";
    } else if (player.state === "stopped") {
        Tone.Transport.start();
        changeVolume();
        changeSpeed()
        playPauseButton.src = "img/icon_music_pause_button.png";
    }
}

function backtostart() {
    if (player) {
        Tone.Transport.pause();
        Tone.Transport.seconds = 0;
        timedifference = 0;
        lasttime = 0;
        playPauseButton.src = "img/icon_music_play_button.png";
        document.getElementById('positionSlider').value = 0;
    }
}

function changeSpeed() {
    const speedInput = document.getElementById('speedfeld');
    let speedValue = parseFloat(speedInput.value.replace(/,/g, '.'));
    if (speedInput.value === "" || speedValue < 0 ) {
        speedValue = 0;
    }

    if (!isNaN(speedValue)) {
        if (speedValue <= 4) {
            document.getElementById('speedSlider').value = speedValue;
        } else {
            document.getElementById('speedSlider').value = 4;
        }
        player.playbackRate = speedValue;
        speedInput.classList.remove("fehler");
    } else {
        console.error('Ungültige Geschwindigkeitswert.');
        speedInput.classList.add("fehler");
    }
}

function changeVolume() {
    const volumeInput = document.getElementById('volumefeld');
    let volumeValue = parseFloat(volumeInput.value.replace(/,/g, '.'));
    if (volumeInput.value === "" || volumeValue < 0) {
        volumeValue = 0;
    }

    if (!isNaN(volumeValue)) {
        if (volumeValue <= 5) {
            document.getElementById('volumeSlider').value = volumeValue;
        } else {
            document.getElementById('volumeSlider').value = 5;
        }
        player.volume.value = Tone.gainToDb(volumeValue);
        volumeInput.classList.remove("fehler");
    } else {
        console.error('Ungültige Lautstärkewert.');
        volumeInput.classList.add("fehler");
    }
}

function changePitch() {
    pitchInput = document.getElementById("pitchfeld");
    let newPitch = parseFloat(pitchInput.value.replace(/,/g, '.'));
    if (pitchInput.value === "") {
        newPitch = 0;
    }

    if (!isNaN(newPitch)) {
        pitchShift.pitch = newPitch;
        if (newPitch > 12) {
            lineY = canvas.height/100 * (-4 * 12 + 50);
        } else if (newPitch < -12) {
            lineY = canvas.height/100 * (-4 * -12 + 50);
        } else {
            lineY = canvas.height/100 * (-4 * newPitch + 50);
        }
        pitchInput.classList.remove("fehler");
    } else {
        console.error('Ungültiger Wert für Tonhöhe');
        pitchInput.classList.add("fehler");
    }
}

function pitchUp() {
    pitchfeld = document.getElementById("pitchfeld");
    pitchValue = parseFloat(pitchfeld.value);

    if (pitchValue % 1 === 0) {
        pitchfeld.value = pitchValue + 1;
        changePitch();
    } else {
        pitchfeld.value = Math.ceil(pitchValue);
        changePitch();
    }
}

function pitchDown() {
    pitchfeld = document.getElementById("pitchfeld");
    pitchValue = parseFloat(pitchfeld.value);

    if (pitchValue % 1 === 0) {
        pitchfeld.value = pitchValue -1;
        changePitch();
    } else {
        pitchfeld.value = Math.floor(pitchValue);
        changePitch();
    }
}

function updatePosition() {
    const newPosition = 100/canvas.width*lineX / 100;

    if (!isNaN(newPosition)) {
        player.volume.value = Tone.gainToDb(0);
        const duration = player.buffer.duration;
        Tone.Transport.seconds = newPosition * duration;
        timedifference = 0;
        lasttime = Tone.TransportTime().toSeconds()
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

function switchBodies() {
    var body1 = document.getElementById('body1');
    var body2 = document.getElementById('body2');

    // Überprüfen, welcher Body sichtbar ist und den anderen ausblenden bzw. einblenden
    if (body1.classList.contains('hidden')) {
        body1.classList.remove('hidden');
        body2.classList.add('hidden');
    } else {
        body1.classList.add('hidden');
        body2.classList.remove('hidden');
    }
    switchStylesheet();
}

function switchStylesheet() {
    var currentGlobalStylesheet = document.getElementById('styleglobal');
    var currentIndexStylesheet = document.getElementById('stylestyle');

    // Überprüfen, welches Stylesheet gerade aktiv ist und zum anderen wechseln
    if (currentIndexStylesheet.href.endsWith('style1.css')) {
        currentIndexStylesheet.href = 'index.css';
        currentGlobalStylesheet.href = 'global.css';
    } else {
        currentIndexStylesheet.href = 'style1.css';
        currentGlobalStylesheet.href = 'globals1.css'
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    var files = event.dataTransfer.files;
    document.getElementById('fileInput').files = files;
    uploadAudio();
}

function openPopup() {
    // Hier wird ein Popup mit selbst geschriebenem HTML-Inhalt erstellt.
    var popupContent = "<h2>Download erfolgreich</h2>";

    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    var centerX = (screenWidth - 400) / 2; // 400 ist die Breite des Popups
    var centerY = (screenHeight - 300) / 2; // 300 ist die Höhe des Popups

    // Öffne das Popup mit dem selbst geschriebenen HTML-Inhalt und positioniere es in der Mitte des Bildschirms.
    var popupWindow = window.open('', 'MeinPopup', 'width=300,height=100,left=' + centerX + ',top=' + centerY);
    popupWindow.document.write(popupContent);
}