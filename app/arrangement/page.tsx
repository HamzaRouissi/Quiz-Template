"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const SAMPLE_WORDS = ["HELLO", "WORLD", "REACT"] as const;

type Slot = {
  id: string;
  letter: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordArrangementPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const targetWord = SAMPLE_WORDS[wordIndex];

  const letters = useMemo(() => targetWord.split(""), [targetWord]);
  const [slots, setSlots] = useState<Slot[]>(() =>
    letters.map((_, i) => ({ id: `slot-${i}`, letter: null }))
  );
  const [bank, setBank] = useState<string[]>(() => shuffle(letters));
  const [result, setResult] = useState<"" | "correct" | "error">("");

  function resetForWord(index: number) {
    const newWord = SAMPLE_WORDS[index];
    const newLetters = newWord.split("");
    setSlots(newLetters.map((_, i) => ({ id: `slot-${i}`, letter: null })));
    setBank(shuffle(newLetters));
    setResult("");
  }

  function goNext() {
    const next = (wordIndex + 1) % SAMPLE_WORDS.length;
    setWordIndex(next);
    resetForWord(next);
  }

  function onDragStart(
    e: React.DragEvent<HTMLButtonElement>,
    letter: string,
    source: string,
    meta?: { bankIdx?: number; slotIdx?: number }
  ) {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ letter, source, bankIdx: meta?.bankIdx, slotIdx: meta?.slotIdx })
    );
  }

  function onDropToSlot(e: React.DragEvent<HTMLDivElement>, slotIdx: number) {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;
    const { letter, source, bankIdx: draggedBankIdx, slotIdx: draggedSlotIdx } = JSON.parse(payload) as {
      letter: string;
      source: string;
      bankIdx?: number;
      slotIdx?: number;
    };

    setSlots((prev) => {
      const copy = prev.map((s) => ({ ...s }));
      if (copy[slotIdx].letter) return prev;
      copy[slotIdx].letter = letter;
      return copy;
    });

    if (source === "bank") {
      setBank((prev) => prev.filter((_, idx) => idx !== draggedBankIdx));
    } else if (source.startsWith("slot:")) {
      const from = draggedSlotIdx ?? parseInt(source.split(":")[1], 10);
      setSlots((prev) => {
        const copy = prev.map((s) => ({ ...s }));
        copy[from].letter = null;
        return copy;
      });
    }
    setResult("");
  }

  function onDropBackToBank(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;
    const { letter, source, slotIdx: draggedSlotIdx } = JSON.parse(payload) as {
      letter: string;
      source: string;
      slotIdx?: number;
    };

    if (source === "bank") return;

    if (source.startsWith("slot:")) {
      const from = draggedSlotIdx ?? parseInt(source.split(":")[1], 10);
      setSlots((prev) => {
        const copy = prev.map((s) => ({ ...s }));
        if (!copy[from].letter) return prev;
        copy[from].letter = null;
        return copy;
      });
      setBank((prev) => [...prev, letter]);
      setResult("");
    }
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  function verify() {
    const assembled = slots.map((s) => s.letter ?? "").join("");
    if (assembled.length !== targetWord.length) {
      setResult("error");
      return;
    }
    setResult(assembled === targetWord ? "correct" : "error");
  }

  function clearSlots() {
    const lettersBack = slots.map((s) => s.letter).filter((l): l is string => Boolean(l));
    setSlots(slots.map((s) => ({ ...s, letter: null })));
    setBank((prev) => shuffle([...prev, ...lettersBack]));
    setResult("");
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="flex items-center gap-3 p-4 border-b border-black/10 dark:border-white/10">
        <Link href="/" className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition text-sm">
          ← Back
        </Link>
        <h1 className="text-lg sm:text-xl font-medium">Word Arrangement</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={clearSlots} className="px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm">Clear</button>
          <button onClick={verify} className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 text-sm">Verify</button>
          <button onClick={goNext} className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 text-sm">Next word</button>
        </div>
      </header>

      <section className="flex-1 p-4 sm:p-6 md:p-8 grid place-items-center">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-sm">
              Word: <span className="font-mono tracking-widest">{targetWord}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {slots.map((slot, idx) => (
              <div
                key={slot.id}
                onDrop={(e) => onDropToSlot(e, idx)}
                onDragOver={allowDrop}
                className="h-14 w-14 sm:h-16 sm:w-16 grid place-items-center rounded-lg border-2 border-dashed border-black/20 dark:border-white/20 bg-white/40 dark:bg-white/5"
              >
                {slot.letter ? (
                  <button
                    draggable
                    onDragStart={(e) => onDragStart(e, slot.letter as string, `slot:${idx}` as string, { slotIdx: idx })}
                    className="h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-md bg-black text-white dark:bg-white dark:text-black font-semibold text-lg"
                  >
                    {slot.letter}
                  </button>
                ) : (
                  <span className="text-xs text-black/40 dark:text-white/40">Drop</span>
                )}
              </div>
            ))}
          </div>

          <div
            onDrop={onDropBackToBank}
            onDragOver={allowDrop}
            className="min-h-24 rounded-xl border border-black/10 dark:border-white/10 p-3 sm:p-4 bg-white/50 dark:bg-white/5"
          >
            <div className="flex flex-wrap gap-2">
              {bank.map((l, i) => (
                <button
                  key={`${l}-${i}`}
                  draggable
                  onDragStart={(e) => onDragStart(e, l, "bank", { bankIdx: i })}
                  className="h-10 w-10 sm:h-12 sm:w-12 grid place-items-center rounded-md bg-black text-white dark:bg-white dark:text-black font-semibold text-lg"
                >
                  {l}
                </button>
              ))}
              {bank.length === 0 && (
                <div className="text-sm text-black/50 dark:text-white/50">Drag letters back here to change</div>
              )}
            </div>
          </div>

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


