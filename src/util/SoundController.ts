import {
  audioTracks,
  effectSoundNames,
  effectSounds,
  type EffectSoundName,
} from "@/config/variable";

export class SoundController {
  audioTracks: HTMLAudioElement[];
  effectSounds: Record<EffectSoundName, HTMLAudioElement>;

  constructor() {
    this.audioTracks = audioTracks;
    this.effectSounds = effectSounds;
  }

  playAudioTrack(index: number) {
    this.audioTracks[index].play();
  }

  pickSound() {
    this.effectSounds[effectSoundNames.pick].play();
  }

  shuffleSound() {
    this.effectSounds[effectSoundNames.shuffle].playbackRate = 0.8;
    this.effectSounds[effectSoundNames.shuffle].play();
  }
}
