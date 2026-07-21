import { motion } from "framer-motion";

/** A node in the medical AI network (percentage coordinates on a 0–100 grid). */
interface Node {
  x: number;
  y: number;
  r: number;
}

const NODES: Node[] = [
  { x: 18, y: 20, r: 3 },
  { x: 40, y: 12, r: 2 },
  { x: 68, y: 22, r: 3.5 },
  { x: 84, y: 40, r: 2.5 },
  { x: 30, y: 46, r: 2.5 },
  { x: 55, y: 52, r: 4 },
  { x: 76, y: 66, r: 2.5 },
  { x: 20, y: 72, r: 3 },
  { x: 44, y: 80, r: 2.5 },
  { x: 64, y: 88, r: 3 },
];

/** Pairs of node indices to connect with an animated edge. */
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 2],
  [5, 6],
  [6, 3],
  [4, 7],
  [7, 8],
  [8, 5],
  [8, 9],
  [9, 6],
];

/**
 * Decorative, animated "medical AI network" rendered behind the left panel:
 * connected nodes (clinics / AI nodes) with pulsing links plus soft gradient
 * blooms. Purely presentational and hidden from assistive technology.
 */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft gradient blooms */}
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-hc-secondary/25 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-hc-accent/20 blur-3xl" />
      <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-hc-primary/20 blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {EDGES.map(([a, b], i) => (
          <motion.line
            key={`e-${i}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="white"
            strokeWidth={0.25}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.1 }}
            animate={{ pathLength: 1, opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: 4,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {NODES.map((node, i) => (
          <motion.circle
            key={`n-${i}`}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="white"
            initial={{ opacity: 0.25, scale: 0.8 }}
            animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{
              duration: 3.5,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          />
        ))}
      </svg>
    </div>
  );
}
