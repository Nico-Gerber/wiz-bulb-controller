import { motion } from "framer-motion";

const RED = "#B91C1C";

function PopUp({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 24, x: "-50%" }}
      transition={{ duration: 0.28 }}
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        zIndex: 2000,
        transform: "translateX(-50%)",
        backgroundColor: "white",
        color: "#111",
        padding: "12px 18px",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        minWidth: "220px",
        maxWidth: "90%",
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: 4, background: RED }} />
      <div style={{ lineHeight: 1.2 }}>{text}</div>
    </motion.div>
  );
}

export default PopUp;