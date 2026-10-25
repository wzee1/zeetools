// Live audio level of a stream (the mic meter and the speaking state of each tile), read with Web Audio.

/** One context per sample rate: Firefox will not connect a stream to a context running at another rate. */
const contexts = new Map<number, AudioContext>();
let resumeArmed = false;

/** Contexts created without a user gesture start suspended; the next click or key press wakes them all. */
function armResume() {
  if (resumeArmed) return;
  resumeArmed = true;
  const resume = () => {
    contexts.forEach((ctx) => {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    });
  };
  window.addEventListener("pointerdown", resume, true);
  window.addEventListener("keydown", resume, true);
}

function contextAt(sampleRate: number): AudioContext {
  let ctx = contexts.get(sampleRate);
  if (!ctx || ctx.state === "closed") {
    ctx = sampleRate ? new AudioContext({ sampleRate }) : new AudioContext();
    contexts.set(sampleRate, ctx);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** The track's own rate first (when the browser reports it), then the default, then the two usual device rates. */
function sourceFor(stream: MediaStream, track: MediaStreamTrack): MediaStreamAudioSourceNode | null {
  const rates = [track.getSettings().sampleRate ?? 0, 0, 48000, 44100].filter((r, i, all) => all.indexOf(r) === i);
  for (const rate of rates) {
    try {
      return contextAt(rate).createMediaStreamSource(stream);
    } catch {
      // a rate mismatch: try the next context
    }
  }
  return null;
}

/**
 * Turns analyser bins into a 0–1 level, quantised to 5% steps: the level feeds React state, so
 * publishing every tiny change would re-render the call view about 60 times a second.
 */
export function levelFromBins(bins: Uint8Array): number {
  if (bins.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < bins.length; i++) sum += bins[i];
  return Math.round(Math.min(1, Math.max(0, sum / bins.length / 128)) * 20) / 20;
}

/**
 * Calls `onLevel` whenever the stream's audio level changes, until the returned function is called.
 * The stream is only analysed, never played, so nothing is heard twice.
 */
export function watchAudioLevel(stream: MediaStream, onLevel: (level: number) => void): () => void {
  const track = stream.getAudioTracks()[0];
  if (!track || typeof AudioContext === "undefined") return () => {};

  const source = sourceFor(stream, track);
  if (!source) return () => {};
  armResume();

  const analyser = source.context.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.5;
  source.connect(analyser);

  const bins = new Uint8Array(analyser.frequencyBinCount);
  let last = -1;
  let frame = 0;
  const tick = () => {
    analyser.getByteFrequencyData(bins);
    const level = levelFromBins(bins);
    if (level !== last) {
      last = level;
      onLevel(level);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    source.disconnect();
  };
}
