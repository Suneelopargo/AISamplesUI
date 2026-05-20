import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import Webcam from 'react-webcam'

function AIScannerPage() {
  const webcamRef = useRef(null)
  const recognitionRef = useRef(null)

  const [file, setFile] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [listening, setListening] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    idNumber: '',
    phoneNumber: ''
  })

  const scanImage = async (imageFile) => {
    try {
      setLoading(true)

      const data = new FormData()
      data.append('file', imageFile)

      const response = await axios.post('https://ssapplications-hfc4fpbzh9enf7dr.southindia-01.azurewebsites.net/api/id/scan', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setFormData(response.data)

      setTimeout(() => {
        setPreviewOpen(false)
        setCameraOpen(false)
      }, 1500)
    } catch (error) {
      console.error(error)
      alert('Failed to scan ID card')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select ID card image')
      return
    }

    await scanImage(file)
  }

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot()

    if (!imageSrc) {
      alert('Failed to capture image')
      return
    }

    setCapturedImage(imageSrc)
    setPreviewOpen(true)

    setTimeout(async () => {
      try {
        const blob = await fetch(imageSrc).then((res) => res.blob())
        const imageFile = new File([blob], 'camera-capture.jpg', {
          type: 'image/jpeg'
        })

        await scanImage(imageFile)
      } catch (error) {
        console.error(error)
        alert('Failed to process image')
      }
    }, 300)
  }

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let finalTranscript = ''

    recognition.start()
    setListening(true)

    recognition.onresult = (event) => {
      let transcript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        }
      }

      console.log('Current Speech:', transcript)
    }

    recognition.onend = async () => {
      console.log('Final Transcript:', finalTranscript)

      setListening(false)

      if (!finalTranscript.trim()) {
        return
      }

      try {
        setLoading(true)

        const response = await axios.post('https://ssapplications-hfc4fpbzh9enf7dr.southindia-01.azurewebsites.net/api/voice/extract', {
          transcript: finalTranscript
        })

        console.log('AI Extracted:', response.data)
        setFormData(response.data)
      } catch (error) {
        console.error(error)
        alert('Failed to process voice input')
      } finally {
        setLoading(false)
      }
    }

    recognition.onerror = (event) => {
      console.error(event)
      setListening(false)
      alert('Voice recognition failed')
    }
  }

  return (
    <>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-10">AI ID Card Scanner</h1>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upload or Scan ID Card</h2>

            <div className="border rounded-xl p-5 mb-6">
              <label className="font-medium">Upload ID Card</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-3 w-full"
              />

              <button
                onClick={handleFileUpload}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full mt-4"
              >
                {loading ? 'Scanning...' : 'Upload & Scan'}
              </button>
            </div>

            <div className="border rounded-xl p-5">
              <button
                onClick={() => setCameraOpen(!cameraOpen)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
              >
                {cameraOpen ? 'Close Camera' : 'Open Camera'}
              </button>

              {cameraOpen && (
                <div className="mt-6">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-xl border w-full"
                    videoConstraints={{
                      facingMode: 'environment'
                    }}
                  />

                  <button
                    onClick={capturePhoto}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg w-full mt-4"
                  >
                    {loading ? 'Reading ID Card...' : 'Capture & Scan'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={startVoiceRecognition}
              className={`mb-6 px-6 py-3 rounded-lg text-white w-full ${
                listening ? 'bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {listening ? 'Listening... Speak Now' : 'Fill Form Using Voice'}
            </button>

            <h2 className="text-2xl font-semibold mb-4">Extracted Details</h2>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fullName: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="DOB"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dob: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phoneNumber: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="ID Number"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idNumber: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    addressLine1: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    city: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pincode: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country: e.target.value
                  })
                }
                className="border p-3 rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {previewOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999999]">
            <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center">ID Card Preview</h2>

              <img src={capturedImage} alt="Captured Preview" className="rounded-xl border w-full" />

              <div className="mt-5 text-center">
                {loading ? (
                  <div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>

                    <p className="text-blue-600 font-semibold">Reading ID card using AI...</p>
                  </div>
                ) : (
                  <p className="text-green-600 font-semibold">Scan completed</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default AIScannerPage
