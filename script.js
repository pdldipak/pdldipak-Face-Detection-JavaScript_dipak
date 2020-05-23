// To get video 
const video = document.getElementById('video')

Promise.all([
  // to detect in realtime 
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  // to register different part of face 
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  // api to recognize where the face
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  //to recognize the mood(happy, sad, etc )
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  //for gender 
  faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(startVideo)

// Function to get video 
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  video.width = 720
  video.height = 560
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    // console.log(detections)
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    faceapi.draw.drawAgeAndGender(resizedDetections.forEach(result => {
      const { age, gender, genderProbability } = result
      new faceapi.draw.DrawTextField(
        [
          `Age: ${faceapi.round(age, 0)} years`,
          `Gender: ${gender.toUpperCase()}`,
          `Probability: (${faceapi.round(genderProbability)})`
        ],
        result.detection.box.bottomRight
      ).draw(canvas)
    }))
  }, 1000)
})
