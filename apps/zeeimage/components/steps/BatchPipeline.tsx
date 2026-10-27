'use client';

import { AnimatePresence, motion } from 'motion/react';
import PageHeader from '@zeetools/ui/components/brand/page-header';
import Stagger from '@zeetools/ui/components/motion/stagger';
import StaggerItem from '@zeetools/ui/components/motion/stagger-item';
import { Card } from '@zeetools/ui/components/ui/display/card';
import type { useImagePipeline } from '@/hooks/use-image-pipeline';
import type { DropzoneHandle } from '@/components/zee-ui/dropzone';
import Stepper from '@/components/shared/Stepper';
import IngestStep from '@/components/steps/IngestStep';
import ConfigStep from '@/components/steps/ConfigStep';
import ProcessStep from '@/components/steps/ProcessStep';
import ExportStep from '@/components/steps/ExportStep';
import { CARD } from '@/lib/card-classes';

const STEPS = [
  { id: 1, label: 'Ingest', desc: 'Drag & drop assets' },
  { id: 2, label: 'Configure', desc: 'Scale, format & rules' },
  { id: 3, label: 'Inspect & Batch', desc: 'Worker concurrency' },
  { id: 4, label: 'Export', desc: 'ZIP bundle & save' },
];

const ease = [0.32, 0.72, 0, 1] as const;

interface BatchPipelineProps {
  pipeline: ReturnType<typeof useImagePipeline>;
  dropzoneRef: React.RefObject<DropzoneHandle | null>;
}

/**
 * The batch mode: one card whose header row is the stepper and whose body is the current step. Each step is
 * the flex-1 surface (a dropzone, a queue, a config body or a table) plus its own footer row.
 */
export default function BatchPipeline({ pipeline, dropzoneRef }: BatchPipelineProps) {
  const {
    activeStep,
    setActiveStep,
    assets,
    addFiles,
    removeAsset,
    clearAssets,
    options,
    updateOptions,
    isProcessing,
    progress,
    results,
    startBatchProcessing,
  } = pipeline;

  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader title="Batch Pipeline">
        Local-first, privacy-focused batch image transformation suite. All scaling, format conversions, and metadata stripping occur inside browser Web Workers. Your images never leave your device.
      </PageHeader>

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className={CARD}>
          <div className="border-b border-border px-5 py-5 sm:px-8">
            <Stepper
              steps={STEPS}
              activeStep={activeStep}
              onSelect={setActiveStep}
              isAccessible={(id) => id === 1 || (id === 2 && assets.length > 0) || (id >= 3 && results.length > 0)}
            />
          </div>

          {/* Steps swap like views: the old one fades up and out, the new one settles in. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.2, ease } }}
              className="flex flex-col shell:min-h-0 shell:flex-1"
            >
              {activeStep === 1 && (
                <IngestStep
                  assets={assets}
                  onAddFiles={addFiles}
                  onRemoveAsset={removeAsset}
                  onClearAssets={clearAssets}
                  onProceedToConfig={() => setActiveStep(2)}
                  dropzoneRef={dropzoneRef}
                />
              )}

              {activeStep === 2 && (
                <ConfigStep
                  options={options}
                  onOptionsChange={updateOptions}
                  assets={assets}
                  onBack={() => setActiveStep(1)}
                  onProceedToProcess={startBatchProcessing}
                  isProcessing={isProcessing}
                />
              )}

              {activeStep === 3 && (
                <ProcessStep
                  assets={assets}
                  results={results}
                  isProcessing={isProcessing}
                  progress={progress}
                  onProceedToExport={() => setActiveStep(4)}
                />
              )}

              {activeStep === 4 && (
                <ExportStep
                  results={results}
                  options={options}
                  onReset={() => {
                    clearAssets();
                    setActiveStep(1);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
