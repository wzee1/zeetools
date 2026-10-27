"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  enumerateConnectedDevices,
  getHighDefScreenStream,
  getUserMediaStream,
  MediaDeviceSummary,
  stopStreamTracks,
} from "@/lib/webrtc/media";
import { watchAudioLevel } from "@/lib/webrtc/audio-level";

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [audioInputs, setAudioInputs] = useState<MediaDeviceSummary[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceSummary[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceSummary[]>([]);

  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("");

  const [micLevel, setMicLevel] = useState<number>(0); // 0.0 to 1.0

  const stopMeterRef = useRef<(() => void) | null>(null);

  // Refresh hardware devices
  const refreshDevices = useCallback(async () => {
    const devices = await enumerateConnectedDevices();
    setAudioInputs(devices.audioInputs);
    setVideoInputs(devices.videoInputs);
    setAudioOutputs(devices.audioOutputs);

    if (devices.audioInputs.length > 0 && !selectedAudioDevice) {
      setSelectedAudioDevice(devices.audioInputs[0].deviceId);
    }
    if (devices.videoInputs.length > 0 && !selectedVideoDevice) {
      setSelectedVideoDevice(devices.videoInputs[0].deviceId);
    }
    if (devices.audioOutputs.length > 0 && !selectedAudioOutput) {
      setSelectedAudioOutput(devices.audioOutputs[0].deviceId);
    }
  }, [selectedAudioDevice, selectedVideoDevice, selectedAudioOutput]);

  // Audio VU meter: lib/webrtc/audio-level picks a context Firefox accepts and wakes it on the next click.
  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    stopMeterRef.current?.();
    stopMeterRef.current = watchAudioLevel(stream, setMicLevel);
  }, []);

  const cleanAudioAnalyser = useCallback(() => {
    stopMeterRef.current?.();
    stopMeterRef.current = null;
    setMicLevel(0);
  }, []);

  // Initialize or re-acquire user media
  const startMedia = useCallback(
    async (overrideAudioId?: string, overrideVideoId?: string) => {
      try {
        const stream = await getUserMediaStream({
          audioDeviceId: overrideAudioId ?? selectedAudioDevice,
          videoDeviceId: overrideVideoId ?? selectedVideoDevice,
          audio: true,
          video: true,
        });

        stopStreamTracks(localStream);
        cleanAudioAnalyser();

        setLocalStream(stream);
        // A device that could not be opened (no camera, say) shows as off.
        setIsAudioMuted(stream.getAudioTracks().length === 0);
        setIsVideoOff(stream.getVideoTracks().length === 0);

        setupAudioAnalyser(stream);
        await refreshDevices();
        return stream;
      } catch (err) {
        console.warn("Failed to get user media:", err);
        return null;
      }
    },
    [localStream, selectedAudioDevice, selectedVideoDevice, refreshDevices, setupAudioAnalyser, cleanAudioAnalyser]
  );

  // A track that ends by itself (the camera permission is revoked, a device is unplugged) counts as off.
  useEffect(() => {
    if (!localStream) return;
    const cleanups = localStream.getTracks().map((track) => {
      const onEnded = () => {
        if (track.kind === "audio") {
          setIsAudioMuted(true);
          setMicLevel(0);
        } else {
          setIsVideoOff(true);
        }
      };
      if (track.readyState === "ended") onEnded();
      track.addEventListener("ended", onEnded);
      return () => track.removeEventListener("ended", onEnded);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [localStream]);

  // Toggle microphone
  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    // A dead track cannot be switched back on; it stays muted until the device is opened again.
    if (audioTracks.length === 0 || audioTracks.every((track) => track.readyState === "ended")) return;
    const nextState = !isAudioMuted;

    audioTracks.forEach((track) => {
      track.enabled = !nextState;
    });

    setIsAudioMuted(nextState);
    if (nextState) {
      setMicLevel(0);
    }
  }, [localStream, isAudioMuted]);

  // Set explicit audio mute state (useful for push-to-talk)
  const setAudioMuted = useCallback(
    (muted: boolean) => {
      if (!localStream) return;
      if (!muted && localStream.getAudioTracks().every((track) => track.readyState === "ended")) return;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
      setIsAudioMuted(muted);
      if (muted) setMicLevel(0);
    },
    [localStream]
  );

  // Toggle camera
  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0 || videoTracks.every((track) => track.readyState === "ended")) return;
    const nextState = !isVideoOff;

    videoTracks.forEach((track) => {
      track.enabled = !nextState;
    });

    setIsVideoOff(nextState);
  }, [localStream, isVideoOff]);

  // Toggle 4K screen share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing && screenStream) {
      stopStreamTracks(screenStream);
      setScreenStream(null);
      setIsScreenSharing(false);
      return null;
    }

    try {
      const stream = await getHighDefScreenStream();
      setScreenStream(stream);
      setIsScreenSharing(true);

      // Handle native browser "Stop Sharing" floating pill
      const screenVideoTrack = stream.getVideoTracks()[0];
      if (screenVideoTrack) {
        screenVideoTrack.onended = () => {
          stopStreamTracks(stream);
          setScreenStream(null);
          setIsScreenSharing(false);
        };
      }

      return stream;
    } catch (err) {
      console.warn("Screen share canceled or failed:", err);
      return null;
    }
  }, [isScreenSharing, screenStream]);

  // Stop screen share explicitly
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      stopStreamTracks(screenStream);
      setScreenStream(null);
      setIsScreenSharing(false);
    }
  }, [screenStream]);

  // Stop everything (on leave)
  const stopAll = useCallback(() => {
    stopStreamTracks(localStream);
    stopStreamTracks(screenStream);
    cleanAudioAnalyser();
    setLocalStream(null);
    setScreenStream(null);
    setIsScreenSharing(false);
  }, [localStream, screenStream, cleanAudioAnalyser]);

  // Initial device list check
  useEffect(() => {
    let mounted = true;
    enumerateConnectedDevices().then((devices) => {
      if (!mounted) return;
      setAudioInputs(devices.audioInputs);
      setVideoInputs(devices.videoInputs);
      setAudioOutputs(devices.audioOutputs);
      if (devices.audioInputs.length > 0) {
        setSelectedAudioDevice((prev) => prev || devices.audioInputs[0].deviceId);
      }
      if (devices.videoInputs.length > 0) {
        setSelectedVideoDevice((prev) => prev || devices.videoInputs[0].deviceId);
      }
      if (devices.audioOutputs.length > 0) {
        setSelectedAudioOutput((prev) => prev || devices.audioOutputs[0].deviceId);
      }
    });

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
      return () => {
        mounted = false;
        navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
      };
    }
    return () => {
      mounted = false;
    };
  }, [refreshDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanAudioAnalyser();
    };
  }, [cleanAudioAnalyser]);

  return {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    micLevel,
    audioInputs,
    videoInputs,
    audioOutputs,
    selectedAudioDevice,
    selectedVideoDevice,
    selectedAudioOutput,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioOutput,
    startMedia,
    toggleAudio,
    setAudioMuted,
    toggleVideo,
    toggleScreenShare,
    stopScreenShare,
    stopAll,
    refreshDevices,
  };
}
