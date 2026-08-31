import { useState } from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  const [isVideoReady, setIsVideoReady] = useState(false);

  return (
    <section className="relative isolate bg-navy overflow-hidden">
      {/* Background video stays centered without manual horizontal or vertical offsets. */}
      <video
        className={`absolute inset-0 h-full w-full object-cover object-[center_45%] transition-opacity duration-1000 motion-reduce:hidden ${
          isVideoReady ? 'opacity-75' : 'opacity-0'
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onCanPlay={() => setIsVideoReady(true)}
        onError={() => setIsVideoReady(false)}
      >
        <source src="/videos/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Contrast layer keeps the hero copy readable over bright footage. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/25"
        aria-hidden="true"
      />

      {/* Subtle grid background */}
      <motion.div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 1.2 }}
        aria-hidden="true"
      />
      {/* Soft glow */}
      <motion.div
        className="absolute -top-32 right-0 w-[480px] h-[480px] rounded-full bg-cyan/10 blur-[120px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 lg:py-24">
        <motion.div
          className="max-w-3xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
            <motion.p variants={item} className="text-cyan text-[11px] font-semibold uppercase tracking-[0.2em] mb-5">
              Sakarya Üniversitesi · Bilgisayar Mühendisliği
            </motion.p>

            <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.15] tracking-tight">
              SARGEM <span className="text-cyan">CyberSense</span> Laboratuvarı
            </motion.h1>

            <motion.p variants={item} className="mt-6 text-white/65 text-base leading-relaxed max-w-xl">
              Siber güvenlik, yapay zeka, IoT ve MIoT alanlarında öncü araştırmalar
              yürüten Sakarya Üniversitesi'nin uzmanlaşmış araştırma laboratuvarı.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3 mt-9">
              <motion.a
                href="#research"
                className="btn-cyber"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fa fa-flask text-sm" /> Araştırmalarımız
              </motion.a>
              <motion.a
                href="#team"
                className="btn-outline"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className="fa fa-users text-sm" /> Ekibimiz
              </motion.a>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
