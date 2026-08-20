(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = () => window.matchMedia("(pointer: coarse)").matches;
  const isMobileWidth = () => window.matchMedia("(max-width: 780px)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    initHeroTitleChars();
    initCursor();
    initBurgerMenu();
    initHeroTimeline();
    initHeroParallax();
    initMedallionSpin();
    initScrollReveals();
    initAboutParallax();
    initMenuCardHover();
    initAtmosphereGallery();

    // Пересчитываем позиции ScrollTrigger после полной загрузки (шрифты,
    // placeholder-картинки) — иначе pinned-галерея Atmosphere может
    // промахнуться по высоте на первой отрисовке.
    window.addEventListener("load", () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 600);
  });

  /* -------------------- Hero: буквы заголовка -> отдельные span -------------------- */
  function initHeroTitleChars() {
    const title = document.getElementById("heroTitle");
    const text = title.textContent.trim();
    title.textContent = "";
    [...text].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "hero__title-char";
      span.textContent = ch;
      title.appendChild(span);
    });
  }

  /* -------------------- Custom cursor (только desktop) -------------------- */
  function initCursor() {
    if (isTouch()) return;

    const dot = document.getElementById("cursor");
    const label = document.getElementById("cursorLabel");
    const reduced = prefersReducedMotion();

    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    const quickX = gsap.quickTo(dot, "x", { duration: reduced ? 0 : 0.35, ease: "power3" });
    const quickY = gsap.quickTo(dot, "y", { duration: reduced ? 0 : 0.35, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
      quickX(e.clientX);
      quickY(e.clientY);
    });

    document.querySelectorAll("[data-cursor='view']").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        dot.classList.add("is-view");
        label.textContent = "VIEW";
      });
      el.addEventListener("mouseleave", () => dot.classList.remove("is-view"));
    });

    document.querySelectorAll("[data-cursor='button']").forEach((el) => {
      el.addEventListener("mouseenter", () => dot.classList.add("is-button"));
      el.addEventListener("mouseleave", () => dot.classList.remove("is-button"));
    });
  }

  /* -------------------- Burger menu: fullscreen overlay -------------------- */
  function initBurgerMenu() {
    const btn = document.getElementById("burgerBtn");
    const overlay = document.getElementById("navOverlay");
    const items = overlay.querySelectorAll(".nav-overlay__item");
    const reduced = prefersReducedMotion();
    let open = false;

    const tl = gsap.timeline({ paused: true });
    tl.set(overlay, { display: "flex" })
      .fromTo(
        overlay,
        { clipPath: "circle(2% at calc(100% - 48px) 48px)" },
        { clipPath: "circle(150% at calc(100% - 48px) 48px)", duration: reduced ? 0.01 : 0.9, ease: "power4.inOut" }
      )
      .fromTo(
        items,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: reduced ? 0.01 : 0.7, stagger: reduced ? 0 : 0.08, ease: "power3.out" },
        reduced ? 0 : "-=0.35"
      );

    function toggle() {
      open = !open;
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      document.body.style.overflow = open ? "hidden" : "";
      open ? tl.play() : tl.reverse();
    }

    btn.addEventListener("click", toggle);
    items.forEach((item) => item.addEventListener("click", () => open && toggle()));
  }

  /* -------------------- Hero: page-load timeline -------------------- */
  function initHeroTimeline() {
    const reduced = prefersReducedMotion();
    const d = reduced ? 0.01 : undefined;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(".hero__eyebrow", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: reduced ? 0.01 : 0.8 })
      .fromTo(
        ".hero__title-char",
        { opacity: 0, y: 80, rotateZ: 6 },
        { opacity: 1, y: 0, rotateZ: 0, duration: reduced ? 0.01 : 1, stagger: reduced ? 0 : 0.06 },
        "-=0.5"
      )
      .fromTo(
        ".hero__sub, .hero__text, .hero__cta, .hero__info",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: reduced ? 0.01 : 0.8, stagger: reduced ? 0 : 0.12 },
        "-=0.5"
      )
      .fromTo(
        "#heroImgMain",
        { opacity: 0, scale: 1.12, clipPath: "inset(12% 12% 12% 12% round 28px)" },
        { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 28px)", duration: reduced ? 0.01 : 1.3 },
        "-=1.1"
      )
      .fromTo("#heroImgSecondary", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: reduced ? 0.01 : 1 }, "-=0.7")
      .fromTo(
        "#heroMedallion",
        { opacity: 0, scale: 0.7, rotate: -20 },
        { opacity: 1, scale: 1, rotate: 0, duration: reduced ? 0.01 : 0.9 },
        "-=0.6"
      );
  }

  /* -------------------- Hero: scroll + mousemove parallax -------------------- */
  function initHeroParallax() {
    const reduced = prefersReducedMotion();
    const hero = document.getElementById("hero");

    if (!reduced) {
      gsap.to("#heroImgMain", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("#heroImgSecondary", {
        yPercent: -16,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });
    }

    if (reduced || isTouch()) return;

    const visual = document.getElementById("heroVisual");
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(visual, { x: x * 14, y: y * 10, duration: 0.9, ease: "power3.out" });
    });
  }

  /* -------------------- Medallion: постоянное вращение -------------------- */
  function initMedallionSpin() {
    if (prefersReducedMotion()) return;
    gsap.to("#medallionRing", { rotateY: 360, duration: 26, repeat: -1, ease: "none" });
  }

  /* -------------------- Универсальные scroll-reveal для .reveal -------------------- */
  function initScrollReveals() {
    const reduced = prefersReducedMotion();
    document.querySelectorAll(".reveal").forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? 0.01 : 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 87%" },
        }
      );
    });

    // Заголовки/строки без класса .reveal, но с собственным reveal-поведением
    gsap.utils.toArray(".concept__row").forEach((row, i) => {
      gsap.fromTo(
        row,
        { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
        {
          opacity: 1,
          x: 0,
          duration: reduced ? 0.01 : 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 88%" },
        }
      );
    });
  }

  /* -------------------- About: лёгкий parallax главного фото -------------------- */


  /* -------------------- MenuPreview: hover zoom на фото -------------------- */


  /* -------------------- Atmosphere: pinned horizontal scroll gallery -------------------- */
  function initAtmosphereGallery() {
    const reduced = prefersReducedMotion();
    if (reduced || isMobileWidth()) return; // на мобильном — обычный swipe (см. CSS overflow-x)

    const section = document.getElementById("atmosphere");
    const track = document.getElementById("atmosphereTrack");
    const getDistance = () => track.scrollWidth - window.innerWidth;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      animation: gsap.to(track, { x: () => -getDistance(), ease: "none" }),
    });

    document.querySelectorAll(".atmosphere__item").forEach((item) => {
      gsap.fromTo(
        item.querySelector("img"),
        { scale: 1.18 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            containerAnimation: st.animation,
            start: "left right",
            end: "left left",
            scrub: true,
          },
        }
      );
    });
  }
})();
