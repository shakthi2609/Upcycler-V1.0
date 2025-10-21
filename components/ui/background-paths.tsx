"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from "./button";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    children,
    title = "Upcycle AI v2",
    buttonText = "Get Started",
    onButtonClick,
}: {
    children?: React.ReactNode;
    title?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 font-sans">
            <div className="absolute inset-0 pointer-events-none z-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10">
                {children ? children : (
                     <div className="w-full min-h-screen flex items-center justify-center">
                        <div className="container mx-auto px-4 md:px-6 text-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2 }}
                                className="max-w-4xl mx-auto"
                            >
                                <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                                    {words.map((word, wordIndex) => (
                                        <span
                                            key={wordIndex}
                                            className="inline-block mr-4 last:mr-0"
                                        >
                                            {word.split("").map((letter, letterIndex) => (
                                                <motion.span
                                                    key={`${wordIndex}-${letterIndex}`}
                                                    initial={{ y: 100, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{
                                                        delay:
                                                            wordIndex * 0.1 +
                                                            letterIndex * 0.03,
                                                        type: "spring",
                                                        stiffness: 150,
                                                        damping: 25,
                                                    }}
                                                    className="inline-block text-transparent bg-clip-text 
                                                    bg-gradient-to-r from-neutral-900 to-neutral-700/80"
                                                >
                                                    {letter}
                                                </motion.span>
                                            ))}
                                        </span>
                                    ))}
                                </h1>

                                <div
                                    className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl backdrop-blur-lg 
                                    overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                >
                                    <Button
                                        variant="ghost"
                                        onClick={onButtonClick}
                                        className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                                        bg-white/95 hover:bg-white/100 
                                        text-black
                                        transition-all duration-300 
                                        group-hover:-translate-y-0.5 border border-black/10
                                        hover:shadow-md"
                                    >
                                        <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                            {buttonText}
                                        </span>
                                        <span
                                            className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                            transition-all duration-300"
                                        >
                                            →
                                        </span>
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}