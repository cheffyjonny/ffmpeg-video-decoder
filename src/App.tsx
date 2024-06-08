import { useState, useRef } from 'react'
import { Wizard } from 'react-use-wizard'
import { AnimatePresence } from 'framer-motion'

import AnimatedStep from './components/AnimatedStep'
import Step from './components/Step'

function App() {
  // Init current step
  const previousStep = useRef<number>(0)

  const [videoURL, setVideoURL] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState('')

  return (
    <>
      <Wizard
        wrapper={
          <AnimatePresence
            initial={false}
            mode='wait'
          />
        }
      >
        {Array(3)
          .fill(null)
          .map((_, index) => {
            return (
              <AnimatedStep
                key={index}
                previousStep={previousStep}
              >
                <Step
                  step={index}
                  fileType={fileType}
                  setFileType={setFileType}
                  userVideoURL={videoURL}
                  setVideoURL={setVideoURL}
                  videoFile={videoFile}
                  setVideoFile={setVideoFile}
                />
              </AnimatedStep>
            )
          })}
      </Wizard>
    </>
  )
}

export default App
