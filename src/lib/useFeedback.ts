"use client";

import { useCallback } from "react";
import { useHabits } from "./store";
import { haptic, playSound, type SoundName } from "./sound";

/** Som + vibração respeitando a preferência do usuário. */
export function useFeedback() {
  const { settings } = useHabits();
  return useCallback(
    (name: SoundName, vibrate = 8) => {
      playSound(name, settings.sound);
      haptic(vibrate);
    },
    [settings.sound]
  );
}
