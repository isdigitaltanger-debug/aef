import { motion } from "framer-motion";

export default function KineticTitle({ lines, className = "", lineClassName = "" }) {
  return (
    <h1 className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "112%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.95, delay: 0.12 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
