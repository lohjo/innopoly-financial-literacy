import { motion, useReducedMotion } from "motion/react";
import Lottie from "lottie-react";
import finnSticker from "../../assets/AnimatedSticker.json";

export type FinnExpression =
  | "neutral"
  | "attentive"
  | "curious"
  | "thinking"
  | "concerned"
  | "reassuring"
  | "celebrating"
  | "speaking"
  | "listening";

/** Finn — animated Lottie sticker (converted from a Telegram .tgs sticker).
    Animation wrapper (bounce on idle/celebrate) kept identical so every call
    site (<FinnAvatar expression="..." size={...} />) still works unchanged. */
export function FinnAvatar({
  expression = "neutral",
  size = 48,
}: {
  expression?: FinnExpression;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const e = expression;

  return (
    <motion.div
      role="img"
      aria-label={`Finn, ${e}`}
      style={{ width: size, height: size, display: "inline-block" }}
      animate={
        reduce
          ? undefined
          : e === "celebrating"
            ? { y: [0, -8, 0] }
            : { y: [0, -2, 0] }
      }
      transition={
        reduce
          ? undefined
          : e === "celebrating"
            ? { duration: 0.52, ease: "easeOut" }
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <Lottie
        animationData={finnSticker}
        loop
        autoplay={!reduce}
        style={{ width: "100%", height: "100%" }}
      />
    </motion.div>
  );
}