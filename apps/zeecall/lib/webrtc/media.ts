export interface MediaDeviceSummary {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

/**
 * 4K High-Frame Screen Sharing Engine.
 * Optimized for developer code reviews and video agency color/pacing reviews
 * with native 4K display resolution and crisp system audio pass-through.
 */
export async function getHighDefScreenStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Screen sharing is not supported in this environment");
  }

  return await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: 3840, max: 3840 },
      height: { ideal: 2160, max: 2160 },
      frameRate: { ideal: 60, max: 60 },
    },
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
}

/**
 * Acquire camera and microphone media stream with explicit device identifiers.
 * Asking for both fails as a whole when one device is missing or busy (no camera, say), so it then
 * retries with the microphone alone and then the camera alone; the first error is thrown if none works.
 */
export async function getUserMediaStream(options: {
  audioDeviceId?: string;
  videoDeviceId?: string;
  audio?: boolean;
  video?: boolean;
} = {}): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("getUserMedia is not supported in this browser");
  }

  const { audioDeviceId, videoDeviceId, audio = true, video = true } = options;

  const audioConstraints: boolean | MediaTrackConstraints = audio
    ? audioDeviceId
      ? { deviceId: { exact: audioDeviceId }, echoCancellation: true, noiseSuppression: true }
      : { echoCancellation: true, noiseSuppression: true }
    : false;

  const videoConstraints: boolean | MediaTrackConstraints = video
    ? videoDeviceId
      ? {
          deviceId: { exact: videoDeviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        }
      : {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        }
    : false;

  if (!audioConstraints && !videoConstraints) {
    return new MediaStream();
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: videoConstraints,
    });
  } catch (err) {
    if (!audioConstraints || !videoConstraints) throw err;
    for (const constraints of [{ audio: audioConstraints }, { video: videoConstraints }]) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // try the next device on its own
      }
    }
    throw err;
  }
}

/**
 * Enumerate available audio and video devices.
 */
export async function enumerateConnectedDevices(): Promise<{
  audioInputs: MediaDeviceSummary[];
  videoInputs: MediaDeviceSummary[];
  audioOutputs: MediaDeviceSummary[];
}> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs: MediaDeviceSummary[] = [];
    const videoInputs: MediaDeviceSummary[] = [];
    const audioOutputs: MediaDeviceSummary[] = [];

    devices.forEach((device, index) => {
      const summary: MediaDeviceSummary = {
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${index + 1}`,
        kind: device.kind,
      };

      if (device.kind === "audioinput") {
        audioInputs.push(summary);
      } else if (device.kind === "videoinput") {
        videoInputs.push(summary);
      } else if (device.kind === "audiooutput") {
        audioOutputs.push(summary);
      }
    });

    return { audioInputs, videoInputs, audioOutputs };
  } catch (err) {
    console.warn("Failed to enumerate devices:", err);
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }
}

/**
 * Cleanly stops all tracks on a MediaStream.
 */
export function stopStreamTracks(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // ignore
    }
  });
}
