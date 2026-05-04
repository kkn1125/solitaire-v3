import {
  ANIMATE_TIME,
  bgmTrackUrls,
  effectSoundUrls,
  OFFSET_TIME,
  winSoundUrls,
} from "@/config/variable";
import { useCoreStore } from "@/store/useCoreStore";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/shallow";

const BGM_PATH_SET = new Set<string>(bgmTrackUrls);

function pickRandomBgmPath(exclude?: string | null): string {
  const urls = bgmTrackUrls;
  if (urls.length === 0) return "";
  if (urls.length === 1) return urls[0]!;
  let next = urls[Math.floor(Math.random() * urls.length)]!;
  while (exclude != null && next === exclude) {
    next = urls[Math.floor(Math.random() * urls.length)]!;
  }
  return next;
}

function resolveBgmPath(track: string | undefined): string {
  if (track && BGM_PATH_SET.has(track)) return track;
  return bgmTrackUrls[0] ?? "";
}

export type SoundEffectContextValue = ReturnType<typeof useSoundEffect>;

export const useSoundEffect = () => {
  const [bgmReady, setBgmReady] = useState(false);
  const bgmByPathRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const currentTrack = useCoreStore(
    useShallow((state) => state.settings.backgroundMusic?.track || ""),
  );
  const backgroundMusicVolume = useCoreStore(
    useShallow((state) => state.settings.backgroundMusic?.volume || 0.5),
  );
  const isPlaying = useCoreStore(
    useShallow((state) => state.settings.backgroundMusic?.playing || false),
  );
  const effectSound = useCoreStore(
    useShallow((state) => state.settings.effectSound),
  );

  const setIsPlaying = useCoreStore(
    useShallow((state) => state.actions.setIsPlaying),
  );

  const currentTrackRef = useRef(currentTrack);
  const volumeRef = useRef(backgroundMusicVolume);
  const isPlayingRef = useRef(isPlaying);
  const effectSoundRef = useRef(effectSound);
  const lastStartedBgmPathRef = useRef<string | null>(null);

  currentTrackRef.current = currentTrack;
  volumeRef.current = backgroundMusicVolume;
  isPlayingRef.current = isPlaying;
  effectSoundRef.current = effectSound;

  const playOneShot = useEffectEvent((role: keyof typeof effectSoundUrls) => {
    if (!effectSoundRef.current) return;
    const url = effectSoundUrls[role];
    const audio = new Audio(url);
    if (role === "shuffle") {
      audio.playbackRate = 0.8;
    }
    switch (role) {
      case "shuffle":
        audio.volume = 0.65;
        break;
      case "pick":
        audio.volume = 0.55;
        break;
      case "move":
        audio.volume = 0.55;
        break;
      case "fanfare":
        audio.volume = 0.5;
        break;
      case "popper":
        audio.volume = 0.5;
        break;
      case "click":
        audio.volume = 0.75;
        break;
      default:
        audio.volume = 0.5;
        break;
    }
    void audio.play().catch(() => {});
  });

  const handleBgmTrackEnded = useEffectEvent((endedPath: string) => {
    if (!isPlayingRef.current) return;
    const expected = resolveBgmPath(currentTrackRef.current);
    if (endedPath !== expected) return;
    const next = pickRandomBgmPath(endedPath);
    useCoreStore.getState().actions.setCurrentTrack(next);
  });

  const syncBgmPlayback = useEffectEvent(() => {
    const map = bgmByPathRef.current;
    if (map.size === 0) return;

    const path = resolveBgmPath(currentTrackRef.current);
    const active = map.get(path);
    if (!active) return;

    if (isPlayingRef.current) {
      for (const [p, el] of map) {
        if (p !== path) {
          el.pause();
        }
      }
      const switched = lastStartedBgmPathRef.current !== path;
      if (switched) {
        active.currentTime = 0;
        lastStartedBgmPathRef.current = path;
      }
      active.volume = volumeRef.current;
      void active.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      for (const el of map.values()) {
        el.pause();
      }
    }
  });

  const soundOff = useEffectEvent(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    lastStartedBgmPathRef.current = null;
    for (const el of bgmByPathRef.current.values()) {
      el.pause();
      el.currentTime = 0;
    }
  });

  useLayoutEffect(() => {
    const map = new Map<string, HTMLAudioElement>();
    const elements: HTMLAudioElement[] = [];
    const endedHandlers: Array<{ el: HTMLAudioElement; fn: () => void }> = [];
    const donePaths = new Set<string>();
    let cancelled = false;

    const markPathReady = (path: string) => {
      if (cancelled || donePaths.has(path)) return;
      donePaths.add(path);
      if (donePaths.size !== bgmTrackUrls.length) return;

      bgmByPathRef.current = map;
      setBgmReady(true);

      const { settings, actions } = useCoreStore.getState();
      const { track } = settings.backgroundMusic;
      if (!track || !BGM_PATH_SET.has(track)) {
        actions.setCurrentTrack(pickRandomBgmPath());
      }
    };

    for (const url of bgmTrackUrls) {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.loop = false;
      elements.push(audio);
      map.set(url, audio);

      const finalize = (path: string) => {
        if (cancelled) return;
        markPathReady(path);
      };

      const onEnded = () => {
        if (cancelled) return;
        handleBgmTrackEnded(url);
      };
      audio.addEventListener("ended", onEnded);
      endedHandlers.push({ el: audio, fn: onEnded });

      audio.addEventListener(
        "loadeddata",
        () => {
          finalize(url);
        },
        { once: true },
      );
      audio.addEventListener(
        "error",
        () => {
          if (import.meta.env.DEV) {
            console.warn("[useSoundEffect] BGM 로드 실패:", url);
          }
          finalize(url);
        },
        { once: true },
      );
      audio.load();
    }

    return () => {
      cancelled = true;
      setBgmReady(false);
      donePaths.clear();
      for (const { el, fn } of endedHandlers) {
        el.removeEventListener("ended", fn);
      }
      for (const el of elements) {
        el.pause();
        el.removeAttribute("src");
        el.load();
      }
      map.clear();
      bgmByPathRef.current = new Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bgmReady) return;
    syncBgmPlayback();
  }, [bgmReady, isPlaying, currentTrack, syncBgmPlayback]);

  useEffect(() => {
    if (!bgmReady || !isPlaying) return;
    const path = resolveBgmPath(currentTrack);
    const active = bgmByPathRef.current.get(path);
    if (active) {
      active.volume = backgroundMusicVolume;
    }
  }, [backgroundMusicVolume, bgmReady, currentTrack, isPlaying]);

  const toggleSound = useCallback((checked: boolean) => {
    useCoreStore.getState().actions.changeEffectSound(checked);
  }, []);

  const toggleBackgroundMusic = useCallback((checked: boolean) => {
    useCoreStore.getState().actions.changeBackgroundMusic(checked);
  }, []);

  const changeBackgroundMusicVolume = useCallback((volume: number) => {
    useCoreStore.getState().actions.setBackgroundMusicVolume(volume);
  }, []);

  const clickSound = useEffectEvent(() => {
    playOneShot("click");
  });

  const playCardDraw = useEffectEvent(() => {
    playOneShot("pick");
  });
  const playCardMove = useEffectEvent(() => {
    playOneShot("move");
  });
  const playShuffleSound = useEffectEvent(() => {
    playOneShot("shuffle");
  });

  const winSound = useEffectEvent(() => {
    setTimeout(() => {
      const fanfareUrl = winSoundUrls.fanfare!;
      const popperUrl = winSoundUrls.popper!;

      const fanfareAudio = new Audio(fanfareUrl);
      const popperAudio = new Audio(popperUrl);
      fanfareAudio.volume = 0.5;
      popperAudio.volume = 0.5;
      void popperAudio.play().catch(() => {});
      setTimeout(() => {
        popperAudio.pause();
      }, ANIMATE_TIME * OFFSET_TIME);
      popperAudio.addEventListener(
        "pause",
        () => {
          void fanfareAudio.play().catch(() => {});
        },
        {
          once: true,
        },
      );
    }, OFFSET_TIME);
  });

  const actions = useMemo(
    () => ({
      toggleSound,
      toggleBackgroundMusic,
      changeBackgroundMusicVolume,
      soundOff,
      clickSound,
      /** 스택에서 카드를 뽑아 waste로 올릴 때 */
      playCardDraw,
      /** 그 외 이동(파운데이션/그라운드/템프 등) */
      playCardMove,
      /** waste를 스택으로 되돌릴 때 등 */
      playShuffleSound,
      winSound,
    }),
    [
      toggleSound,
      toggleBackgroundMusic,
      changeBackgroundMusicVolume,
      soundOff,
      clickSound,
      playCardDraw,
      playCardMove,
      playShuffleSound,
      winSound,
    ],
  );

  return { actions };
};
