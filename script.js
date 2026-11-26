(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const toastEl = document.getElementById("toast");

  // 1. Theme Persistence
  const savedTheme = localStorage.getItem("rp-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  }

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("rp-theme", next);
  });

  // 2. Mobile Navigation Drawer
  menuToggle?.addEventListener("click", () => {
    const isHidden = mobileMenu.hasAttribute("hidden");
    if (isHidden) {
      mobileMenu.removeAttribute("hidden");
      menuToggle.setAttribute("aria-expanded", "true");
    } else {
      mobileMenu.setAttribute("hidden", "");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu?.setAttribute("hidden", "");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // 3. Toast Helper & Copy Email
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  document.querySelectorAll(".copy-email-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-email") || "patelraja2004@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        showToast("Email copied: " + email);
      } catch {
        showToast("Email: " + email);
      }
    });
  });

  // 4. Skill Category Filter
  const filterBtns = document.querySelectorAll(".filter-btn");
  const skillCards = document.querySelectorAll(".skill-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      skillCards.forEach((card) => {
        const cat = card.getAttribute("data-category");
        const show = filter === "all" || cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  // 5. Interactive ViT Pipeline & Grad-CAM Explorer
  const classData = {
    glioma: {
      label: "Glioma",
      cx: "38%",
      cy: "38%",
      r: "34%",
      probs: { glioma: 94, meningioma: 4, pituitary: 1, notumor: 1 },
      input: "Resized 224×224 MRI scan normalized for ViT-Base/16 patch embedding (16×16 patches).",
      model: "Two-phase fine-tuning with mixed-precision & class-balanced weights targeting Glioma morphology.",
      xai: "Grad-CAM + OpenCV heatmap highlights diffuse tumor boundaries inside brain parenchyma.",
      output: "Displays Predicted Class: <strong>Glioma</strong> · Confidence Score + Top-4 Probabilities."
    },
    meningioma: {
      label: "Meningioma",
      cx: "72%",
      cy: "34%",
      r: "30%",
      probs: { glioma: 5, meningioma: 92, pituitary: 2, notumor: 1 },
      input: "Resized 224×224 MRI scan normalized for ViT-Base/16 patch embedding (16×16 patches).",
      model: "Two-phase fine-tuning extracts extra-axial dural-based mass features via self-attention.",
      xai: "Grad-CAM + OpenCV heatmap localizes well-circumscribed dural attachment regions.",
      output: "Displays Predicted Class: <strong>Meningioma</strong> · Confidence Score + Top-4 Probabilities."
    },
    pituitary: {
      label: "Pituitary",
      cx: "50%",
      cy: "68%",
      r: "26%",
      probs: { glioma: 2, meningioma: 3, pituitary: 93, notumor: 2 },
      input: "Resized 224×224 MRI scan normalized for ViT-Base/16 patch embedding (16×16 patches).",
      model: "Two-phase fine-tuning focuses attention heads on sellar & suprasellar anatomical region.",
      xai: "Grad-CAM + OpenCV heatmap highlights focal pituitary gland region for clinician review.",
      output: "Displays Predicted Class: <strong>Pituitary</strong> · Confidence Score + Top-4 Probabilities."
    },
    notumor: {
      label: "No Tumor",
      cx: "50%",
      cy: "50%",
      r: "12%",
      probs: { glioma: 1, meningioma: 1, pituitary: 1, notumor: 97 },
      input: "Resized 224×224 MRI scan normalized for ViT-Base/16 patch embedding (16×16 patches).",
      model: "Mixed-precision ViT inference confirms symmetric tissue distribution without mass effect.",
      xai: "Grad-CAM + OpenCV heatmap shows distributed baseline attention with no focal anomaly.",
      output: "Displays Predicted Class: <strong>No Tumor</strong> · Confidence Score + Top-4 Probabilities."
    }
  };

  const classTabs = document.querySelectorAll(".class-tab");
  const stageInput = document.getElementById("stage-input");
  const stageModel = document.getElementById("stage-model");
  const stageXai = document.getElementById("stage-xai");
  const stageOutput = document.getElementById("stage-output");
  const gradcamSpot = document.getElementById("gradcam-spot");
  const probPredLabel = document.getElementById("prob-pred-label");

  classTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.getAttribute("data-class");
      const data = classData[key];
      if (!data) return;

      classTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      if (stageInput) stageInput.textContent = data.input;
      if (stageModel) stageModel.textContent = data.model;
      if (stageXai) stageXai.textContent = data.xai;
      if (stageOutput) stageOutput.innerHTML = data.output;
      if (probPredLabel) probPredLabel.textContent = data.label;

      if (gradcamSpot) {
        gradcamSpot.setAttribute("cx", data.cx);
        gradcamSpot.setAttribute("cy", data.cy);
        gradcamSpot.setAttribute("r", data.r);
      }

      Object.entries(data.probs).forEach(([cls, val]) => {
        const bar = document.getElementById(`bar-${cls}`);
        const pct = document.getElementById(`pct-${cls}`);
        if (bar) bar.style.width = `${val}%`;
        if (pct) pct.textContent = `${val}%`;
      });
    });
  });

  // 6. Contact Form -> Direct Delivery via FormSubmit (or Formspree)
  // Tip: Replace FORM_ENDPOINT with your Formspree URL (https://formspree.io/f/YOUR_ID)
  // if you also want an online dashboard storing every submission.
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/patelraja2004@gmail.com";
  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");
  const submitBtn = document.getElementById("contact-submit-btn");

  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("sender-name")?.value.trim() || "";
    const email = document.getElementById("sender-email")?.value.trim() || "";
    const message = document.getElementById("sender-message")?.value.trim() || "";

    if (!name || !email || !message) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }
    if (formFeedback) {
      formFeedback.style.color = "var(--text-muted)";
      formFeedback.textContent = "Sending your message...";
    }

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `New Portfolio Message from ${name}`,
          _template: "table"
        })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      contactForm.reset();
      if (formFeedback) {
        formFeedback.style.color = "var(--emerald)";
        formFeedback.textContent = "Message sent! Thank you for reaching out — Raj will reply soon.";
      }
      showToast("Message sent to Raj!");
    } catch {
      if (formFeedback) {
        formFeedback.style.color = "#f87171";
        formFeedback.textContent = "Could not send directly. Please email patelraja2004@gmail.com directly.";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });

  // 7. Scroll Reveal & Active Nav Link
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 130;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { passive: true });

  // 8. Lightweight Neural Mesh Canvas in Hero
  const canvas = document.getElementById("neural-canvas");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let nodes = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      const count = Math.min(36, Math.max(16, Math.floor(width / 38)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const isLight = root.getAttribute("data-theme") === "light";
      const nodeColor = isLight ? "rgba(2, 132, 199, 0.35)" : "rgba(56, 189, 248, 0.45)";
      const lineBase = isLight ? "2, 132, 199" : "56, 189, 248";

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(${lineBase}, ${(1 - dist / 130) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  // 9. Project GitHub Placeholder Handler
  const projectGithubLink = document.getElementById("project-github-link");
  projectGithubLink?.addEventListener("click", (e) => {
    const href = projectGithubLink.getAttribute("href");
    if (!href || href === "#") {
      e.preventDefault();
      showToast("GitHub repository link coming soon!");
    }
  });

  // 10. Scroll Progress Bar, Floating Back-to-Top & Print CV
  const scrollProgress = document.getElementById("scroll-progress");
  const floatingTopBtn = document.getElementById("floating-top-btn");
  const printCvBtn = document.getElementById("print-cv-btn");

  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    if (floatingTopBtn) floatingTopBtn.classList.toggle("show", window.scrollY > 420);
  }, { passive: true });

  floatingTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  printCvBtn?.addEventListener("click", () => {
    window.print();
  });

  // 11. Footer Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
