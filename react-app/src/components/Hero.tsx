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
  return (
    <section className="relative bg-navy overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            className="lg:col-span-7"
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

          {/* Right: SARGEM logo card */}
          <div className="lg:col-span-5 hidden lg:flex justify-center">
            <motion.div
              className="relative w-72"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-navy-light to-navy border border-cyan/15
                              flex flex-col items-center justify-center shadow-2xl shadow-black/30">
                {/* Top accent */}
                <div className="absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />

                {/* SARGEM logo */}
                <img
                  src="/logos/sargem.svg"
                  alt="SARGEM CyberSense Laboratuvarı logosu"
                  className="w-28 h-28 drop-shadow-[0_0_24px_rgba(0,200,232,0.35)]"
                  loading="eager"
                />
                <span className="mt-5 text-white text-sm font-bold tracking-wide">SARGEM CyberSense</span>
                <span className="mt-1 text-white/40 text-[11px] uppercase tracking-[0.25em]">Araştırma Laboratuvarı</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
