'use client';

import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { ProcessOptions, ScaleMode, ImageFormat } from '@/lib/processors/strategy';
import { PRESETS, Preset } from '@/lib/presets';
import { formatOutputFilename, insertNameToken } from '@/lib/processors/client-worker';
import { computeTargetDimensions } from '@/lib/processors/dimensions';
import { canEncode } from '@/lib/processors/encode';
import { IngestedAsset } from '@/hooks/use-image-pipeline';
import Button from '@zeetools/ui/components/ui/actions/button';
import Slider from '@zeetools/ui/components/ui/forms/slider';
import Switch from '@zeetools/ui/components/ui/forms/switch';
import Kbd from '@zeetools/ui/components/ui/display/kbd';
import ChevronLeftIcon from '@/components/icons/navigation/chevron-left-icon';
import ZapIcon from '@zeetools/ui/components/icons/status/zap-icon';
import ShieldCheckIcon from '@zeetools/ui/components/icons/status/shield-check-icon';
import Input from '@zeetools/ui/components/ui/forms/input';
import Checkbox from '@zeetools/ui/components/ui/forms/checkbox';
import Label from '@zeetools/ui/components/ui/forms/label';
import ChoiceButton from '@/components/shared/ChoiceButton';
import { BODY, FOOTER, SECTION } from '@/lib/card-classes';

interface ConfigStepProps {
  options: ProcessOptions;
  onOptionsChange: (options: Partial<ProcessOptions>) => void;
  assets: IngestedAsset[];
  onBack: () => void;
  onProceedToProcess: () => void;
  isProcessing?: boolean;
}

const SCALE_MODES: { id: ScaleMode; label: string; desc: string }[] = [
  { id: 'percentage', label: 'Scale %', desc: 'Scale by ratio' },
  { id: 'fit-width', label: 'Fit Width', desc: 'Constrain width' },
  { id: 'fit-height', label: 'Fit Height', desc: 'Constrain height' },
  { id: 'exact', label: 'Exact W×H', desc: 'Explicit bounds' },
];

const FORMATS: { id: ImageFormat; label: string; badge: string }[] = [
  { id: 'image/webp', label: 'WebP', badge: 'Recommended' },
  { id: 'image/jpeg', label: 'JPEG', badge: 'Universal' },
  { id: 'image/png', label: 'PNG', badge: 'Lossless' },
  { id: 'image/avif', label: 'AVIF', badge: 'Next-Gen' },
  { id: 'image/x-icon', label: 'ICO', badge: 'Favicon' },
];

const columnTitle = 'text-base font-normal text-foreground';
const fieldLabel = 'text-sm font-normal text-muted';
const valueRow = 'flex items-center justify-between gap-4 text-sm';
const value = 'font-mono tabular-nums text-foreground';

/** Step 2, as the card's content: presets, then the two settings columns, then the naming pattern, all in one scrolling body. */
export default function ConfigStep({
  options,
  onOptionsChange,
  assets,
  onBack,
  onProceedToProcess,
  isProcessing = false,
}: ConfigStepProps) {
  const metadataSwitchId = useId();
  // Most browsers can't encode AVIF from a canvas and would quietly hand back PNGs, so the option is only on
  // where it really works. A batch already set to AVIF moves to WebP, and says so.
  const [avifSupported, setAvifSupported] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    canEncode('image/avif').then((supported) => {
      if (active) setAvifSupported(supported);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (avifSupported === false && options.format === 'image/avif') {
      onOptionsChange({ format: 'image/webp' });
      toast.info("This browser can't encode AVIF, so the batch uses WebP instead.");
    }
  }, [avifSupported, options.format, onOptionsChange]);
  const losslessSwitchId = useId();
  const widthId = useId();
  const heightId = useId();
  const exactWidthId = useId();
  const exactHeightId = useId();
  const patternId = useId();

  const isActivePreset = (preset: Preset) =>
    (Object.entries(preset.options) as [keyof ProcessOptions, unknown][]).every(([k, v]) => options[k] === v);

  const applyPreset = (preset: Preset) => {
    onOptionsChange(preset.options);
  };

  const sampleAsset = assets[0];
  // The preview shows the size these settings would give the first image.
  const previewSize = computeTargetDimensions(sampleAsset?.width || 1920, sampleAsset?.height || 1080, options);
  const previewFilename = sampleAsset
    ? formatOutputFilename(
        sampleAsset.file.name,
        options.filenameTemplate,
        previewSize.width,
        previewSize.height,
        options.format
      )
    : 'example-1920x1080.webp';

  const maintainRatio = (checked: boolean, label: string, onChange: (c: boolean) => void) => (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} />
      <span>{label}</span>
    </label>
  );

  return (
    <>
      <div className={BODY}>
        {/* Quick Presets */}
        <section className={`${SECTION} space-y-4`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className={columnTitle}>Quick Presets</h3>
            <span className="text-sm text-muted">Click to apply instant settings</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
            {PRESETS.map((preset) => (
              <ChoiceButton
                key={preset.id}
                selected={isActivePreset(preset)}
                onClick={() => applyPreset(preset)}
                title={preset.name}
                sub={preset.description}
                className="p-4"
              />
            ))}
          </div>
        </section>

        {/* Main Configuration Grid */}
        <div className="grid border-t border-border @2xl:grid-cols-2">
          {/* Dimensions & Scaling */}
          <section className={`${SECTION} min-w-0 space-y-5`}>
            <h3 className={columnTitle}>Dimensions & Scaling</h3>

            <div role="group" aria-label="Scale mode" className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2">
              {SCALE_MODES.map((m) => (
                <ChoiceButton
                  key={m.id}
                  selected={(options.scaleMode ?? 'percentage') === m.id}
                  onClick={() => onOptionsChange({ scaleMode: m.id })}
                  title={m.label}
                />
              ))}
            </div>

            {options.scaleMode === 'percentage' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className={valueRow}>
                    <span className="text-muted">Scale Factor</span>
                    <span className={value}>{Math.round((options.scale ?? 1.0) * 100)}%</span>
                  </div>
                  <Slider
                    aria-label="Scale Factor"
                    value={[Math.round((options.scale ?? 1.0) * 100)]}
                    min={10}
                    max={200}
                    step={5}
                    onValueChange={([val]) => onOptionsChange({ scale: val / 100 })}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      variant="secondary"
                      onClick={() => onOptionsChange({ scale: pct / 100 })}
                      className="h-10 px-2 tabular-nums"
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {options.scaleMode === 'fit-width' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className={valueRow}>
                    <Label htmlFor={widthId} className={fieldLabel}>Max Width</Label>
                    <span className={value}>{options.width || 1920} px</span>
                  </div>
                  <Input
                    id={widthId}
                    type="number"
                    value={options.width || 1920}
                    onChange={(e) => onOptionsChange({ width: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="h-10 tabular-nums"
                  />
                </div>
                {maintainRatio(options.maintainAspectRatio !== false, 'Maintain original aspect ratio', (c) =>
                  onOptionsChange({ maintainAspectRatio: c })
                )}
              </div>
            )}

            {options.scaleMode === 'fit-height' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className={valueRow}>
                    <Label htmlFor={heightId} className={fieldLabel}>Max Height</Label>
                    <span className={value}>{options.height || 1080} px</span>
                  </div>
                  <Input
                    id={heightId}
                    type="number"
                    value={options.height || 1080}
                    onChange={(e) => onOptionsChange({ height: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="h-10 tabular-nums"
                  />
                </div>
                {maintainRatio(options.maintainAspectRatio !== false, 'Maintain original aspect ratio', (c) =>
                  onOptionsChange({ maintainAspectRatio: c })
                )}
              </div>
            )}

            {options.scaleMode === 'exact' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={exactWidthId} className={fieldLabel}>Target Width (px)</Label>
                    <Input
                      id={exactWidthId}
                      type="number"
                      value={options.width || 1080}
                      onChange={(e) => onOptionsChange({ width: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="h-10 tabular-nums"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={exactHeightId} className={fieldLabel}>Target Height (px)</Label>
                    <Input
                      id={exactHeightId}
                      type="number"
                      value={options.height || 1080}
                      onChange={(e) => onOptionsChange({ height: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="h-10 tabular-nums"
                    />
                  </div>
                </div>
                {maintainRatio(Boolean(options.maintainAspectRatio), 'Fit inside bounding box maintaining ratio', (c) =>
                  onOptionsChange({ maintainAspectRatio: c })
                )}
              </div>
            )}
          </section>

          {/* Format & Compression */}
          <section className={`${SECTION} min-w-0 space-y-5 border-t border-border @2xl:border-t-0 @2xl:border-l`}>
            <h3 className={columnTitle}>Format & Compression</h3>

            <div className="space-y-2">
              <span className={fieldLabel} id={`${patternId}-format`}>Target Format</span>
              <div
                role="group"
                aria-labelledby={`${patternId}-format`}
                className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2"
              >
                {FORMATS.map((f) => {
                  const unavailable = f.id === 'image/avif' && avifSupported === false;
                  return (
                    <ChoiceButton
                      key={f.id}
                      selected={options.format === f.id}
                      onClick={() => onOptionsChange({ format: f.id })}
                      title={f.label}
                      sub={unavailable ? 'Not in this browser' : f.badge}
                      disabled={unavailable}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className={valueRow}>
                <span className="text-muted">Compression Quality</span>
                <span className={value}>{options.quality}%</span>
              </div>
              <Slider
                aria-label="Compression Quality"
                value={[options.quality]}
                min={1}
                max={100}
                step={1}
                disabled={options.lossless && (options.format === 'image/webp' || options.format === 'image/png')}
                onValueChange={([val]) => onOptionsChange({ quality: val })}
              />
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
                <span>Maximum Compression (1%)</span>
                <span>Optimal (82%)</span>
                <span>Max Fidelity (100%)</span>
              </div>
            </div>

            <div className="space-y-5 border-t border-border pt-5">
              {(options.format === 'image/webp' || options.format === 'image/png') && (
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={losslessSwitchId} className="cursor-pointer text-sm font-normal text-foreground">
                      Lossless Encoding
                    </Label>
                    <p className="text-sm leading-relaxed text-muted">Zero compression artifacts, larger file size.</p>
                  </div>
                  <Switch
                    id={losslessSwitchId}
                    checked={Boolean(options.lossless)}
                    onCheckedChange={(checked) => onOptionsChange({ lossless: checked })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor={metadataSwitchId} className="flex cursor-pointer items-center gap-2 text-sm font-normal text-foreground">
                    <ShieldCheckIcon className="size-3.5 text-primary-text" />
                    <span>Strip EXIF & Metadata</span>
                  </Label>
                  <p className="text-sm leading-relaxed text-muted">Removes GPS coordinates, camera model, and timestamps.</p>
                </div>
                <Switch
                  id={metadataSwitchId}
                  checked={options.stripMetadata}
                  onCheckedChange={(checked) => onOptionsChange({ stripMetadata: checked })}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Output Naming Syntax */}
        <section className={`${SECTION} space-y-4 border-t border-border`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Label htmlFor={patternId} className={columnTitle}>Output Naming Pattern</Label>
            <span className="min-w-0 text-sm text-muted">
              Preview:{' '}
              <code className="font-mono text-xs break-all text-foreground">{previewFilename}</code>
            </span>
          </div>

          <Input
            id={patternId}
            type="text"
            value={options.filenameTemplate}
            onChange={(e) => onOptionsChange({ filenameTemplate: e.target.value })}
            className="h-10 font-mono text-xs"
            placeholder="[name]-[width]x[height].[ext]"
          />
          <div className="flex flex-wrap items-center gap-2">
            {[
              { token: '[name]', label: '+ Name' },
              { token: '[width]x[height]', label: '+ WxH' },
              { token: '-optimized', label: '+ -optimized' },
              { token: '.[ext]', label: '+ Ext' },
            ].map(({ token, label }) => (
              <Button
                key={token}
                variant="secondary"
                onClick={() => onOptionsChange({ filenameTemplate: insertNameToken(options.filenameTemplate, token) })}
                className="font-mono text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </section>
      </div>

      {/* Action Navigation Bar */}
      <div className={FOOTER}>
        <Button variant="secondary" className="h-10 px-4" onClick={onBack} disabled={isProcessing}>
          <ChevronLeftIcon className="size-4" />
          <span>Back to Ingest</span>
        </Button>

        <div className="flex items-center justify-between gap-4 @min-[34rem]:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-muted @max-[40rem]:hidden">
            <span>Press</span>
            <Kbd hotkey="mod+enter" />
            <span>to start</span>
          </div>
          <Button
            variant="primary"
            className="h-10 px-4 @max-[34rem]:flex-1"
            onClick={onProceedToProcess}
            disabled={isProcessing || assets.length === 0}
          >
            <ZapIcon className="size-4" />
            <span>Process {assets.length} Images</span>
          </Button>
        </div>
      </div>
    </>
  );
}
