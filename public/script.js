document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('selfieVideo');
    const recordButton = document.getElementById('recordButton');
    const stopButton = document.getElementById('stopButton');
    const playButton = document.getElementById('playButton');
    const uploadButton = document.getElementById('uploadButton');
    const progressBar = document.getElementById('progressBar');
    const fileSizeDisplay = document.getElementById('fileSize');
    const timerDisplay = document.getElementById('timer');

    let mediaRecorder;
    let recordedChunks = [];

    let recordingTimeout;
    let timerInterval;

    // Get user media and set up the video element
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.onstart = function () {
                if (video.srcObject === null) {
                    video.srcObject = stream;
                }
            }

            mediaRecorder.ondataavailable = function (event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = function () {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const fileSize = (blob.size / (1024 * 1024)).toFixed(2); // Convert to MB
                fileSizeDisplay.innerText = `File Size: ${fileSize} MB`;
            };
        })
        .catch(function (error) {
            console.error('Error accessing camera:', error);
        });

    // Start recording when the record button is clicked
    recordButton.addEventListener('click', function () {
        recordedChunks = [];
        mediaRecorder.start();

        enableButtonsOnRecording();
        startTimer();

        // Set a timeout to stop recording after 20 seconds
        recordingTimeout = setTimeout(function () {
            stopButton.click();
        }, 20000);
    });

    // Stop recording when the stop button is clicked
    stopButton.addEventListener('click', function () {
        enableButtonsAfterRecord();
        stopTimer();
        clearTimeout(recordingTimeout);
        mediaRecorder.stop();
    });

    // Play the recorded video when the play button is clicked
    playButton.addEventListener('click', function () {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        video.srcObject = null;
        video.src = videoURL;
    });

    // Upload the recorded video when the upload button is clicked
    uploadButton.addEventListener('click', function () {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });

        const formData = new FormData();
        formData.append('video', blob, 'recorded-video.webm');

        axios.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: function (progressEvent) {
                const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
                progressBar.value = percentComplete;
            },
        })
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.error('Error uploading video:', error);
            });
    });

    // Set the correct disabled state for buttons when recording is in progress
    function enableButtonsOnRecording() {
        recordButton.disabled = true;
        stopButton.disabled = false;
    }

    // Set the correct disabled state for buttons when recording is in done
    function enableButtonsAfterRecord() {
        recordButton.disabled = false;
        stopButton.disabled = true;
        playButton.disabled = false;
        uploadButton.disabled = false;
    }

    // To display the timer
    function startTimer() {
        let timing = 0;
        timerInterval = setInterval(function () {
            timing += 1;
            timerDisplay.innerText = `${timing}s`;
        }, 1000);
    }

    // To clean the interval and timer
    function stopTimer() {
        clearInterval(timerInterval);
        timerDisplay.innerText = ``;
    }
});
