import { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import { useWizard } from 'react-use-wizard'

type StepProps = {
  step: number
  fileType: string
  setFileType: (type: string) => void
  userVideoURL: string
  setVideoURL: (type: string) => void
  videoFile: File | null
  setVideoFile: (file: File | null) => void
}

const Step = ({
  step,
  fileType,
  setFileType,
  userVideoURL,
  setVideoURL,
  videoFile,
  setVideoFile,
}: StepProps) => {
  const Step1 = () => {
    const { nextStep } = useWizard()

    const handleClick = (type: string) => {
      setFileType(type)
      nextStep()
    }

    return (
      <div style={{ minWidth: '320px' }}>
        <p>Choose the type of the video file to upload</p>

        <div className='w-full flex gap-3 mt-5'>
          <button
            className='w-1/2'
            onClick={() => handleClick('url')}
          >
            URL
          </button>
          <button
            className='w-1/2'
            onClick={() => handleClick('file')}
          >
            File
          </button>
        </div>
      </div>
    )
  }

  const Step2 = () => {
    const { handleStep, previousStep, nextStep } = useWizard()
    const [inputVal, setInputVal] = useState('')

    handleStep(() => {
      setVideoURL(inputVal)
    })

    const handlePreviousStep = () => {
      setVideoURL('')
      setVideoFile(null)
      previousStep()
    }

    return fileType === 'file' ? (
      // With FILE uploader
      <div style={{ minWidth: '320px' }}>
        {/* Display the uploaded file name */}
        {videoFile ? (
          <p>Selected file: {videoFile.name}</p>
        ) : (
          <input
            type='file'
            id='video'
            onChange={(e) => setVideoFile(e.target.files?.item(0) || null)}
          />
        )}

        <div className='w-full flex gap-3 mt-5'>
          <button
            className='w-1/2'
            onClick={handlePreviousStep}
          >
            Previous
          </button>
          <button
            disabled={!videoFile}
            className='w-1/2'
            onClick={nextStep}
          >
            Next
          </button>
        </div>
      </div>
    ) : (
      // with URL input
      <div style={{ minWidth: '320px' }}>
        <input
          className='w-full p-2'
          type='text'
          placeholder='Enter URL'
          onChange={(event) => setInputVal(event.target.value)}
        />
        <div className='w-full flex gap-3 mt-5'>
          <button
            className='w-1/2'
            onClick={previousStep}
          >
            Previous
          </button>
          <button
            disabled={!inputVal}
            className='w-1/2'
            onClick={nextStep}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  const Step3 = () => {
    const { goToStep } = useWizard()
    const [hasError, setHasError] = useState(false)
    const ffmpegRef = useRef(new FFmpeg())
    const messageRef = useRef<HTMLParagraphElement | null>(null)
    const prevUserUrlRef = useRef<string | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const handleBackHome = () => {
      setVideoURL('')
      setVideoFile(null)
      goToStep(0)
    }

    useEffect(() => {
      // Video link examples
      // https://www.shutterstock.com/shutterstock/videos/1109740799/preview/stock-footage-big-data-technology-and-data-science-abstract-background-data-scientist-querying-analysing-and.webm
      // https://www.shutterstock.com/shutterstock/videos/1106848677/preview/stock-footage-cloud-computing-for-data-storage-and-transfer-for-safety-cloud-icon-with-data-icon-on-the.webm
      // https://www.shutterstock.com/shutterstock/videos/1104517913/preview/stock-footage-futuristic-chat-ai-user-interface-in-action-artificial-intelligence-system-chatting-with-a-bot.webm

      const loadFFmpeg = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
        const ffmpeg = ffmpegRef.current
        ffmpeg.on('progress', ({ progress, time }) => {
          if (messageRef.current) {
            messageRef.current.innerHTML = `${(progress * 100).toFixed(
              2
            )} % (Elapsed Time: ${(time / 1000000).toFixed(2)} s)`
          }
        })

        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            'text/javascript'
          ),
        })
      }

      const fetchVideo = async () => {
        const videoURL = userVideoURL
        const ffmpeg = ffmpegRef.current

        if (prevUserUrlRef.current !== userVideoURL) {
          prevUserUrlRef.current = userVideoURL
          try {
            await ffmpeg.writeFile('input.webm', await fetchFile(videoURL))
            await ffmpeg.exec(['-i', 'input.webm', 'output.mp4'])
            const fileData = await ffmpeg.readFile('output.mp4')
            const data = new Uint8Array(fileData as ArrayBuffer)
            if (videoRef.current) {
              videoRef.current.src = URL.createObjectURL(
                new Blob([data.buffer], { type: 'video/mp4' })
              )
            }
          } catch (e: any) {
            setHasError(true)
            console.error(e)
          } finally {
          }
        }
      }

      const loadFFmpegAndFetchVideo = async () => {
        await loadFFmpeg()
        await fetchVideo()
      }

      // Only executes with userVideoURL, on the other hand, it just renders the video player with the uploaded file.
      userVideoURL && loadFFmpegAndFetchVideo()
    }, [userVideoURL])

    return (
      <div style={{ minWidth: '320px' }}>
        {videoFile ? (
          <video
            src={URL.createObjectURL(videoFile)}
            controls
          ></video>
        ) : (
          <>
            <video
              ref={videoRef}
              controls
            ></video>
            <p ref={messageRef}></p>
          </>
        )}
        {hasError && (
          <p>Something went wrong. Please try again with a valid URL.</p>
        )}
        <div className='w-full flex gap-3 mt-5'>
          <button
            className='w-full'
            onClick={handleBackHome}
          >
            Back home
          </button>
        </div>
      </div>
    )
  }

  // Conditional rendering based on the current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step1 />
      case 1:
        return <Step2 />
      case 2:
        return <Step3 />
      default:
        return <div>Invalid step</div>
    }
  }

  return <div>{renderStep()}</div>
}

export default Step
