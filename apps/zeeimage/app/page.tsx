'use client';

import { Suspense, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useImagePipeline } from '@/hooks/use-image-pipeline';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useZipExporter } from '@/hooks/use-zip-exporter';
import { usePublishBatchCount } from '@/hooks/use-batch-count';
import { parseMode } from '@/lib/modes';
import BatchPipeline from '@/components/steps/BatchPipeline';
import FaviconGenerator from '@/components/modes/FaviconGenerator';
import SocialSafeZones from '@/components/modes/SocialSafeZones';
import { DropzoneHandle } from '@/components/zee-ui/dropzone';

// Same curve out as in: the incoming view staggers itself in (see Stagger in @zeetools/ui).
const exit = { opacity: 0, y: -6, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const } };

/** The mode lives in the URL (`?mode=`); the pipeline state lives here, so it survives a switch of mode. */
function HomeView() {
  const currentMode = parseMode(useSearchParams().get('mode'));
  const dropzoneRef = useRef<DropzoneHandle>(null);

  const pipeline = useImagePipeline();
  const { activeStep, setActiveStep, assets, options, isProcessing, results, startBatchProcessing } = pipeline;

  const { exportZip } = useZipExporter();
  // The sidebar shows how many images are queued (a number only; nothing is stored).
  usePublishBatchCount(assets.length);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onOpenFilePicker: () => {
      if (currentMode === 'batch') {
        dropzoneRef.current?.openPicker();
      }
    },
    onConfirmAndProcess: () => {
      if (currentMode === 'batch') {
        if (activeStep === 1 && assets.length > 0) {
          setActiveStep(2);
        } else if (activeStep === 2 && assets.length > 0 && !isProcessing) {
          startBatchProcessing();
        }
      }
    },
    onDownloadZip: () => {
      if (currentMode === 'batch' && activeStep === 4 && results.length > 0) {
        exportZip(results, options, `zeeimage-optimized-${Date.now()}.zip`);
      }
    },
    onStepJump: (step) => {
      if (currentMode === 'batch') {
        if (step === 1) setActiveStep(1);
        if (step === 2 && assets.length > 0) setActiveStep(2);
        if (step === 3 && results.length > 0) setActiveStep(3);
        if (step === 4 && results.length > 0) setActiveStep(4);
      }
    },
  });

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={currentMode} exit={exit} className="flex flex-col shell:min-h-0 shell:flex-1">
        {currentMode === 'batch' && <BatchPipeline pipeline={pipeline} dropzoneRef={dropzoneRef} />}
        {currentMode === 'favicon' && <FaviconGenerator />}
        {currentMode === 'social' && <SocialSafeZones />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-5 py-10 selection:bg-primary/25 sm:px-10 sm:py-12 shell:min-h-0 shell:flex-1">
      {/* useSearchParams needs a boundary for the static render; the view renders once the URL is known. */}
      <Suspense>
        <HomeView />
      </Suspense>
    </main>
  );
}
