'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Dropzone from '@/components/zee-ui/dropzone';
import Button from '@zeetools/ui/components/ui/actions/button';
import { Card } from '@zeetools/ui/components/ui/display/card';
import PageHeader from '@zeetools/ui/components/brand/page-header';
import {
  BadgeCheck,
  Bookmark,
  ChevronDown,
  Equal,
  Forward,
  Heart,
  House,
  MessageCircle,
  MessageSquare,
  Plus,
  Repeat2,
  Search,
  Send,
  SlidersHorizontal,
  Tv,
  User,
  Users,
} from 'lucide-react';
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

  // The overlays copy the apps' own layout: positions are fractions of a phone screen (top/bottom in % of the
  // frame's height), sizes are in container units, so they scale with the frame.
  const overlay =
    'pointer-events-none absolute inset-0 text-white [text-shadow:0_0.3cqw_0.8cqw_rgb(0_0_0/0.4)] [&_svg]:drop-shadow-[0_0.3cqw_0.6cqw_rgb(0_0_0/0.35)]';
  // The safe zone: the rectangle no app UI covers, where faces, products and text should go.
  const safeZone = 'absolute rounded-[2cqw] border border-dashed border-white/70';
  const safeLabel = 'absolute top-[1.5cqw] left-[2cqw] text-[2.6cqw] font-semibold text-white/80';
  const shade = 'absolute inset-x-0 bottom-0 h-[32%] bg-linear-to-t from-black/45 to-transparent';

  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader title="Social Safe-Zones & Framing">
        Drag, zoom, and frame your asset against real TikTok & Reels UI overlays so captions and interactive action icons never obscure your key subject. Your image stays on your device.
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

                      {/* TikTok For You feed, as on a phone: tabs on top, the action rail, caption, progress bar, tab bar */}
                      {platform === 'tiktok' && aspect === '9:16' && (
                        <div className={overlay} style={{ opacity: overlayOpacity / 100 }}>
                          <div className={shade} />

                          <div className={cn(safeZone, 'top-[8.5%] right-[16cqw] bottom-[18%] left-[4cqw]')}>
                            <span className={safeLabel}>Safe zone</span>
                          </div>

                          <div className="absolute inset-x-[3cqw] top-[3.7%] flex -translate-y-1/2 items-center justify-between">
                            <span className="relative flex size-[7cqw] items-center justify-center">
                              <Tv className="size-full" strokeWidth={1.75} />
                              <span className="absolute top-[55%] -translate-y-1/2 text-[1.5cqw] font-extrabold tracking-tight">LIVE</span>
                            </span>
                            <div className="flex items-center gap-[3cqw] text-[3.6cqw] font-semibold">
                              <span className="text-white/70">Community</span>
                              <span className="text-white/70">Following</span>
                              <span className="text-white/70">Shop</span>
                              <span className="relative">
                                For You
                                <span className="absolute -bottom-[1.8cqw] left-1/2 h-[0.5cqw] w-[6cqw] -translate-x-1/2 rounded-full bg-white" />
                              </span>
                            </div>
                            <Search className="size-[6cqw]" strokeWidth={2.25} />
                          </div>

                          <div className="absolute top-[49%] right-[1.5cqw] flex w-[12cqw] flex-col items-center gap-[1.4cqw] text-[2.8cqw] leading-tight font-semibold">
                            <span className="size-[11cqw] rounded-full border-[0.4cqw] border-white bg-white/30" />
                            <span className="flex flex-col items-center gap-[0.6cqw]">
                              <Heart className="size-[7.5cqw]" fill="currentColor" strokeWidth={1} />
                              13.3K
                            </span>
                            <span className="flex flex-col items-center gap-[0.6cqw]">
                              <MessageCircle className="size-[7.5cqw]" fill="currentColor" strokeWidth={1} />
                              200
                            </span>
                            <span className="flex flex-col items-center gap-[0.6cqw]">
                              <Bookmark className="size-[7.5cqw]" fill="currentColor" strokeWidth={1} />
                              2,757
                            </span>
                            <span className="flex flex-col items-center gap-[0.6cqw]">
                              <Forward className="size-[7.5cqw]" strokeWidth={2.75} />
                              426
                            </span>
                          </div>
                          <span className="absolute top-[87.9%] right-[2.8cqw] size-[9.5cqw] -translate-y-1/2 rounded-full border-[1.8cqw] border-neutral-800 bg-white/40" />

                          <div className="absolute top-[82.6%] left-[3cqw] w-[78cqw] space-y-[0.6cqw]">
                            <p className="text-[4cqw] leading-[4.8cqw] font-bold">your_handle</p>
                            <p className="line-clamp-2 text-[3.6cqw] leading-[3.9cqw]">Your caption and #hashtags sit here #fyp #trending #foryou</p>
                          </div>

                          <div className="absolute inset-x-[3cqw] top-[91.5%] h-[0.4cqw] rounded-full bg-white/30">
                            <span className="absolute top-1/2 left-[2cqw] size-[1.6cqw] -translate-y-1/2 rounded-full bg-white" />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 flex h-[8%] items-center justify-around bg-black px-[2cqw] text-[2.5cqw] text-white/80 [text-shadow:none]">
                            <span className="flex flex-col items-center gap-[0.4cqw] font-semibold text-white">
                              <House className="size-[6cqw]" fill="currentColor" />
                              Home
                            </span>
                            <span className="flex flex-col items-center gap-[0.4cqw]">
                              <Users className="size-[6cqw]" />
                              Friends
                            </span>
                            <span className="flex h-[6.2cqw] w-[10.5cqw] items-center justify-center rounded-[1.8cqw] bg-white text-black shadow-[-0.7cqw_0_0_#25f4ee,0.7cqw_0_0_#fe2c55]">
                              <Plus className="size-[4.5cqw]" strokeWidth={3} />
                            </span>
                            <span className="flex flex-col items-center gap-[0.4cqw]">
                              <MessageSquare className="size-[6cqw]" />
                              Inbox
                            </span>
                            <span className="flex flex-col items-center gap-[0.4cqw]">
                              <User className="size-[6cqw]" />
                              Profile
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Instagram Reels, as on a phone: the header, the action rail and the author, caption and audio rows */}
                      {platform === 'reels' && aspect === '9:16' && (
                        <div className={overlay} style={{ opacity: overlayOpacity / 100 }}>
                          <div className={shade} />

                          <div className={cn(safeZone, 'top-[8.5%] right-[15cqw] bottom-[16.5%] left-[4cqw]')}>
                            <span className={safeLabel}>Safe zone</span>
                          </div>

                          <div className="absolute inset-x-[4cqw] top-[4.4%] flex -translate-y-1/2 items-center justify-between">
                            <Plus className="size-[6cqw]" strokeWidth={2} />
                            <div className="flex items-center gap-[4cqw] text-[4.3cqw] font-bold">
                              <span className="flex items-center gap-[0.6cqw]">
                                Reels
                                <ChevronDown className="size-[3.5cqw]" strokeWidth={2.5} />
                              </span>
                              <span className="flex items-center gap-[1.5cqw] text-white/70">
                                Friends
                                <span className="flex -space-x-[1.4cqw]">
                                  <span className="size-[4cqw] rounded-full border-[0.3cqw] border-black/40 bg-white/50" />
                                  <span className="size-[4cqw] rounded-full border-[0.3cqw] border-black/40 bg-white/40" />
                                  <span className="size-[4cqw] rounded-full border-[0.3cqw] border-black/40 bg-white/60" />
                                </span>
                              </span>
                            </div>
                            <SlidersHorizontal className="size-[6cqw]" strokeWidth={2} />
                          </div>

                          <div className="absolute top-[43.5%] right-[1.5cqw] flex w-[12cqw] flex-col items-center gap-[4.5cqw] text-[2.8cqw] font-medium">
                            <span className="flex flex-col items-center gap-[0.8cqw]">
                              <Heart className="size-[6.5cqw]" strokeWidth={1.75} />
                              1,145
                            </span>
                            <span className="flex flex-col items-center gap-[0.8cqw]">
                              <MessageCircle className="size-[6.5cqw]" strokeWidth={1.75} />
                              1,175
                            </span>
                            <span className="flex flex-col items-center gap-[0.8cqw]">
                              <Repeat2 className="size-[6.5cqw]" strokeWidth={1.75} />
                              29
                            </span>
                            <span className="flex flex-col items-center gap-[0.8cqw]">
                              <Send className="size-[6.5cqw]" strokeWidth={1.75} />
                              1,727
                            </span>
                            <span className="flex flex-col items-center gap-[0.8cqw]">
                              <Bookmark className="size-[6.5cqw]" strokeWidth={1.75} />
                              3,363
                            </span>
                          </div>
                          <Equal className="absolute top-[88.9%] right-[4.3cqw] size-[6.5cqw] -translate-y-1/2" strokeWidth={1.75} />
                          <span className="absolute top-[94.6%] right-[4.3cqw] size-[6.5cqw] -translate-y-1/2 rounded-[1.2cqw] border-[0.4cqw] border-white bg-white/30" />

                          <div className="absolute top-[87.1%] left-[4cqw] flex -translate-y-1/2 items-center gap-[2cqw]">
                            <span className="size-[8.5cqw] rounded-full border-[0.3cqw] border-white/60 bg-white/30" />
                            <span className="flex items-center gap-[1cqw] text-[3.4cqw] font-bold">
                              your_handle
                              <BadgeCheck className="size-[3.6cqw] text-white" fill="#0095f6" strokeWidth={2.5} />
                            </span>
                            <span className="rounded-[1.4cqw] border-[0.3cqw] border-white/80 px-[2.5cqw] py-[0.8cqw] text-[3.3cqw] font-semibold">Follow</span>
                          </div>
                          <p className="absolute top-[92.2%] left-[4cqw] w-[80cqw] -translate-y-1/2 truncate text-[3.4cqw]">
                            Your caption sits here, and longer ones are cut off with an ellipsis after one line
                          </p>
                          <div className="absolute top-[95.5%] left-[4cqw] flex -translate-y-1/2 items-center gap-[1.5cqw] text-[3cqw] text-white/80">
                            <span className="size-[3.5cqw] rounded-full bg-white/50" />
                            <span>
                              Followed by <span className="font-semibold text-white">a_friend</span>
                            </span>
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
