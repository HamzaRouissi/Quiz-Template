"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Each pair represents a correct mapping between a left label and a right label.

type Pair = { left: string; right: string };


// Sample dataset for the matching exercise. 
const PAIRS: Pair[] = [
  { left: "Apple", right: "Fruit" },
  { left: "Car", right: "Vehicle" },
  { left: "Blue", right: "Color" },
  { left: "Dog", right: "Animal" },
];

type Connection = { leftIdx: number; rightIdx: number };

export default function MatchingPage() {
  const QUESTION = "Match each item on the left with its correct category.";
  const leftItems = useMemo(() => PAIRS.map((p) => p.left), []);
  
  //  // Right column labels are shuffled to randomize ordering
  const rightItems = useMemo(() => shuffle(PAIRS.map((p) => p.right)), []);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [result, setResult] = useState<"" | "correct" | "error">("");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);

  const connectionLines = useConnectionLines(leftRefs, rightRefs, connections);

  // manage clicking on left items (select/deselect)

  function onLeftClick(idx: number) {
    setSelectedLeft((prev) => (prev === idx ? null : idx));
    setResult("");
  }

  function onRightClick(idx: number) {
    if (selectedLeft === null) return;
    const exists = connections.find((c) => c.leftIdx === selectedLeft || c.rightIdx === idx);
    if (exists) return; // prevent multiple connections per side (one to one))
    setConnections((prev) => [...prev, { leftIdx: selectedLeft, rightIdx: idx }]);
    setSelectedLeft(null);
    setResult("");
  }

  function reset() {
    setConnections([]);
    setSelectedLeft(null);
    setResult("");
  }

    // Verify if all connections are correct

  function verify() {
    if (connections.length !== PAIRS.length) {
      setResult("error");
      return;
    }
    const rightToIdx = new Map<string, number>();
    rightItems.forEach((r, i) => rightToIdx.set(r, i));

        // Check each connection against the correct pairs

    const correct = connections.every((c) => {
      const leftLabel = leftItems[c.leftIdx];

      // find expected right label for this left

      const expectedRight = PAIRS.find((p) => p.left === leftLabel)!.right;
      const actualRightIdx = c.rightIdx;
      return rightItems[actualRightIdx] === expectedRight;
    });
    setResult(correct ? "correct" : "error");
  }
 
    // Remove a specific connection object

  function removeConnection(c: Connection) {
    setConnections((prev) => prev.filter((x) => !(x.leftIdx === c.leftIdx && x.rightIdx === c.rightIdx)));
    setResult("");
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="flex items-center gap-3 p-4 border-b border-black/10 dark:border-white/10">
        <Link href="/" className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition text-sm">
          ← Back
        </Link>
        <h1 className="text-lg sm:text-xl font-medium">Matching the correct answer</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={reset} className="px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm">
            Clear
          </button>
          <button onClick={verify} className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 text-sm">
            Verify
          </button>
        </div>
      </header>

      <section className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl mb-4 text-center text-sm sm:text-base text-black/70 dark:text-white/70">
          {QUESTION}
        </div>
        <div className="relative mx-auto max-w-4xl">
          <svg ref={svgRef} className="pointer-events-none absolute inset-0 w-full h-full">
            {connectionLines.map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
               
              />
            ))}
          </svg>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              {leftItems.map((label, i) => (
                <div key={i} className="relative">
                  <div
                    ref={(el) => {
                      leftRefs.current[i] = el;
                    }}
                    onClick={() => onLeftClick(i)}
                    className={
                      "select-none cursor-pointer rounded-lg border border-black/10 dark:border-white/10 p-3 sm:p-4 bg-white/60 dark:bg-white/10 " +
                      (selectedLeft === i 
                        ? "ring-2 ring-blue-500 ring-inset" 
                        : "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0")
                    }
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {rightItems.map((label, i) => (
                <div key={i} className="relative">
                  <div
                    ref={(el) => {
                      rightRefs.current[i] = el;
                    }}
                    onClick={() => onRightClick(i)}
                    className="select-none cursor-pointer rounded-lg border border-black/10 dark:border-white/10 p-3 sm:p-4 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {connections.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {connections.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-black/10 dark:border-white/10 p-2 bg-white/50 dark:bg-white/5">
                  <span>
                    {leftItems[c.leftIdx]} → {rightItems[c.rightIdx]}
                  </span>
                  <button onClick={() => removeConnection(c)} className="px-2 py-1 rounded border border-black/10 dark:border-white/10">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {result !== "" && (
            <div className="mt-6 text-center">
              {result === "correct" ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white">Correct ✔</div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white">Try again ✖</div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function useConnectionLines(
  leftRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  rightRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  connections: Connection[]
) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  const compute = useCallback(() => {
    const sortedConnections = [...connections].sort((a, b) => a.leftIdx - b.leftIdx);
    
    const newLines = sortedConnections.map((c) => {
      const l = leftRefs.current[c.leftIdx];
      const r = rightRefs.current[c.rightIdx];
      if (!l || !r) return { x1: 0, y1: 0, x2: 0, y2: 0 };
      const lb = l.getBoundingClientRect();
      const rb = r.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
      return {
        x1: lb.right + scrollX,
        y1: lb.top + lb.height / 2 + scrollY,
        x2: rb.left + scrollX,
        y2: rb.top + rb.height / 2 + scrollY,
      };
    });
    setLines(newLines);
  }, [connections, leftRefs, rightRefs]);


    // Recalculate lines when connections change or window resizes/scrolling

  useEffect(() => {
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [compute]);

  return lines;
}
// Fisher-Yates shuffle algorithm

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}