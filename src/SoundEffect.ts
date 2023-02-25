import credit from "./assets/sound-effect/credit.wav";
import death_1 from "./assets/sound-effect/death_1.wav";
import death_2 from "./assets/sound-effect/death_2.wav";
import eat_fruit from "./assets/sound-effect/eat_fruit.wav";
import eat_ghost from "./assets/sound-effect/eat_ghost.wav";
import extend from "./assets/sound-effect/extend.wav";
import game_start from "./assets/sound-effect/game_start.wav";
import intermission from "./assets/sound-effect/intermission.wav";
import munch_1 from "./assets/sound-effect/munch_1.wav";
import munch_2 from "./assets/sound-effect/munch_2.wav";
import power_pellet from "./assets/sound-effect/power_pellet.wav";
import retreating from "./assets/sound-effect/retreating.wav";
import siren_1 from "./assets/sound-effect/siren_1.wav";
import siren_2 from "./assets/sound-effect/siren_2.wav";

export class SoundEffect {
  private audioRefs = {
    credit: new Audio(credit),
    death_1: new Audio(death_1),
    death_2: new Audio(death_2),
    eat_fruit: new Audio(eat_fruit),
    eat_ghost: new Audio(eat_ghost),
    extend: new Audio(extend),
    game_start: new Audio(game_start),
    intermission: new Audio(intermission),
    munch_1: new Audio(munch_1),
    munch_2: new Audio(munch_2),
    power_pellet: new Audio(power_pellet),
    retreating: new Audio(retreating),
    siren_1: new Audio(siren_1),
    siren_2: new Audio(siren_2),
  };
  constructor() {
    for (let name in this.audioRefs) {
      document
        .querySelector("body")!
        .appendChild(this.audioRefs[name as keyof typeof this.audioRefs]);
    }
  }
  public play(
    name: keyof typeof this.audioRefs,
    options?: {
      seekToBeginning?: boolean;
      infinite?: boolean;
    }
  ) {
    return new Promise<void>((res, rej) => {
      const audioRef = this.audioRefs[name];
      const handleEnd = () => {
        audioRef.removeEventListener("ended", handleEnd);
        audioRef.removeEventListener("cancel", handleEnd);
        res();
      };
      audioRef.addEventListener("ended", handleEnd);
      audioRef.addEventListener("cancel", handleEnd);
      if (options?.seekToBeginning) {
        audioRef.currentTime = 0;
      }
      audioRef.play();
      audioRef.loop = options?.infinite || false;
    });
  }

  public stop(...names: (keyof typeof this.audioRefs)[]) {
    names.forEach((name) => {
      const audioRef = this.audioRefs[name];
      audioRef.pause();
    });
  }
  public stopAll() {
    for (let name in this.audioRefs) {
      const audio = this.audioRefs[name as keyof typeof this.audioRefs];
      audio.pause();
    }
  }
}
