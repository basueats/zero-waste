import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  FileText,
  ChefHat
} from 'lucide-react';
import { VideoMasterclass, VideoQuizCheckpoint } from '../types/course';
import { audioNarrator, tokenizeTextIntoWords } from '../utils/audioNarrator';

interface InteractiveVideoPlayerProps {
  video: VideoMasterclass;
  onAwardXp: (amount: number) => void;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({
  video,
  onAwardXp,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [sentenceElapsed, setSentenceElapsed] = useState<number>(0);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoQuizCheckpoint | null>(null);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(true);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);

  const transcript = useMemo(() => video.transcript || [], [video]);
  const [durationsVersion, setDurationsVersion] = useState<number>(0);

  useEffect(() => {
    return audioNarrator.onDurationsUpdated(() => {
      setDurationsVersion((v) => v + 1);
    });
  }, []);

  // Exact WAV timings when lecture audio is loaded, otherwise estimated 1.0x durations
  const lectureTimingsData = useMemo(() => {
    return audioNarrator.getLectureTimings(transcript.map((t) => t.text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, durationsVersion]);

  const sentenceDurations = useMemo(() => {
    if (lectureTimingsData && lectureTimingsData.sentenceTimings.length === transcript.length) {
      return lectureTimingsData.sentenceTimings.map((t) => Math.max(0.3, t.end - t.start));
    }
    return transcript.map((item) => audioNarrator.estimateDuration(item.text, 1.0));
  }, [transcript, lectureTimingsData]);

  const sentenceStartTimes = useMemo(() => {
    if (lectureTimingsData && lectureTimingsData.sentenceTimings.length === transcript.length) {
      return lectureTimingsData.sentenceTimings.map((t) => t.start);
    }
    const starts: number[] = [0];
    for (let i = 0; i < sentenceDurations.length - 1; i++) {
      starts.push(starts[i] + sentenceDurations[i]);
    }
    return starts;
  }, [sentenceDurations, lectureTimingsData, transcript.length]);

  const totalDuration = useMemo(() => {
    if (lectureTimingsData && lectureTimingsData.duration > 0) {
      return lectureTimingsData.duration;
    }
    return Math.max(video.durationSeconds, sentenceDurations.reduce((a, b) => a + b, 0));
  }, [video.durationSeconds, sentenceDurations, lectureTimingsData]);

  const currentTime = Math.min(
    totalDuration,
    (sentenceStartTimes[activeSentenceIndex] || 0) + sentenceElapsed
  );

  const activeTranscriptLine = transcript[activeSentenceIndex] || transcript[0];

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;
  const lastSentenceIdxRef = useRef<number>(0);

  // Prefetch unified Fenrir lecture WAV
  useEffect(() => {
    if (transcript.length > 0) {
      audioNarrator.prefetchLecture(transcript.map((t) => t.text));
    }
  }, [transcript]);

  // Clean stop on unmount
  useEffect(() => {
    return () => {
      audioNarrator.stop();
    };
  }, []);

  // Play continuous unified Fenrir masterclass audio with live word/checkpoint sync
  const startPlaybackFrom = useCallback((index: number, explicitOffsetSec?: number) => {
    if (index >= transcript.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      audioNarrator.stop();
      audioNarrator.playSound('correct');
      return;
    }

    lastSentenceIdxRef.current = index;
    setActiveSentenceIndex(index);
    setActiveWordIndex(-1);
    setSentenceElapsed(0);
    setSentenceProgress(0);

    if (isMutedRef.current) {
      audioNarrator.stop();
      return;
    }

    const startOffset =
      explicitOffsetSec !== undefined
        ? Math.max(0, explicitOffsetSec)
        : (sentenceStartTimes[index] || 0);

    audioNarrator.speakLecture({
      sentences: transcript.map((t) => t.text),
      startTimeOffset: startOffset,
      rate: playbackSpeedRef.current,
      volume: volumeRef.current,
      onProgress: (p) => {
        if (!isPlayingRef.current) return;

        // Detect crossing into next sentence to check if a checkpoint sits at that timestamp
        if (p.sentenceIndex > lastSentenceIdxRef.current) {
          const prevIdx = lastSentenceIdxRef.current;
          const boundaryTime = (sentenceStartTimes[prevIdx] || 0) + (sentenceDurations[prevIdx] || 0);
          const hitCheckpoint = video.checkpoints.find(
            (ck) => Math.abs(ck.timestampSeconds - boundaryTime) < 6 && !answeredCheckpoints.has(ck.id)
          );
          lastSentenceIdxRef.current = p.sentenceIndex;
          if (hitCheckpoint) {
            audioNarrator.pause();
            setIsPlaying(false);
            isPlayingRef.current = false;
            setActiveSentenceIndex(p.sentenceIndex);
            setActiveCheckpoint(hitCheckpoint);
            setSelectedOption(null);
            setCheckpointSubmitted(false);
            audioNarrator.playSound('checkpoint');
            return;
          }
        }

        const segDur = Math.max(0.25, sentenceDurations[p.sentenceIndex] || 3);
        setActiveSentenceIndex(p.sentenceIndex);
        setActiveWordIndex(p.wordIndex);
        setSentenceElapsed(p.sentenceElapsed);
        setSentenceProgress(Math.min(1, p.sentenceElapsed / segDur));
      },
      onEnd: () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setActiveWordIndex(-1);
        setSentenceProgress(1);
        audioNarrator.playSound('correct');
      },
    });
  }, [transcript, sentenceStartTimes, sentenceDurations, video.checkpoints, answeredCheckpoints]);

  // Play / Pause toggle (supports seamless resume cleanly on mobile & desktop)
  const togglePlay = () => {
    if (activeCheckpoint) return;
    audioNarrator.unlockOnUserGesture();

    if (!isPlaying) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (!isMuted && audioNarrator.getIsSpeaking() && audioNarrator.getIsPaused()) {
        audioNarrator.resume();
      } else {
        startPlaybackFrom(activeSentenceIndex, currentTime);
      }
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (audioNarrator.getIsSpeaking()) {
        audioNarrator.pause();
      } else {
        audioNarrator.stop();
      }
    }
  };

  // Muted progress loop
  useEffect(() => {
    if (!isPlaying || !isMuted || activeCheckpoint) return;
    const interval = setInterval(() => {
      setSentenceElapsed((prev) => {
        const next = prev + 0.1 * playbackSpeedRef.current;
        const dur = sentenceDurations[activeSentenceIndex] || 5;
        const fraction = Math.min(1, next / Math.max(0.25, dur));
        setSentenceProgress(fraction);

        const words = (transcript[activeSentenceIndex]?.text || '').split(/\s+/).filter(Boolean);
        const wIdx = Math.min(Math.max(0, words.length - 1), Math.floor(fraction * words.length));
        setActiveWordIndex(wIdx);

        if (next >= dur) {
          const boundaryTime = (sentenceStartTimes[activeSentenceIndex] || 0) + dur;
          const hitCheckpoint = video.checkpoints.find(
            (ck) => Math.abs(ck.timestampSeconds - boundaryTime) < 6 && !answeredCheckpoints.has(ck.id)
          );
          if (hitCheckpoint) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setActiveCheckpoint(hitCheckpoint);
            setSelectedOption(null);
            setCheckpointSubmitted(false);
            audioNarrator.playSound('checkpoint');
            return 0;
          }
          if (activeSentenceIndex + 1 < transcript.length) {
            setActiveSentenceIndex((s) => s + 1);
            setActiveWordIndex(-1);
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
          }
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, activeCheckpoint, activeSentenceIndex, sentenceDurations, sentenceStartTimes, transcript, video.checkpoints, answeredCheckpoints]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioNarrator.unlockOnUserGesture();
    const val = parseFloat(e.target.value);
    let targetSentenceIdx = 0;
    for (let i = sentenceStartTimes.length - 1; i >= 0; i--) {
      if (val >= sentenceStartTimes[i]) {
        targetSentenceIdx = i;
        break;
      }
    }
    const localOffset = Math.max(0, val - (sentenceStartTimes[targetSentenceIdx] || 0));
    lastSentenceIdxRef.current = targetSentenceIdx;
    setActiveSentenceIndex(targetSentenceIdx);
    setActiveWordIndex(-1);
    setSentenceElapsed(localOffset);
    setSentenceProgress(0);

    if (isPlaying) {
      if (!isMutedRef.current && audioNarrator.getIsSpeaking() && audioNarrator.seekTo(val)) {
        if (audioNarrator.getIsPaused()) {
          audioNarrator.resume();
        }
      } else {
        startPlaybackFrom(targetSentenceIdx, val);
      }
    }
  };

  const handleSelectOption = (idx: number) => {
    if (checkpointSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitCheckpoint = () => {
    if (!activeCheckpoint || selectedOption === null) return;
    setCheckpointSubmitted(true);
    const isCorrect = selectedOption === activeCheckpoint.correctIndex;
    audioNarrator.playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      onAwardXp(activeCheckpoint.points);
      setAnsweredCheckpoints((prev) => new Set([...prev, activeCheckpoint.id]));
    }
  };

  const handleResumeAfterCheckpoint = () => {
    audioNarrator.unlockOnUserGesture();
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setCheckpointSubmitted(false);
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (!isMutedRef.current && audioNarrator.getIsSpeaking() && audioNarrator.getIsPaused()) {
      audioNarrator.resume();
    } else {
      startPlaybackFrom(activeSentenceIndex + 1);
    }
  };

  const handleRewindAndReview = () => {
    if (activeCheckpoint) {
      audioNarrator.unlockOnUserGesture();
      const prevIdx = Math.max(0, activeSentenceIndex - 1);
      setActiveCheckpoint(null);
      setSelectedOption(null);
      setCheckpointSubmitted(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
      startPlaybackFrom(prevIdx);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 text-white mb-8">
      {/* Video Header Strip */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-bold text-slate-200">Interactive Masterclass</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-medium truncate max-w-xs">{video.title}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <ChefHat className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 font-semibold">{video.instructor}</span>
          <span className="hidden sm:inline text-slate-500">({video.instructorRole})</span>
          {isPlaying && !isMuted && (
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/80 animate-pulse">
              🎙️ Voice Active
            </span>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group select-none">
        {/* Background Visual Stream / Poster */}
        <img
          src={video.posterImage}
          alt={video.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-1000 ${
            isPlaying ? 'scale-105 filter brightness-95' : 'scale-100 filter brightness-80'
          }`}
        />

        {/* Presenter Camera Watermark & Title Overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <img
            src="/assets/aistudio/Untitled_design_0fea8cc4.png"
            alt={video.instructor}
            className="w-7 h-7 rounded-full object-cover object-top border border-emerald-400 shrink-0 bg-[#0b193d]"
          />
          <div>
            <div className="font-bold text-slate-100 text-[11px]">{video.instructor}</div>
            <div className="text-[10px] text-emerald-400">Master Demonstration</div>
          </div>
        </div>

        {/* In-Video Karaoke Captions Overlay */}
        {showCaptions && activeTranscriptLine && isPlaying && !activeCheckpoint && (
          <div className="absolute bottom-16 left-6 right-6 z-10 text-center pointer-events-none">
            <div className="inline-block bg-black/85 backdrop-blur-md text-white text-xs md:text-sm px-4 py-2.5 rounded-xl border border-white/10 shadow-xl font-medium max-w-xl leading-relaxed">
              {tokenizeTextIntoWords(activeTranscriptLine.text).map((tok) => {
                const isSpoken = activeWordIndex >= tok.index;
                const isCurrent = activeWordIndex === tok.index;
                return (
                  <span
                    key={tok.index}
                    className={`transition-all duration-75 ${
                      isCurrent
                        ? 'text-amber-300 font-extrabold bg-amber-400/20 px-1 py-0.5 rounded shadow-xs scale-105 inline-block'
                        : isSpoken
                        ? 'text-white font-medium'
                        : 'text-slate-400/80'
                    }`}
                  >
                    {tok.word}{' '}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Center Play Button Overlay when paused */}
        {!isPlaying && !activeCheckpoint && (
          <button
            onClick={togglePlay}
            className="absolute z-20 w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
            title="Play video masterclass"
          >
            <Play className="w-8 h-8 fill-white ml-1" />
          </button>
        )}

        {/* Interactive In-Video Quiz Checkpoint Modal Overlay */}
        {activeCheckpoint && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md p-6 md:p-8 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Pause & Check: In-Video Knowledge Checkpoint</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{activeCheckpoint.points} XP</span>
                </div>
              </div>

              <div className="text-sm md:text-base font-bold text-white leading-snug">
                {activeCheckpoint.question}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {activeCheckpoint.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeCheckpoint.correctIndex;

                  let style = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600';
                  if (checkpointSubmitted) {
                    if (isCorrect) {
                      style = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-rose-950 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                    } else {
                      style = 'bg-slate-850 border-slate-800 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    style = 'bg-blue-950 border-blue-500 text-blue-200 ring-1 ring-blue-500';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={checkpointSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs md:text-sm flex items-center justify-between gap-3 transition-colors ${style}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-current text-[11px] font-mono flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {checkpointSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Checkpoint Feedback */}
              {checkpointSubmitted && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    selectedOption === activeCheckpoint.correctIndex
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                  }`}
                >
                  {selectedOption === activeCheckpoint.correctIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong>
                      {selectedOption === activeCheckpoint.correctIndex ? 'Correct!' : 'Incorrect.'}
                    </strong>{' '}
                    {activeCheckpoint.explanation}
                  </div>
                </div>
              )}

              {/* Checkpoint Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleRewindAndReview}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rewind & Re-watch</span>
                </button>

                {!checkpointSubmitted ? (
                  <button
                    onClick={handleSubmitCheckpoint}
                    disabled={selectedOption === null}
                    className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${
                      selectedOption !== null
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleResumeAfterCheckpoint}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Resume Video Lecture</span>
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Scrubber & Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 z-20">
          {/* Progress Slider with Checkpoint Pins */}
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(1, totalDuration)}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Checkpoint Markers on the timeline */}
            {video.checkpoints.map((ck) => {
              const posPercent = (ck.timestampSeconds / Math.max(1, totalDuration)) * 100;
              const isAnswered = answeredCheckpoints.has(ck.id);
              return (
                <div
                  key={ck.id}
                  style={{ left: `${posPercent}%` }}
                  className={`absolute -top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 -translate-x-1/2 cursor-pointer transition-transform hover:scale-125 z-10 flex items-center justify-center ${
                    isAnswered ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  title={`Checkpoint: ${ck.question}`}
                >
                  <span className="text-[7px] text-slate-950 font-black">?</span>
                </div>
              );
            })}
          </div>

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1 text-white hover:text-emerald-400 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => {
                  audioNarrator.unlockOnUserGesture();
                  const prevIdx = Math.max(0, activeSentenceIndex - 1);
                  setIsPlaying(true);
                  isPlayingRef.current = true;
                  startPlaybackFrom(prevIdx);
                }}
                className="p-1 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                title="Rewind to previous sentence"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Time display */}
              <div className="text-slate-300 font-mono text-[11px] tabular-nums">
                {formatSeconds(currentTime)} / {formatSeconds(totalDuration)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mute toggle */}
              <button
                onClick={() => {
                  audioNarrator.unlockOnUserGesture();
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  isMutedRef.current = nextMuted;
                  if (nextMuted) {
                    audioNarrator.stop();
                  } else if (isPlaying) {
                    startPlaybackFrom(activeSentenceIndex, currentTime);
                  }
                }}
                className="text-slate-300 hover:text-white p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Speed Switcher */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                {[1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      audioNarrator.unlockOnUserGesture();
                      setPlaybackSpeed(spd);
                      playbackSpeedRef.current = spd;
                      audioNarrator.setRate(spd);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* CC Toggle */}
              <button
                onClick={() => setShowCaptions((c) => !c)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  showCaptions
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-950/60'
                    : 'border-slate-600 text-slate-500'
                }`}
                title="Toggle subtitles / closed captions"
              >
                CC
              </button>

              {/* Transcript Drawer Toggle */}
              <button
                onClick={() => setShowTranscript((t) => !t)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                  showTranscript ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle lecture transcript"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Transcript</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Synced Transcript Drawer */}
      {showTranscript && (
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 max-h-48 overflow-y-auto space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Synced Masterclass Transcript</span>
            </div>
            <span className="text-[10px] text-slate-500 lowercase font-normal">
              Click any sentence to listen & sync
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {transcript.map((line, idx) => {
              const isCurrent = activeSentenceIndex === idx;
              const startTimeStr = formatSeconds(sentenceStartTimes[idx] || 0);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    audioNarrator.unlockOnUserGesture();
                    setIsPlaying(true);
                    isPlayingRef.current = true;
                    startPlaybackFrom(idx);
                  }}
                  className={`p-2 rounded-lg cursor-pointer flex items-start gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-emerald-950/80 border border-emerald-800/80 text-white font-medium'
                      : 'hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span className="font-mono text-[10px] text-emerald-400 mt-0.5 shrink-0">
                    {startTimeStr}
                  </span>
                  <span className="text-xs leading-relaxed flex-1">{line.text}</span>
                  {isCurrent && isPlaying && !isMuted && (
                    <span className="text-[9px] text-emerald-400 font-mono font-bold shrink-0 bg-emerald-950 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                      Speaking
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
