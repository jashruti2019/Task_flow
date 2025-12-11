import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import "./Landing.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const glowA = useRef(null);
  const glowB = useRef(null);
  const mockMain = useRef(null);

  useEffect(() => {
    try {
      gsap.to(glowA.current, {
        duration: 6,
        x: -30,
        y: -10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(glowB.current, {
        duration: 7,
        x: 20,
        y: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(mockMain.current, {
        duration: 5,
        y: -12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } catch {}
  }, []);

  return (
    <div className="landing-dark">
      {/* background glows */}
      <div className="glowA" ref={glowA} />
      <div className="glowB" ref={glowB} />

      {/* Branding - big TaskFlow */}
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="brand-title"
      >
        TaskFlow
      </motion.h1>

      {/* main hero title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.12, duration: 0.6 }}
        className="hero-title"
      >
        Manage Your Task.
      </motion.div>

      {/* subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="hero-sub"
      >
        Organize, prioritize and visualize your work — with a timeline, Kanban-like cards, and smart reminders.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="cta-row"
      >
        <button className="cta-main" onClick={() => navigate("/tasks")}>
          Get Started
        </button>

        <button
          className="cta-ghost"
          onClick={() => window.scrollTo({ top: 720, behavior: "smooth" })}
        >
          Learn More
        </button>
      </motion.div>

      {/* mockups */}
      <section className="mockup-section">
        <div className="mock-wrap">
          {/* MAIN MOCKUP */}
          <motion.div
            ref={mockMain}
            className="mock-main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            <img
              src="/mockup-hero.png.png"   // your actual file
              alt="Main Preview"
              className="mock-image"
            />
          </motion.div>

          {/* LEFT CARD */}
          <motion.div
            className="mock-card mock-left"
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <img
              src="/left.png"     // your file
              alt="Small Left Preview"
              className="mock-image"
            />
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            className="mock-card mock-right"
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.72, duration: 0.6 }}
          >
            <img
              src="/mocup.png"    // your file
              alt="Small Right Preview"
              className="mock-image"
            />
          </motion.div>
        </div>
      </section>

      {/* feature section */}
      <section className="features-strip" id="features">
        <motion.div className="feature" whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="feature-icon">📅</div>
          <h4>Timeline View</h4>
          <p>See tasks on a calendar-like timeline.</p>
        </motion.div>

        <motion.div className="feature" whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="feature-icon">⚡</div>
          <h4>Fast Search</h4>
          <p>Filter and find tasks instantly.</p>
        </motion.div>

        <motion.div className="feature" whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="feature-icon">🔁</div>
          <h4>Smooth Animations</h4>
          <p>Polished micro-interactions everywhere.</p>
        </motion.div>
      </section>
    </div>
  );
}
