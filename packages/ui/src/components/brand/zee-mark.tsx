import { motion } from "motion/react";
import { spring } from "../../lib/motion";

const ink = "#3dd68c"; // terminal green
const night = "#0c1a12"; // tile: near-black with a hint of green
const unlit = "rgb(255 255 255 / 0.22)";
const lights = ["#ff5f57", "#febc2e", "#28c840"]; // macOS window buttons
const center = { originX: "50%", originY: "50%" } as const;

/**
 * The zee mark: a lowercase z on a dark tile. When a parent Motion element enters its hover
 * state, the tile turns into a tiny terminal window: the z moves to the prompt, the title-bar
 * dots appear and light up, and a caret grows in and blinks.
 */
export default function ZeeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} overflow="visible">
      <rect x="0.25" y="0.25" width="23.5" height="23.5" rx="5.75" fill={night} stroke="rgb(255 255 255 / 0.14)" strokeWidth="0.5" />
      {[4.75, 7.5, 10.25].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="4.75"
          r="1.1"
          style={center}
          variants={{
            rest: { opacity: 0, scale: 0.4, fill: unlit, transition: spring },
            hover: {
              opacity: 1,
              scale: 1,
              fill: [unlit, lights[i]],
              transition: { ...spring, delay: 0.04 + i * 0.05, fill: { duration: 0.25, delay: 0.22 + i * 0.08 } },
            },
          }}
        />
      ))}
      {/* At rest the z sits centered and slightly larger; on hover it moves to the prompt position. */}
      <motion.path
        d="M6.5 11h6l-6 6.5h6"
        fill="none"
        stroke={ink}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={center}
        variants={{ rest: { x: 2.5, y: -2.25, scale: 1.25 }, hover: { x: 0, y: 0, scale: 1 } }}
        transition={spring}
      />
      <motion.rect
        x="15.25"
        y="10"
        width="1.75"
        height="8.5"
        rx="0.875"
        fill={ink}
        style={{ originX: "50%", originY: "100%" }}
        variants={{
          rest: { opacity: 0, scaleY: 0.2, transition: spring },
          hover: {
            scaleY: 1,
            opacity: [0, 1, 1, 0, 1, 0, 1],
            transition: { scaleY: { ...spring, delay: 0.1 }, opacity: { duration: 1.6, delay: 0.1, times: [0, 0.08, 0.4, 0.5, 0.65, 0.75, 0.9] } },
          },
        }}
      />
    </svg>
  );
}
