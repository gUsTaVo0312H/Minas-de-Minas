/**
 * script.js — Minas das Minas landing page interactive behaviour
 *
 * Sections:
 *   1. Sticky header glassmorphism
 *   2. Hamburger menu (Escape + overlay close)
 *   3. IntersectionObserver scroll reveals
 *   4. Floor-plan hotspot tooltips
 *   5. City search filter + empty state
 *   6. Accordion (independent mode)
 *   7. Carousel + lightbox (focus trap, Escape key)
 *   8. Flip cards (click + keyboard)
 *   9. Booking form (validation, phone mask, fake async submit, toast)
 */

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     1. STICKY HEADER — glassmorphism on scroll
     ============================================================ */
  const header = document.querySelector(".site-header");

  if (header) {
    const onScroll = () => {
      header.classList.toggle("site-header--scrolled", window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }


  /* ============================================================
     2. HAMBURGER MENU
     ============================================================ */
  const hamburger    = document.querySelector(".hamburger");
  const mobileNav    = document.querySelector(".mobile-nav");
  const mobileOverlay = document.querySelector(".mobile-nav-overlay");
  const mobileClose  = document.querySelector(".mobile-nav__close");
  const mobileLinks  = document.querySelectorAll(".mobile-nav__link");

  function openMobileNav() {
    mobileNav.classList.add("mobile-nav--open");
    mobileOverlay.classList.add("mobile-nav-overlay--visible");
    document.body.style.overflow = "hidden";
    mobileClose && mobileClose.focus();
  }

  function closeMobileNav() {
    mobileNav.classList.remove("mobile-nav--open");
    mobileOverlay.classList.remove("mobile-nav-overlay--visible");
    document.body.style.overflow = "";
    hamburger && hamburger.focus();
  }

  hamburger    && hamburger.addEventListener("click", openMobileNav);
  mobileClose  && mobileClose.addEventListener("click", closeMobileNav);
  mobileOverlay && mobileOverlay.addEventListener("click", closeMobileNav);

  mobileLinks.forEach(link => link.addEventListener("click", closeMobileNav));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("mobile-nav--open")) {
      closeMobileNav();
    }
  });


  /* ============================================================
     3. INTERSECTION OBSERVER — scroll reveals
     ============================================================ */
  const revealTargets = document.querySelectorAll(".reveal-section");

  if (revealTargets.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-section--visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach(el => revealObs.observe(el));
  }


  /* ============================================================
     4. FLOOR-PLAN HOTSPOT TOOLTIPS
     ============================================================ */
  const hotspotData = {
    "1": {
      title: "Entrada e Recepção",
      desc:  "Boas-vindas aos visitantes, painel de apresentação da exposição e distribuição de materiais pedagógicos.",
    },
    "2": {
      title: "Sala de Minerais",
      desc:  "Acervo de rochas e minerais representativos de Minas Gerais, com informações científicas e históricas.",
    },
    "3": {
      title: "Ambiente Interativo",
      desc:  "Simuladores táteis e atividades práticas para explorar o processo de extração mineral.",
    },
    "4": {
      title: "Linha do Tempo",
      desc:  "Painel cronológico sobre a história da mineração em Minas Gerais, da colonização até os dias atuais.",
    },
    "5": {
      title: "Área Audiovisual",
      desc:  "Projeções imersivas sobre o impacto socioeconômico e ambiental da mineração na região.",
    },
  };

  const tooltip       = document.getElementById("hotspot-tooltip");
  const tooltipTitle  = tooltip && tooltip.querySelector(".hotspot__tooltip-title");
  const tooltipDesc   = tooltip && tooltip.querySelector(".hotspot__tooltip-desc");
  const tooltipClose  = tooltip && tooltip.querySelector(".hotspot__tooltip-close");
  const hotspotBtns   = document.querySelectorAll(".hotspot");
  let activeHotspot   = null;

  function positionTooltip(btn) {
    const container = btn.closest(".floor-plan__container");
    const cRect     = container.getBoundingClientRect();
    const bRect     = btn.getBoundingClientRect();

    const relLeft   = bRect.left - cRect.left;
    const relTop    = bRect.top  - cRect.top;

    // Position tooltip left or right of hotspot depending on available space
    const tipWidth  = 240;
    if (relLeft > cRect.width / 2) {
      tooltip.style.right = (cRect.width - relLeft + 8) + "px";
      tooltip.style.left  = "auto";
    } else {
      tooltip.style.left  = (relLeft + bRect.width / 2 + 8) + "px";
      tooltip.style.right = "auto";
    }
    // Clamp vertically so tooltip doesn't go above container
    tooltip.style.top = Math.max(4, relTop - 12) + "px";
  }

  function showTooltip(btn) {
    const id   = btn.dataset.hotspot;
    const data = hotspotData[id];
    if (!data || !tooltip) return;

    tooltipTitle.textContent = data.title;
    tooltipDesc.textContent  = data.desc;

    // Remove hidden so it has dimensions; position it; then reveal
    tooltip.removeAttribute("hidden");
    positionTooltip(btn);

    hotspotBtns.forEach(b => b.classList.remove("hotspot--active"));
    btn.classList.add("hotspot--active");
    activeHotspot = id;
  }

  function hideTooltip() {
    tooltip && tooltip.setAttribute("hidden", "");
    hotspotBtns.forEach(b => b.classList.remove("hotspot--active"));
    activeHotspot = null;
  }

  hotspotBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.hotspot === activeHotspot) {
        hideTooltip();
      } else {
        showTooltip(btn);
      }
    });
  });

  tooltipClose && tooltipClose.addEventListener("click", hideTooltip);

  // Close tooltip when pressing Escape or clicking outside
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && activeHotspot) hideTooltip();
  });

  document.addEventListener("click", e => {
    if (
      activeHotspot &&
      tooltip &&
      !tooltip.contains(e.target) &&
      !e.target.classList.contains("hotspot")
    ) {
      hideTooltip();
    }
  });


  /* ============================================================
     5. CITY SEARCH FILTER + EMPTY STATE
     ============================================================ */
  const cityInput  = document.getElementById("city-search");
  const accordionItems = document.querySelectorAll(".accordion__item");
  const emptyState = document.getElementById("cities-empty");

  if (cityInput) {
    cityInput.addEventListener("input", () => {
      const q = cityInput.value.trim().toLowerCase();
      let visible = 0;

      accordionItems.forEach(item => {
        const name = item.dataset.city || "";
        const match = name.toLowerCase().includes(q);
        item.classList.toggle("accordion__item--hidden", !match);
        if (match) visible++;
      });

      // Show or hide empty state
      if (emptyState) {
        if (visible === 0) {
          emptyState.removeAttribute("hidden");
        } else {
          emptyState.setAttribute("hidden", "");
        }
      }
    });
  }


  /* ============================================================
     6. ACCORDION — independent (only one open at a time)
     Note: panels do NOT use the `hidden` attribute — CSS max-height
     handles collapse so transitions are not blocked.
     ============================================================ */
  const accordionTriggers = document.querySelectorAll(".accordion__trigger");

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const parentItem = trigger.closest(".accordion__item");
      const isOpen     = parentItem.classList.contains("accordion__item--open");

      // Close all others
      accordionItems.forEach(item => {
        item.classList.remove("accordion__item--open");
        const t = item.querySelector(".accordion__trigger");
        t && t.setAttribute("aria-expanded", "false");
      });

      // Toggle the clicked item
      if (!isOpen) {
        parentItem.classList.add("accordion__item--open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });


  /* ============================================================
     7. CAROUSEL + LIGHTBOX
     ============================================================ */
  const track     = document.querySelector(".carousel__track");
  const slides    = track ? Array.from(track.querySelectorAll(".carousel__slide")) : [];
  const prevBtn   = document.querySelector(".carousel__btn--prev");
  const nextBtn   = document.querySelector(".carousel__btn--next");
  const dotsContainer = document.querySelector(".carousel__dots");
  const dots      = dotsContainer ? Array.from(dotsContainer.querySelectorAll(".carousel__dot")) : [];

  let currentSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides; // looping modulo
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("carousel__dot--active", i === currentSlide);
    });
  }

  prevBtn && prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextBtn && nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goToSlide(i));
  });

  // Touch swipe support
  let touchStartX = 0;

  track && track.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track && track.addEventListener("touchend", e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (delta > 50)  goToSlide(currentSlide + 1);
    if (delta < -50) goToSlide(currentSlide - 1);
  }, { passive: true });

  // Initialize
  if (totalSlides > 0) goToSlide(0);

  /* --- Lightbox --- */
  const lightbox       = document.getElementById("lightbox");
  const lbImage        = lightbox && lightbox.querySelector(".lightbox__image");
  const lbName         = lightbox && lightbox.querySelector(".lightbox__name");
  const lbType         = lightbox && lightbox.querySelector(".lightbox__type");
  const lbDescription  = lightbox && lightbox.querySelector(".lightbox__description");
  const lbClose        = lightbox && lightbox.querySelector(".lightbox__close");
  const lbOverlay      = lightbox && lightbox.querySelector(".lightbox__overlay");
  const oreCardBtns    = document.querySelectorAll(".ore-card__btn");

  // Collect focusable elements for focus trap
  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function openLightbox(data) {
    if (!lightbox) return;
    lbImage.src            = data.image;
    lbImage.alt            = data.imageAlt;
    lbName.textContent     = data.name;
    lbType.textContent     = data.type;
    lbDescription.textContent = data.description;
    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    lbClose && lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  oreCardBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      openLightbox({
        image:       btn.dataset.image,
        imageAlt:    btn.dataset.imageAlt,
        name:        btn.dataset.name,
        type:        btn.dataset.type,
        description: btn.dataset.description,
      });
    });
  });

  lbClose  && lbClose.addEventListener("click", closeLightbox);
  lbOverlay && lbOverlay.addEventListener("click", closeLightbox);

  // Focus trap + Escape for lightbox
  lightbox && lightbox.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeLightbox();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = getFocusable(lightbox);
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });


  /* ============================================================
     8. FLIP CARDS — click + keyboard (Enter / Space)
     ============================================================ */
  const flipCards = document.querySelectorAll(".flip-card");

  flipCards.forEach(card => {
    function toggle() {
      const flipped = card.classList.toggle("flip-card--flipped");
      card.setAttribute("aria-pressed", String(flipped));
    }

    card.addEventListener("click", toggle);

    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });


  /* ============================================================
     9. BOOKING FORM — validation, phone mask, fake async submit, toast
     ============================================================ */
  const form        = document.getElementById("booking-form");
  const toast       = document.getElementById("toast");
  const submitBtn   = form && form.querySelector(".btn--submit");
  const submitLabel = submitBtn && submitBtn.querySelector(".btn__label");
  const submitSpin  = submitBtn && submitBtn.querySelector(".btn__spinner");

  // Phone mask: formats as (XX) XXXXX-XXXX
  const phoneInput = form && form.querySelector("#phone");

  phoneInput && phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    let masked = "";
    if (digits.length > 6) {
      masked = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      masked = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      masked = `(${digits}`;
    }
    phoneInput.value = masked;
  });

  // Show / clear individual field error
  function setFieldError(fieldId, message) {
    const field = form.querySelector(`#${fieldId}`);
    const error = form.querySelector(`#${fieldId}-error`);
    if (!field || !error) return;

    if (message) {
      field.classList.add("form-field__input--error");
      error.textContent = message;
    } else {
      field.classList.remove("form-field__input--error");
      error.textContent = "";
    }
  }

  // Clear errors on input
  form && form.querySelectorAll(".form-field__input").forEach(input => {
    input.addEventListener("input", () => {
      setFieldError(input.id, "");
    });
  });

  function validateForm() {
    let valid = true;

    const name    = form.querySelector("#name").value.trim();
    const school  = form.querySelector("#school").value.trim();
    const email   = form.querySelector("#email").value.trim();
    const phone   = form.querySelector("#phone").value.replace(/\D/g, "");
    const message = form.querySelector("#message").value.trim();

    if (!name) {
      setFieldError("name", "Nome é obrigatório.");
      valid = false;
    }

    if (!school) {
      setFieldError("school", "Escola / Instituição é obrigatória.");
      valid = false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setFieldError("email", "Informe um e-mail válido.");
      valid = false;
    }

    if (phone.length < 10) {
      setFieldError("phone", "Informe um telefone completo.");
      valid = false;
    }

    if (!message) {
      setFieldError("message", "Por favor, escreva uma mensagem.");
      valid = false;
    }

    return valid;
  }

  function showToast() {
    if (!toast) return;
    toast.removeAttribute("hidden");
    // Auto-dismiss after 3.5 s
    setTimeout(() => {
      toast.setAttribute("hidden", "");
    }, 3500);
  }

  function resetSubmitBtn() {
    if (!submitBtn) return;
    submitBtn.disabled = false;
    submitBtn.classList.remove("btn--loading", "btn--success");
  }

  form && form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.classList.add("btn--loading");

    /*
     * TODO: replace the setTimeout below with a real fetch() call:
     *
     *   const response = await fetch("/api/booking", {
     *     method: "POST",
     *     headers: { "Content-Type": "application/json" },
     *     body: JSON.stringify({ name, school, email, phone, message }),
     *   });
     *   if (!response.ok) throw new Error("Server error");
     */
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Success state
    submitBtn.classList.remove("btn--loading");
    submitBtn.classList.add("btn--success");

    // Reset form fields
    form.reset();

    // Show toast
    showToast();

    // Return button to idle after 2.5 s
    setTimeout(resetSubmitBtn, 2500);
  });


  /* ============================================================
     FOOTER — dynamic year
     ============================================================ */
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ============================================================
     HERO — fade in background image + content on load
     ============================================================ */
  const heroBg      = document.querySelector(".hero__bg-image");
  const heroContent = document.querySelector(".hero__content");

  if (heroBg) {
    // If already cached/loaded fire immediately, otherwise wait for load event
    const revealHero = () => {
      heroBg.classList.add("hero__bg-image--loaded");
      setTimeout(() => {
        heroContent && heroContent.classList.add("hero__content--visible");
      }, 200);
    };

    if (heroBg.complete) {
      revealHero();
    } else {
      heroBg.addEventListener("load", revealHero);
      // Fallback if image fails — still reveal content
      heroBg.addEventListener("error", () => {
        heroContent && heroContent.classList.add("hero__content--visible");
      });
    }
  }

}); // end DOMContentLoaded
