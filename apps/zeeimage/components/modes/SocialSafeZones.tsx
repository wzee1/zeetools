'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Dropzone from '@/components/zee-ui/dropzone';
import Button from '@zeetools/ui/components/ui/actions/button';
import { Card } from '@zeetools/ui/components/ui/display/card';
import PageHeader from '@zeetools/ui/components/brand/page-header';
import BookmarkIcon from '@zeetools/ui/components/icons/status/bookmark-icon';
import HeartIcon from '@zeetools/ui/components/icons/status/heart-icon';
import CameraIcon from '@zeetools/ui/components/icons/media/camera-icon';
import MessageIcon from '@zeetools/ui/components/icons/media/message-icon';
import SearchIcon from '@zeetools/ui/components/icons/navigation/search-icon';
import SendIcon from '@zeetools/ui/components/icons/actions/send-icon';
import ChoiceButton from '@/components/shared/ChoiceButton';
import { CARD, FOOTER, SECTION } from '@/lib/card-classes';
import Slider from '@zeetools/ui/components/ui/forms/slider';
import DownloadIcon from '@zeetools/ui/components/icons/actions/download-icon';
import RefreshIcon from '@zeetools/ui/components/icons/actions/refresh-icon';
import { downloadBlob } from '@zeetools/ui/lib/export';
import Segmented from '@zeetools/ui/components/ui/navigation/segmented';
import Stagger from '@zeetools/ui/components/motion/stagger';
import StaggerItem from '@zeetools/ui/components/motion/stagger-item';
import { cn } from '@zeetools/ui/lib/utils';

type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';
type SocialPlatform = 'tiktok' | 'reels' | 'none';

interface RatioConfig {
  label: string;
  w: number;
  h: number;
  ratio: number;
}

const RATIOS: Record<AspectRatio, RatioConfig> = {
  '9:16': { label: '9:16 (Story / Reels / TikTok)', w: 1080, h: 1920, ratio: 9 / 16 },
  '1:1': { label: '1:1 (Square)', w: 1080, h: 1080, ratio: 1 },
  '4:5': { label: '4:5 (Portrait Feed)', w: 1080, h: 1350, ratio: 4 / 5 },
  '16:9': { label: '16:9 (Landscape)', w: 1920, h: 1080, ratio: 16 / 9 },
};

export default function SocialSafeZones() {
  const [file, setFile] = useState<File | null>(null);
  const [aspect, setAspect] = useState<AspectRatio>('9:16');
  const [platform, setPlatform] = useState<SocialPlatform>('tiktok');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75); // 0 - 100
  const [zoom, setZoom] = useState<number>(100); // 100 - 300%
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    if (!imageUrl) {
      imgRef.current = null;
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imgRef.current = img;
    };

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleExportCropped = async () => {
    if (!imgRef.current || !frameRef.current) return;
    const img = imgRef.current;
    // The pan is in screen pixels of the preview frame; the frame has the target's aspect ratio, so one factor maps both axes.
    const frameWidth = frameRef.current.clientWidth;
    const target = RATIOS[aspect];

    const outCanvas = document.createElement('canvas');
    outCanvas.width = target.w;
    outCanvas.height = target.h;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate crop projection
    const scale = (zoom / 100);
    // Base fit: cover
    const scaleCover = Math.max(target.w / img.width, target.h / img.height);
    const drawW = img.width * scaleCover * scale;
    const drawH = img.height * scaleCover * scale;

    const toOutput = target.w / frameWidth;
    const drawX = (target.w - drawW) / 2 + pan.x * toOutput;
    const drawY = (target.h - drawH) / 2 + pan.y * toOutput;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    outCanvas.toBlob((blob) => {
      if (blob) {
        const base = file ? file.name.replace(/\.[^/.]+$/, '') : 'framed';
        downloadBlob(blob, `${base}-${target.w}x${target.h}.webp`);
      }
    }, 'image/webp', 0.88);
  };

  const overlay = 'pointer-events-none absolute inset-0 flex flex-col justify-between p-[5cqw] text-white';
  // The safe-area hint: a neutral white dashed line, the label unchanged.
  const hint = 'rounded-control border border-dashed border-white/60 p-[2.5cqw] text-center text-[3.1cqw] font-semibold text-white/80';

  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader title="Social Safe-Zones & Framing">
        Drag, zoom, and frame your asset against real TikTok & Reels UI overlays so captions and interactive action icons never obscure your key subject.
      </PageHeader>

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className={CARD}>
          {!file && (
            <Dropzone
              onFiles={(files) => files[0] && setFile(files[0])}
              multiple={false}
              hint="Drop an image to inspect and position within social UI safe margins"
            />
          )}

          {file && (
            <>
              <div className="flex flex-col shell:min-h-0 shell:flex-1 shell:overflow-y-auto shell:flex-row @min-[44rem]:flex-row">
                {/* Controls Column */}
                <section className={`${SECTION} shrink-0 space-y-6 border-b border-border shell:w-64 shell:overflow-y-auto shell:border-r shell:border-b-0 @min-[44rem]:w-80 @min-[44rem]:overflow-y-auto @min-[44rem]:border-r @min-[44rem]:border-b-0`}>
                  <h3 className="text-base font-normal text-foreground">Framing Controls</h3>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <span id="social-ratio" className="text-sm text-muted">Aspect Ratio</span>
                    <div role="group" aria-labelledby="social-ratio" className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2">
                      {(Object.keys(RATIOS) as AspectRatio[]).map((r) => (
                        <ChoiceButton
                          key={r}
                          selected={aspect === r}
                          onClick={() => setAspect(r)}
                          title={r}
                          sub={`${RATIOS[r].w}×${RATIOS[r].h}`}
                          mono
                        />
                      ))}
                    </div>
                  </div>

                  {/* Platform UI Overlay */}
                  <div className="space-y-2">
                    <span className="text-sm text-muted">UI Safe-Zone Overlay</span>
                    <Segmented<SocialPlatform>
                      aria-label="UI safe-zone overlay"
                      value={platform}
                      onChange={setPlatform}
                      options={[
                        { id: 'tiktok', label: 'TikTok' },
                        { id: 'reels', label: 'Reels' },
                        { id: 'none', label: 'None' },
                      ]}
                    />
                  </div>

                  {/* Overlay Opacity */}
                  {platform !== 'none' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Overlay Opacity</span>
                        <span className="font-mono tabular-nums text-foreground">{overlayOpacity}%</span>
                      </div>
                      <Slider
                        aria-label="Overlay Opacity"
                        value={[overlayOpacity]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={([val]) => setOverlayOpacity(val)}
                      />
                    </div>
                  )}

                  {/* Zoom Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Scale / Zoom</span>
                      <span className="font-mono tabular-nums text-foreground">{zoom}%</span>
                    </div>
                    <Slider
                      aria-label="Scale / Zoom"
                      value={[zoom]}
                      min={100}
                      max={250}
                      step={2}
                      onValueChange={([val]) => setZoom(val)}
                    />
                  </div>
                </section>

                {/* Interactive Canvas Viewport */}
                <div className="flex min-w-0 flex-col shell:min-h-0 shell:flex-1 @min-[44rem]:min-h-0 @min-[44rem]:flex-1">
                  <p className="px-5 pt-5 text-sm text-muted sm:px-8">
                    Click and drag image to adjust safe framing position
                  </p>

                  {/* On desktop this is a size container: the frame below is sized from what is left, so it never overflows. */}
                  <div className="flex flex-1 items-center justify-center p-5 sm:p-8 @max-[44rem]:min-h-72 shell:[container-type:size]">
                    <div
                      ref={frameRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className={cn(
                        'relative shrink-0 cursor-grab overflow-hidden rounded-control border border-border-strong bg-black select-none [container-type:inline-size] active:cursor-grabbing',
                        aspect === '9:16' && 'aspect-[9/16] w-80 max-w-full shell:w-[min(100cqw,calc(100cqh*9/16))] shell:max-w-none',
                        aspect === '1:1' && 'aspect-square w-full max-w-90 shell:w-[min(100cqw,100cqh)] shell:max-w-none',
                        aspect === '4:5' && 'aspect-[4/5] w-80 max-w-full shell:w-[min(100cqw,calc(100cqh*4/5))] shell:max-w-none',
                        aspect === '16:9' && 'aspect-video w-full max-w-120 shell:w-[min(100cqw,calc(100cqh*16/9))] shell:max-w-none'
                      )}
                    >
                      {/* Image Layer */}
                      {imageUrl && (
                        <div
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                          style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                            transition: isDragging ? 'none' : 'transform 100ms ease-out',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- blob: of a local file; next/image cannot optimise it in a static export */}
                          <img
                            src={imageUrl}
                            decoding="async"
                            alt="Framed"
                            className="max-h-full max-w-full object-cover size-full"
                          />
                        </div>
                      )}

                      {/* TikTok UI Overlay Simulation (sized in container units, so it scales with the frame) */}
                      {platform === 'tiktok' && aspect === '9:16' && (
                        <div className={overlay} style={{ opacity: overlayOpacity / 100 }}>
                          {/* Top Bar */}
                          <div className="flex items-center justify-between pt-[2cqw] text-[3.8cqw] font-medium">
                            <span className="opacity-70">Following | For You</span>
                            <span className="flex size-[7.5cqw] items-center justify-center rounded-control bg-white/20">
                              <SearchIcon className="size-[4.5cqw]" />
                            </span>
                          </div>

                          {/* Center safe zone border hint */}
                          <div className={hint}>Safe Action Area</div>

                          {/* Bottom & Right Elements */}
                          <div className="flex items-end justify-between pb-[3cqw]">
                            <div className="max-w-[59cqw] space-y-[1.5cqw] text-[3.4cqw]">
                              <div className="flex items-center gap-1 font-semibold">@creator_username</div>
                              <div className="line-clamp-2 text-[3.1cqw] opacity-80">
                                Title caption and hashtags stay here in the safe zone #trending
                              </div>
                              <div className="text-[2.8cqw] opacity-70">♫ Original Sound - Artist</div>
                            </div>

                            <div className="flex flex-col items-center gap-[3cqw]">
                              <div className="size-[10cqw] rounded-control border border-white bg-white/30" />
                              <div className="flex flex-col items-center gap-[0.5cqw]">
                                <HeartIcon className="size-[5cqw]" />
                                <span className="text-[2.8cqw]">48.2K</span>
                              </div>
                              <div className="flex flex-col items-center gap-[0.5cqw]">
                                <MessageIcon className="size-[5cqw]" />
                                <span className="text-[2.8cqw]">1.2K</span>
                              </div>
                              <div className="flex flex-col items-center gap-[0.5cqw]">
                                <BookmarkIcon className="size-[5cqw]" />
                                <span className="text-[2.8cqw]">340</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instagram Reels UI Overlay Simulation */}
                      {platform === 'reels' && aspect === '9:16' && (
                        <div className={overlay} style={{ opacity: overlayOpacity / 100 }}>
                          <div className="flex items-center justify-between pt-[2cqw] text-[3.8cqw] font-semibold">
                            <span>Reels</span>
                            <CameraIcon className="size-[5cqw]" />
                          </div>

                          <div className={hint}>Reels Safe Focus</div>

                          <div className="flex items-end justify-between pb-[3cqw]">
                            <div className="space-y-[1.5cqw] text-[3.4cqw]">
                              <div className="font-semibold">@instagram_handle</div>
                              <div className="text-[3.1cqw] opacity-80">Reels description overlay area</div>
                            </div>
                            <div className="flex flex-col items-center gap-[3cqw]">
                              <HeartIcon className="size-[5cqw]" />
                              <MessageIcon className="size-[5cqw]" />
                              <SendIcon className="size-[5cqw]" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={FOOTER}>
                <Button variant="secondary" className="h-10 px-4" onClick={() => setFile(null)}>
                  <RefreshIcon />
                  <span>Choose Another Image</span>
                </Button>
                <Button variant="primary" className="h-10 px-4" onClick={handleExportCropped}>
                  <DownloadIcon />
                  <span>Export Safe-Zone Crop</span>
                </Button>
              </div>
            </>
          )}
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
