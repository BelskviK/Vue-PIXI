export type SoundKey =
  | "chip"
  | "pop"
  | "win"
  | "bet"
  | "hovermine"
  | "softWin"
  | "explodedetect"
  | "minesSelect"
  | "win";

interface ISoundConfig {
  key: SoundKey;
  src: string;
  volume?: number;
}

export class SoundManager {
  private static _instance: SoundManager;
  private sounds = new Map<SoundKey, HTMLAudioElement>();

  /** Default sound list baked into the manager */
  private static defaultConfigs: ISoundConfig[] = [
    { key: "chip", src: "/assets/sounds/chip.mp3", volume: 0.5 },
    { key: "pop", src: "/assets/sounds/buttonclick.mp3", volume: 0.5 },
    { key: "win", src: "/assets/sounds/win.mp3", volume: 0.8 },
    { key: "bet", src: "/assets/sounds/big_button.mp3", volume: 0.8 },
    {
      key: "hovermine",
      src: "/assets/sounds/mouse_over_mine.mp3",
      volume: 0.8,
    },
    { key: "softWin", src: "/assets/sounds/soft_win.mp3", volume: 0.8 },
    {
      key: "explodedetect",
      src: "/assets/sounds/bomb_detect.mp3",
      volume: 0.8,
    },
    { key: "minesSelect", src: "/assets/sounds/mines_select.mp3", volume: 0.8 },
    { key: "win", src: "/assets/sounds/win.mp3", volume: 0.8 },
  ];

  private constructor(configs: ISoundConfig[]) {
    configs.forEach(({ key, src, volume = 1 }) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = volume;
      audio.load();
      this.sounds.set(key, audio);
    });
  }

  /** Init with either your own list, or fall back to the built-in defaults */
  public static init(configs?: ISoundConfig[]) {
    if (!SoundManager._instance) {
      SoundManager._instance = new SoundManager(
        configs ?? SoundManager.defaultConfigs
      );
    }
    return SoundManager._instance;
  }

  /** Instance getter */
  public static get instance(): SoundManager {
    if (!SoundManager._instance) {
      throw new Error(
        "SoundManager not initialized. Call SoundManager.init() first."
      );
    }
    return SoundManager._instance;
  }

  /** Play a sound by key */

  public play(key: SoundKey) {
    if (localStorage.getItem("soundEnabled") === "false") return;

    const audio = this.sounds.get(key);
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
  }
}
