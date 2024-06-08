import { motion, Variants } from 'framer-motion'
import React, { memo, useEffect } from 'react'
import { useWizard } from 'react-use-wizard'

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 800 : -800,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 800 : -800,
    opacity: 0,
  }),
}

type Props = {
  previousStep: React.MutableRefObject<number>
  children: React.ReactNode
}

const AnimatedStep = memo(({ children, previousStep }: Props) => {
  const { activeStep } = useWizard()

  useEffect(() => {
    return () => {
      previousStep.current = activeStep
    }
  }, [activeStep, previousStep])

  return (
    <motion.div
      custom={activeStep - previousStep.current}
      variants={variants}
      initial='enter'
      animate='center'
      exit='exit'
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
})

export default AnimatedStep
