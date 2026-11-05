"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";

const stages = [
  {
    name: "Muammo",
    text: "Haqiqiy muammoni toping yoki o’zingiz e’lon qiling.",
    color: "#e548ff",
  },
  {
    name: "Jamoa",
    text: "Ko’nikmalaringizga mos jamoaga qo’shiling.",
    color: "#00d5ff",
  },
  {
    name: "Loyiha",
    text: "Birga yechim yarating va rivojlantiring.",
    color: "#8b35ff",
  },
  {
    name: "Namoyish",
    text: "Tayyor loyihani butun dunyoga ko’rsating.",
    color: "#286bff",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-3xl"
      >
        <motion.h1
          variants={item}
          className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
        >
          Haqiqiy muammolarni birga yechamiz
        </motion.h1>
        <motion.p variants={item} className="mt-6 max-w-xl text-lg text-mist">
          FutureWorks muammo topgan, g’oyasi bor va jamoa qidirayotgan odamlarni
          bir joyga to’playdi. Hammasini hisobsiz ham ko’rishingiz mumkin.
        </motion.p>
        <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/problems"
            className="rounded-full bg-problem px-7 py-3 font-semibold text-night shadow-[0_0_30px_rgba(229,72,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_44px_rgba(229,72,255,0.59)]"
          >
            Muammolarni ko’rish
          </Link>
          <Link
            href="/new"
            className="rounded-full border border-team/60 px-7 py-3 font-semibold text-team transition hover:-translate-y-0.5 hover:bg-team/10"
          >
            Muammo e’lon qilish
          </Link>
        </motion.div>
      </motion.div>

      <div className="mt-24">
        <h2 className="mb-10 font-display text-xl font-bold sm:text-2xl">
          Fikr loyihaga qanday aylanadi
        </h2>

        <div className="relative">
          {/* Yorug'lik ipi: kompyuterda gorizontal */}
          <motion.div
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-[13px] hidden h-0.5 origin-left bg-[linear-gradient(90deg,#e548ff,#00d5ff,#8b35ff,#286bff)] md:block"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, delay: 0.7, ease: "easeInOut" }}
          />
          {/* Ip bo'ylab yuguruvchi nur */}
          <motion.span
            aria-hidden
            className="absolute top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_18px_6px_rgba(255,255,255,0.7)] md:block"
            initial={{ opacity: 0, left: "12.5%" }}
            animate={{ opacity: [0, 1, 1, 0], left: ["12.5%", "87.5%"] }}
            transition={{
              duration: 3.6,
              delay: 2.6,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: "linear",
            }}
          />
          {/* Telefonda vertikal */}
          <motion.div
            aria-hidden
            className="absolute bottom-16 left-[11px] top-3 w-0.5 origin-top bg-[linear-gradient(180deg,#e548ff,#00d5ff,#8b35ff,#286bff)] md:hidden"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.6, delay: 0.7, ease: "easeInOut" }}
          />

          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {stages.map((s, i) => (
              <motion.li
                key={s.name}
                className="relative pl-12 md:pl-0 md:pt-12 md:text-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.3 }}
              >
                <motion.span
                  className="absolute left-0 top-0.5 h-6 w-6 rounded-full md:left-1/2 md:-translate-x-1/2"
                  style={{ background: s.color, boxShadow: `0 0 24px ${s.color}` }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    duration: 2.4,
                    delay: 1.5 + i * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <h3
                  className="font-display text-lg font-bold"
                  style={{ color: s.color }}
                >
                  {s.name}
                </h3>
                <p className="mt-2 text-sm text-mist">{s.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
