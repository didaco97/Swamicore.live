document.addEventListener("DOMContentLoaded", () => {
  const scrollProgress = document.getElementById("scrollProgress");
  const navbar = document.getElementById("navbar");
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  }

  function updateHeaderState() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }

  function setMenu(open) {
    if (!navLinks || !navToggle || !navbar) return;
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    navbar.classList.toggle("menu-active", open);
    document.body.classList.toggle("menu-open", open);
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const revealElements = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealElements.forEach((element) => element.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -48px 0px"
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(".nav-links a[href^='#']");

  function updateActiveNav() {
    const marker = window.scrollY + 180;
    let currentId = "";

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (marker >= top && marker < bottom) {
        currentId = section.id;
      }
    });

    navItems.forEach((item) => {
      item.classList.toggle("active", item.getAttribute("href") === `#${currentId}`);
    });
  }

  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = navbar ? navbar.offsetHeight + 16 : 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  });

  const counters = document.querySelectorAll(".stat-value[data-target]");

  function formatCounter(value, target) {
    if (target >= 10000) return `${Math.round(value / 1000)}K+`;
    if (target >= 5000) return value >= target ? "5,000+" : `${(value / 1000).toFixed(1)}K+`;
    return `${Math.round(value)}+`;
  }

  function animateCounter(counter) {
    if (counter.dataset.animated) return;
    counter.dataset.animated = "true";

    const target = Number(counter.dataset.target || 0);
    if (reduceMotion || target === 0) {
      counter.textContent = formatCounter(target, target);
      return;
    }

    const start = performance.now();
    const duration = 1400;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      counter.textContent = formatCounter(value, target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((counter) => counterObserver.observe(counter));

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = contactForm.querySelector("input[type='email']");
    const email = emailInput?.value.trim();
    if (!email || !emailInput.checkValidity()) {
      formNote.textContent = "Enter a valid work email and we will prepare the right export lane details.";
      emailInput?.focus();
      return;
    }

    const subject = encodeURIComponent("Demo Request for SWAMICORE");
    const body = encodeURIComponent(`Hi SWAMICORE team,\n\nI would like to request a demo.\n\nMy work email is: ${email}\n\nThanks.`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=dhiraj.dahale@avcoe.org&su=${subject}&body=${body}`, '_blank');

    formNote.textContent = "Opening your email client to send the request...";
    contactForm.reset();
  });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollProgress();
      updateHeaderState();
      updateActiveNav();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setMenu(false);
  });

  updateScrollProgress();
  updateHeaderState();
  updateActiveNav();

  console.log("SWAMICORE UI loaded");
});
