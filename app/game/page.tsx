"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ----------------------------------------------------
// MATH EXPRESSION POOL DEFINITION
// ----------------------------------------------------
interface MathTargetType {
  text: string;
  isReal: boolean;
}

const MATH_POOL: MathTargetType[] = [
  // --- 실수 (Real Numbers) ---
  { text: "5", isReal: true },
  { text: "-12", isReal: true },
  { text: "0", isReal: true },
  { text: "3.14", isReal: true },
  { text: "3/4", isReal: true },
  { text: "-8/3", isReal: true },
  { text: "√2", isReal: true },
  { text: "√5", isReal: true },
  { text: "π", isReal: true },
  { text: "e", isReal: true },
  { text: "i²", isReal: true },        // i^2 = -1 (실수)
  { text: "i⁴", isReal: true },        // i^4 = 1 (실수)
  { text: "(2i)²", isReal: true },     // -4 (실수)
  { text: "(1-i)(1+i)", isReal: true },// 2 (실수)
  { text: "log(10)", isReal: true },   // 1 (실수)
  { text: "cos(π)", isReal: true },    // -1 (실수)
  { text: "0.333...", isReal: true },  // 1/3 (실수)
  { text: "-√16", isReal: true },      // -4 (실수)
  { text: "e^(iπ)", isReal: true },    // -1 (실수, 오일러 항등식)

  // --- 허수 (Imaginary/Complex Numbers) ---
  { text: "3i", isReal: false },
  { text: "-i", isReal: false },
  { text: "2 + i", isReal: false },
  { text: "3 - 2i", isReal: false },
  { text: "-5 + 4i", isReal: false },
  { text: "√-4", isReal: false },      // 2i (허수)
  { text: "√-9", isReal: false },      // 3i (허수)
  { text: "√-2", isReal: false },      // i√2 (허수)
  { text: "i³", isReal: false },       // -i (허수)
  { text: "i⁵", isReal: false },       // i (허수)
  { text: "1/i", isReal: false },      // -i (허수)
  { text: "(1+i)²", isReal: false },    // 2i (허수)
  { text: "√-7", isReal: false },      // i√7 (허수)
  { text: "x + yi (y≠0)", isReal: false },
  { text: "3i + √2", isReal: false }
];

// ----------------------------------------------------
// CANVAS GRAPHICS GAME OBJECT INTERFACES
// ----------------------------------------------------
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Target {
  id: number;
  text: string;
  isReal: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  glow: number;
  pulseSpeed: number;
  pulseTimer: number;
}

interface Laser {
  x: number;
  y: number;
  vy: number;
  radius: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

// ----------------------------------------------------
// SOUND SYNTHESIZER UTILITY (Web Audio API)
// ----------------------------------------------------
class SoundSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playLaser() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.error(e);
    }
  }

  playCorrect() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      // 1. Synth Beep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.error(e);
    }
  }

  playIncorrect() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.error(e);
    }
  }

  playMissionChange() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.type = "sine";
      osc2.type = "triangle";
      
      osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.4);
      osc2.frequency.setValueAtTime(444, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(888, this.ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.5);
      osc2.stop(this.ctx.currentTime + 0.5);
    } catch (e) {
      console.error(e);
    }
  }

  playGameOver() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(392.00, this.ctx.currentTime); // G4
      osc.frequency.setValueAtTime(349.23, this.ctx.currentTime + 0.15); // F4
      osc.frequency.setValueAtTime(311.13, this.ctx.currentTime + 0.3); // Eb4
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.8);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {
      console.error(e);
    }
  }
}

const synth = typeof window !== "undefined" ? new SoundSynth() : null;

// ----------------------------------------------------
// LEADERBOARD RECORD INTERFACE
// ----------------------------------------------------
interface ScoreRecord {
  id?: string;
  created_at?: string;
  player_name: string;
  score: number;
  correct_hits: number;
  incorrect_hits: number;
  accuracy: number;
  survival_time: number;
}

export default function MathShooterGame() {
  // Game state flow: 'START' | 'PLAYING' | 'GAMEOVER'
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAMEOVER">("START");

  // Leaderboard lists
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  // Form states
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Game Stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [mission, setMission] = useState<"REAL" | "IMAGINARY">("REAL");
  const [correctHits, setCorrectHits] = useState(0);
  const [incorrectHits, setIncorrectHits] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);

  // Game screen visual alert state (Mission Changed)
  const [alertText, setAlertText] = useState("");
  const [alertOpacity, setAlertOpacity] = useState(0);

  // Canvas and Physics Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const missionRef = useRef(mission);
  const correctHitsRef = useRef(correctHits);
  const incorrectHitsRef = useRef(incorrectHits);
  const startTimeRef = useRef<number | null>(null);

  // Controls
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mouseX = useRef<number | null>(null);
  const mouseClicked = useRef(false);

  // Keep refs in sync with state for access in the high-frequency animation loop
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { missionRef.current = mission; }, [mission]);
  useEffect(() => { correctHitsRef.current = correctHits; }, [correctHits]);
  useEffect(() => { incorrectHitsRef.current = incorrectHits; }, [incorrectHits]);

  // Load Leaderboard on Mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      // Mock data fallback if Supabase is offline/not set up
      setLeaderboard([
        { player_name: "수학마스터", score: 3500, correct_hits: 30, incorrect_hits: 1, accuracy: 96.7, survival_time: 120 },
        { player_name: "아인슈타인", score: 2800, correct_hits: 24, incorrect_hits: 2, accuracy: 92.3, survival_time: 95 },
        { player_name: "오일러", score: 2200, correct_hits: 20, incorrect_hits: 3, accuracy: 87.0, survival_time: 80 }
      ]);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // Keyboard and canvas window-resize event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (e.key === " " && gameStateRef.current === "PLAYING") {
        // Prevent browser spacebar scroll
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main Game Loop Effect
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Make canvas fill its parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 550; // fixed heights are easier to calculate physics
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Spaceship config
    const ship = {
      x: canvas.width / 2,
      y: canvas.height - 45,
      width: 40,
      height: 40,
      speed: 7,
      shieldActive: false,
      shieldGlow: 0
    };

    // Stars background initialization
    const stars: Star[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: 0.5 + Math.random() * 2
      });
    }

    // Game objects arrays
    let targets: Target[] = [];
    let lasers: Laser[] = [];
    let particles: Particle[] = [];

    // Timers
    let targetSpawnTimer = 0;
    let targetSpawnInterval = 130; // frames
    let missionTimer = 0;
    const missionInterval = 900; // 900 frames = 15 seconds at 60fps
    let gameTimerInterval: NodeJS.Timeout;

    // Reset game stats on run loop
    setScore(0);
    setLives(3);
    setMission("REAL");
    setCorrectHits(0);
    setIncorrectHits(0);
    setSurvivalTime(0);
    startTimeRef.current = Date.now();

    // Trigger initial alert
    setAlertText("🚀 MISSION START: Shoot Real Numbers! (실수)");
    setAlertOpacity(1);
    synth?.playMissionChange();

    // Track survival time in seconds
    gameTimerInterval = setInterval(() => {
      if (gameStateRef.current === "PLAYING") {
        setSurvivalTime((t) => t + 1);
      }
    }, 1000);

    let laserCooldown = 0;
    let targetIdCounter = 0;

    // Animation frame handle
    let animationFrameId: number;

    const gameLoop = () => {
      if (gameStateRef.current !== "PLAYING") return;

      // 1. Canvas clearing and background rendering (Space Nebula effect)
      ctx.fillStyle = "#03001e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle color glows matching the active mission
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.7
      );
      if (missionRef.current === "REAL") {
        // Teal glow for Real numbers
        grad.addColorStop(0, "rgba(0, 180, 216, 0.08)");
        grad.addColorStop(1, "transparent");
      } else {
        // Purple/Pink glow for Imaginary numbers
        grad.addColorStop(0, "rgba(224, 86, 253, 0.08)");
        grad.addColorStop(1, "transparent");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Parallax Stars
      ctx.fillStyle = "#ffffff";
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Spaceship Movement Control
      // Keyboard
      if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"] || keysPressed.current["A"]) {
        ship.x -= ship.speed;
      }
      if (keysPressed.current["ArrowRight"] || keysPressed.current["d"] || keysPressed.current["D"]) {
        ship.x += ship.speed;
      }

      // Mouse steer control
      if (mouseX.current !== null) {
        // Smooth interpolation towards mouse position
        const targetX = mouseX.current;
        ship.x += (targetX - ship.x) * 0.25;
      }

      // Keep ship on screen
      if (ship.x < ship.width) ship.x = ship.width;
      if (ship.x > canvas.width - ship.width) ship.x = canvas.width - ship.width;

      // 3. Shooting lasers
      if (laserCooldown > 0) laserCooldown--;

      const tryShoot = () => {
        if (laserCooldown === 0) {
          lasers.push({
            x: ship.x,
            y: ship.y - 18,
            vy: -10,
            radius: 3
          });
          laserCooldown = 15; // 4 shots per second max
          synth?.playLaser();
        }
      };

      if (keysPressed.current[" "] || mouseClicked.current) {
        tryShoot();
      }

      // 4. Update and Draw Lasers
      lasers.forEach((laser, lIndex) => {
        laser.y += laser.vy;
        // Remove offscreen lasers
        if (laser.y < 0) {
          lasers.splice(lIndex, 1);
          return;
        }

        // Draw glowing laser beam (capsule shape)
        ctx.shadowBlur = 10;
        ctx.shadowColor = missionRef.current === "REAL" ? "#00f2fe" : "#f35588";
        ctx.fillStyle = missionRef.current === "REAL" ? "#00f2fe" : "#f35588";
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      });

      // 5. Update and Draw Target Mathematical Expressions
      targetSpawnTimer++;
      // Spawn interval decreases as score goes up (makes the game faster)
      const adjustedSpawnInterval = Math.max(45, targetSpawnInterval - Math.floor(scoreRef.current / 300) * 8);
      if (targetSpawnTimer >= adjustedSpawnInterval) {
        targetSpawnTimer = 0;
        const randomItem = MATH_POOL[Math.floor(Math.random() * MATH_POOL.length)];
        
        // Spawn parameters
        const radius = 28 + Math.random() * 8; // randomized radius
        const x = radius + Math.random() * (canvas.width - radius * 2);
        const y = -radius;
        // Float downward with slight horizontal weave velocity
        const speedMultiplier = 1.0 + (scoreRef.current / 1000) * 0.15; // Speed scaling
        const vy = (1.5 + Math.random() * 1.5) * speedMultiplier;
        const vx = (Math.random() - 0.5) * 1.0;

        targets.push({
          id: targetIdCounter++,
          text: randomItem.text,
          isReal: randomItem.isReal,
          x,
          y,
          vx,
          vy,
          radius,
          glow: 0,
          pulseSpeed: 0.05 + Math.random() * 0.05,
          pulseTimer: Math.random() * Math.PI
        });
      }

      targets.forEach((target, tIndex) => {
        // Move targets
        target.y += target.vy;
        // Weave back and forth
        target.pulseTimer += target.pulseSpeed;
        target.x += target.vx + Math.sin(target.pulseTimer) * 0.4;

        // Keep targets within horizontal boundary
        if (target.x < target.radius) {
          target.x = target.radius;
          target.vx *= -1;
        } else if (target.x > canvas.width - target.radius) {
          target.x = canvas.width - target.radius;
          target.vx *= -1;
        }

        // Check if target reached bottom (escaped)
        if (target.y > canvas.height + target.radius) {
          targets.splice(tIndex, 1);
          
          // Escape logic: if target matched active mission, let it escape = lose life
          const isTargetRequired = target.isReal === (missionRef.current === "REAL");
          if (isTargetRequired) {
            setLives((currLives) => {
              const nextLives = currLives - 1;
              if (nextLives <= 0) {
                // Game Over trigger
                setGameState("GAMEOVER");
                synth?.playGameOver();
              } else {
                // Shield animation flash & play warning audio
                ship.shieldActive = true;
                ship.shieldGlow = 15;
                synth?.playIncorrect();
              }
              return nextLives;
            });
          }
          return;
        }

        // Draw Target Math Asteroids (Glassmorphic sphere style)
        ctx.save();
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        
        // Sphere glow intensity
        const pulseGlow = 4 + Math.sin(target.pulseTimer) * 2;
        ctx.shadowBlur = pulseGlow;
        ctx.shadowColor = "rgba(255, 215, 0, 0.4)"; // Soft golden glow for all targets to avoid color-matching cheat
        
        // Gradient fill for glass bubble
        const radialGrad = ctx.createRadialGradient(
          target.x - target.radius * 0.3,
          target.y - target.radius * 0.3,
          target.radius * 0.1,
          target.x,
          target.y,
          target.radius
        );
        radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
        radialGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
        radialGrad.addColorStop(1, "rgba(255, 255, 255, 0.15)");
        
        ctx.fillStyle = radialGrad;
        ctx.fill();

        // Border ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        // Target Mathematical Text
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#000000";
        
        // Font sizing depending on length of text
        let fontSize = 14;
        if (target.text.length > 6) fontSize = 11;
        if (target.text.length > 10) fontSize = 9;
        
        ctx.font = `bold ${fontSize}px GeistMono, monospace, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(target.text, target.x, target.y);

        ctx.restore();
      });

      // 6. Collision Checking: Lasers hitting Targets
      lasers.forEach((laser, lIndex) => {
        targets.forEach((target, tIndex) => {
          const dx = laser.x - target.x;
          const dy = laser.y - target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Collision detected!
          if (distance < target.radius) {
            // Delete laser and target
            lasers.splice(lIndex, 1);
            targets.splice(tIndex, 1);

            // Evaluate if hit matched the active mission target
            const isMatch = target.isReal === (missionRef.current === "REAL");

            if (isMatch) {
              // CORRECT HIT!
              setScore((s) => s + 100);
              setCorrectHits((h) => h + 1);
              synth?.playCorrect();

              // Spawn correct sparks (Green/Cyan)
              for (let k = 0; k < 15; k++) {
                particles.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  radius: 1.5 + Math.random() * 2,
                  color: Math.random() > 0.5 ? "#2bf0ff" : "#4ade80",
                  alpha: 1.0,
                  decay: 0.02 + Math.random() * 0.02
                });
              }
            } else {
              // INCORRECT HIT!
              setScore((s) => Math.max(0, s - 50));
              setIncorrectHits((h) => h + 1);
              synth?.playIncorrect();

              // Shield trigger
              ship.shieldActive = true;
              ship.shieldGlow = 10;

              // Spawn mistake sparks (Red/Pink/Orange)
              for (let k = 0; k < 15; k++) {
                particles.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: 1.5 + Math.random() * 2,
                  color: Math.random() > 0.5 ? "#ff3e6c" : "#f97316",
                  alpha: 1.0,
                  decay: 0.02 + Math.random() * 0.02
                });
              }
            }
          }
        });
      });

      // 7. Update and Draw Explosion Particles
      particles.forEach((p, pIndex) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(pIndex, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. Draw Player's Spaceship
      ctx.save();
      
      // Flickering Engine fire particle effects
      if (Math.random() > 0.3) {
        ctx.fillStyle = Math.random() > 0.5 ? "#f97316" : "#ef4444";
        ctx.beginPath();
        ctx.moveTo(ship.x - 6, ship.y + 15);
        ctx.lineTo(ship.x + 6, ship.y + 15);
        ctx.lineTo(ship.x, ship.y + 20 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();
      }

      // Draw Spaceship Body (Arcade vector style)
      const shipGrad = ctx.createLinearGradient(ship.x - 15, ship.y, ship.x + 15, ship.y);
      shipGrad.addColorStop(0, "#00d2ff");
      shipGrad.addColorStop(0.5, "#ffffff");
      shipGrad.addColorStop(1, "#00d2ff");
      
      ctx.fillStyle = shipGrad;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#00d2ff";

      ctx.beginPath();
      // Nose cone
      ctx.moveTo(ship.x, ship.y - 18);
      // Left wings
      ctx.lineTo(ship.x - 15, ship.y + 12);
      ctx.lineTo(ship.x - 8, ship.y + 6);
      // Bottom core
      ctx.lineTo(ship.x + 8, ship.y + 6);
      // Right wings
      ctx.lineTo(ship.x + 15, ship.y + 12);
      ctx.closePath();
      ctx.fill();

      // Wing outline borders
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cockpit dome (neon cyan glow)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ship.x, ship.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // If hit, show brief danger shield red glow
      if (ship.shieldActive) {
        ship.shieldGlow -= 0.5;
        if (ship.shieldGlow <= 0) {
          ship.shieldActive = false;
        } else {
          ctx.beginPath();
          ctx.arc(ship.x, ship.y, 25, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${ship.shieldGlow / 10})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.restore();

      // 9. Mission Update Timing Logic
      missionTimer++;
      if (missionTimer >= missionInterval) {
        missionTimer = 0;
        
        // Flip mission
        const nextMission = missionRef.current === "REAL" ? "IMAGINARY" : "REAL";
        setMission(nextMission);
        
        // Alert Visual Pop-up
        setAlertText(
          nextMission === "REAL"
            ? "🚨 MISSION UPDATE: Shoot Real Numbers! (실수)"
            : "🚨 MISSION UPDATE: Shoot Imaginary Numbers! (허수)"
        );
        setAlertOpacity(1.0);
        synth?.playMissionChange();
      }

      // Draw Mission Progress Bar inside Canvas
      const barWidth = canvas.width * 0.4;
      const barHeight = 4;
      const barX = (canvas.width - barWidth) / 2;
      const barY = 12;
      const progress = (missionInterval - missionTimer) / missionInterval;

      // Render Progress Bar Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Render Progress Bar Fill
      ctx.fillStyle = missionRef.current === "REAL" ? "#00f2fe" : "#f35588";
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);

      // Loop again if state is still playing
      if (gameStateRef.current === "PLAYING") {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    // Run game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      clearInterval(gameTimerInterval);
    };
  }, [gameState]);

  // Fade alert text effects
  useEffect(() => {
    if (alertOpacity > 0) {
      const interval = setInterval(() => {
        setAlertOpacity((op) => {
          const nextOp = op - 0.02;
          if (nextOp <= 0) {
            clearInterval(interval);
            return 0;
          }
          return nextOp;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [alertOpacity]);

  // Handle Score Submission
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsSubmitting(true);
    const accuracyVal = correctHits + incorrectHits > 0 
      ? parseFloat(((correctHits / (correctHits + incorrectHits)) * 100).toFixed(2))
      : 0.0;

    const payload: ScoreRecord = {
      player_name: playerName.trim(),
      score,
      correct_hits: correctHits,
      incorrect_hits: incorrectHits,
      accuracy: accuracyVal,
      survival_time: survivalTime
    };

    try {
      const { error } = await supabase.from("game_scores").insert([payload]);
      if (error) throw error;
      
      setIsSubmitted(true);
      fetchLeaderboard(); // Refresh scores list
    } catch (e) {
      console.error("Failed saving score to Supabase:", e);
      alert("데이터베이스 연결 실패로 점수가 저장되지 못했습니다. (오프라인 모드 실행)");
      setIsSubmitted(true);
      
      // Fallback add locally
      setLeaderboard((prev) => 
        [...prev, payload].sort((a, b) => b.score - a.score).slice(0, 10)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accuracy calculation
  const totalShots = correctHits + incorrectHits;
  const accuracy = totalShots > 0 ? ((correctHits / totalShots) * 100).toFixed(1) : "0.0";

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-[#07011d] py-10 px-4 md:px-8 text-white relative overflow-hidden font-sans">
      {/* Background radial glowing gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-1%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        
        {/* Title Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-2">
            👾 RETRO MATH ARCADE SHOOTER
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            실수 vs 허수: 수식 격추 작전
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            화면에 떨어지는 수식을 보고 판단해 격추하세요! 실수(Real)와 허수(Imaginary)의 정의를 빠르게 가리는 서바이벌 비행 게임입니다.
          </p>
        </div>

        {/* START SCREEN */}
        {gameState === "START" && (
          <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg shadow-2xl flex flex-col items-center text-center mt-4">
            <h2 className="text-2xl font-bold text-slate-200 mb-4 flex items-center gap-2">
              🚀 비행 준비 및 작전 지침
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm text-slate-300 w-full mb-8">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-cyan-400 mb-2">🎮 조종법</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>마우스</strong>: 마우스 커서 위치로 비행기 이동, <strong>클릭</strong>으로 발사</li>
                  <li><strong>키보드</strong>: 방향키 <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded">→</kbd> (혹은 <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded">D</kbd>) 이동, <strong>스페이스바</strong>로 발사</li>
                </ul>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold text-purple-400 mb-2">💡 미션 규칙</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>화면 중앙 상단의 <strong>미션 게이지</strong>에 맞는 타겟만 맞추세요!</li>
                  <li><strong>실수 미션</strong>: 실수(π, √2, i² 등) 격추! 허수는 통과시키기.</li>
                  <li><strong>허수 미션</strong>: 허수(3i, √-4, i³ 등) 격추! 실수는 통과시키기.</li>
                  <li>맞추면 <strong>+100점</strong>, 잘못 쏘면 <strong>-50점</strong>!</li>
                  <li>쏴야 할 숫자를 그냥 보내면 <strong>라이프 소실(-1)</strong>!</li>
                </ul>
              </div>
            </div>

            {/* Advanced Mathematical hints details */}
            <div className="w-full bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 text-xs text-left mb-8 space-y-2">
              <h3 className="font-bold text-indigo-400 flex items-center gap-1">🧠 고득점 수학 트랩 팁:</h3>
              <p className="text-slate-400 leading-relaxed">
                • <strong>i²</strong> = -1, <strong>(2i)²</strong> = -4 는 허수기호가 있지만 거듭제곱을 풀면 <strong>실수</strong>입니다!<br />
                • <strong>e^(iπ)</strong> = -1 (오일러 항등식) 역시 <strong>실수</strong>입니다. 속지 말고 맞추세요!<br />
                • <strong>√-4</strong>, <strong>i³</strong> (= -i), <strong>1/i</strong> (= -i) 등은 <strong>허수</strong>입니다!
              </p>
            </div>

            <button
              onClick={() => setGameState("PLAYING")}
              className="w-full max-w-xs h-14 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              🌌 우주 비행선 출격하기
            </button>
          </div>
        )}

        {/* PLAYING GAME SCREEN */}
        {gameState === "PLAYING" && (
          <div className="w-full flex flex-col items-center mt-2 relative">
            
            {/* Interactive Heads-Up Display (HUD) */}
            <div className="w-full flex justify-between items-center bg-slate-900/60 border border-white/10 p-4 rounded-t-2xl backdrop-blur-md">
              
              {/* Score / Accuracy */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">SCORE</span>
                <span className="text-2xl font-black text-yellow-300 tracking-tight">{score}</span>
                <span className="text-xs text-slate-400">명중률 {accuracy}%</span>
              </div>

              {/* ACTIVE MISSION DISPLAY */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">CURRENT TARGET</span>
                <div className={`mt-1 px-4 py-1.5 rounded-full font-bold text-sm tracking-tight border shadow-md flex items-center gap-1.5 ${
                  mission === "REAL"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/5"
                    : "bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-pink-500/5"
                }`}>
                  <span className="animate-ping h-2 w-2 rounded-full bg-current" />
                  {mission === "REAL" ? "실수 격추! (REAL)" : "허수 격추! (IMAGINARY)"}
                </div>
              </div>

              {/* Lives / Time */}
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase font-sans">LIVES & SURVIVAL</span>
                <div className="flex gap-1.5 text-lg">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`transition-all duration-300 ${
                        idx < lives ? "text-red-500 scale-100" : "text-slate-700 opacity-40 scale-75"
                      }`}
                    >
                      ❤️
                    </span>
                  ))}
                </div>
                <span className="text-xs text-slate-400">생존 {survivalTime}초</span>
              </div>

            </div>

            {/* Canvas Core Area */}
            <div className="w-full relative bg-[#03001e] border-x border-b border-white/10 rounded-b-2xl overflow-hidden shadow-2xl group">
              <canvas
                ref={canvasRef}
                className="w-full block cursor-crosshair"
                onMouseMove={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    mouseX.current = e.clientX - rect.left;
                  }
                }}
                onMouseLeave={() => {
                  mouseX.current = null;
                }}
                onMouseDown={() => {
                  mouseClicked.current = true;
                }}
                onMouseUp={() => {
                  mouseClicked.current = false;
                }}
                onTouchMove={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect && e.touches[0]) {
                    mouseX.current = e.touches[0].clientX - rect.left;
                  }
                }}
                onTouchStart={() => {
                  mouseClicked.current = true;
                }}
                onTouchEnd={() => {
                  mouseClicked.current = false;
                  mouseX.current = null;
                }}
              />

              {/* Game Screen Canvas Big Alert Banner */}
              {alertOpacity > 0 && (
                <div 
                  className="absolute inset-0 flex justify-center items-center pointer-events-none transition-all duration-75 select-none"
                  style={{ opacity: alertOpacity }}
                >
                  <div className={`px-6 py-3 rounded-2xl font-black text-md md:text-xl border shadow-2xl backdrop-blur-md ${
                    mission === "REAL"
                      ? "bg-cyan-950/80 text-cyan-400 border-cyan-500/40"
                      : "bg-pink-950/80 text-pink-400 border-pink-500/40"
                  }`}>
                    {alertText}
                  </div>
                </div>
              )}
            </div>

            {/* In-game Mobile buttons */}
            <p className="text-slate-500 text-xs text-center mt-3">
              💡 마우스를 흔들어 이동하거나 화살표 키를 쓰세요. 스페이스바나 클릭으로 발사합니다.
            </p>
          </div>
        )}

        {/* GAME OVER SCREEN & RESULT SAVING */}
        {gameState === "GAMEOVER" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            
            {/* Left Column: Player Stats & Save Score Form */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                  🛸 GAMEOVER: 비행 종료
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-4 mb-6">
                  작전 기록 결과
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-semibold">최종 획득 점수</span>
                    <p className="text-3xl font-black text-yellow-300 mt-1">{score}</p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-semibold">생존 시간</span>
                    <p className="text-3xl font-black text-emerald-400 mt-1">{survivalTime}초</p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-semibold">수식 격추 정확도</span>
                    <p className="text-3xl font-black text-indigo-400 mt-1">{accuracy}%</p>
                    <span className="text-[10px] text-slate-500">{correctHits}회 성공 / {incorrectHits}회 실패</span>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-semibold">등급</span>
                    <p className="text-3xl font-black text-pink-400 mt-1">
                      {score >= 2500 ? "S급 대장" : score >= 1500 ? "A급 조종사" : score >= 700 ? "B급 대원" : "C급 연습생"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit score to Supabase */}
              {!isSubmitted ? (
                <form onSubmit={handleScoreSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name-input" className="text-sm font-semibold text-slate-350">
                      리더보드에 올릴 조종사 닉네임
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      maxLength={12}
                      required
                      placeholder="닉네임을 입력하세요"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full h-12 bg-slate-900/80 border border-white/20 rounded-xl px-4 text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setGameState("PLAYING")}
                      className="flex-1 h-12 border border-white/10 hover:bg-white/5 text-slate-300 font-semibold rounded-xl transition-all"
                    >
                      다시 도전하기
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !playerName.trim()}
                      className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          기록 전송 중...
                        </>
                      ) : (
                        "🏆 랭킹 등록하기"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl text-center space-y-4">
                  <p className="text-purple-400 font-semibold text-sm">
                    🎉 성공적으로 점수가 랭킹보드에 업로드 되었습니다!
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setPlayerName("");
                      setGameState("PLAYING");
                    }}
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl transition-all"
                  >
                    새로운 전투 출격하기
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Leaderboard list view */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🏆 탑 10 명예의 전당
                </h2>
                <button 
                  onClick={fetchLeaderboard}
                  disabled={isLeaderboardLoading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40"
                >
                  🔄 새로고침
                </button>
              </div>

              {isLeaderboardLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center py-20 gap-3">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-slate-400 text-sm">리더보드 집계 중...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center py-20">
                  <span className="text-slate-500 text-sm">등록된 격추 기록이 없습니다. 첫 번째 조종사가 되세요!</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {leaderboard.map((item, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;

                    return (
                      <div 
                        key={item.id || index}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isGold 
                            ? "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15" 
                            : isSilver 
                            ? "bg-slate-300/10 border-slate-350/30 hover:bg-slate-300/15" 
                            : isBronze 
                            ? "bg-amber-600/10 border-amber-600/30 hover:bg-amber-600/15"
                            : "bg-slate-900/40 border-white/5 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            isGold 
                              ? "bg-yellow-400 text-black shadow-md shadow-yellow-500/30" 
                              : isSilver 
                              ? "bg-slate-300 text-black shadow-md shadow-slate-400/30" 
                              : isBronze 
                              ? "bg-amber-600 text-white shadow-md shadow-amber-700/30"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200 text-sm md:text-base">{item.player_name}</span>
                            <span className="text-[10px] text-slate-400">
                              명중률 {item.accuracy}% • 생존 {item.survival_time}초
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-md font-extrabold text-yellow-300 tracking-tight">
                            {item.score.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-500">점</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
