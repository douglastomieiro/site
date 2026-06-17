document.addEventListener("DOMContentLoaded", () => {

  // --- 1. FADE-IN DA PÁGINA ---
  document.querySelectorAll(".opacidade").forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 }).observe(el);
  });
  // Fallback: garante visibilidade mesmo se o observer não disparar
  setTimeout(() => document.querySelectorAll(".opacidade").forEach(el => el.classList.add("visible")), 2500);

  // --- 2. ROLAGEM SUAVE ---
  document.querySelectorAll("header nav ul li a").forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href")?.substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        const hHeight = document.getElementById("header")?.offsetHeight || 0;
        window.scrollTo({ top: targetSection.offsetTop - hHeight, behavior: "smooth" });
      }
    });
  });

  // --- 3. MENU HAMBÚRGUER ---
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");

  navToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  // Fecha o menu ao clicar em um link
  nav?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Fecha ao clicar fora
  document.addEventListener("click", (e) => {
    if (nav?.classList.contains("open") && !nav.contains(e.target) && !navToggle.contains(e.target)) {
      nav.classList.remove("open");
      navToggle?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  // --- 4. INDICADOR DE SEÇÃO ATIVA NO NAV ---
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll("header nav ul li a");

  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => activeSectionObserver.observe(s));

  // --- 5. BOTÃO WP FLUTUANTE — expande quando o usuário para de rolar ---
  const wpFloat = document.querySelector(".whatsapp-button");
  let scrollTimer;

  const expandWp = () => wpFloat?.classList.add("wp-expanded");
  const collapseWp = () => wpFloat?.classList.remove("wp-expanded");

  window.addEventListener("scroll", () => {
    collapseWp();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(expandWp, 1400);
  }, { passive: true });

  // Mostra expandido na primeira visita após 2s
  setTimeout(expandWp, 2000);

  // --- 6. MODAL DE GALERIA ---
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const modalVideo = document.getElementById("modalVideo");
  const closeBtn = document.getElementById("closeModal");

  const items = Array.from(document.querySelectorAll(".gallery .square img"));
  let currentIndex = -1;

  if (modal && modalImg) {
    const prevBtn = document.createElement("button");
    const nextBtn = document.createElement("button");
    prevBtn.className = "modal-prev";
    nextBtn.className = "modal-next";
    prevBtn.innerHTML = "&#8249;";
    nextBtn.innerHTML = "&#8250;";

    const swipeHint = document.createElement("div");
    swipeHint.className = "modal-swipe-hint";
    swipeHint.textContent = "← Arraste para navegar →";

    modal.append(prevBtn, nextBtn, swipeHint);

    const closeModalFunc = () => {
      modal.style.display = "none";
      document.body.style.overflow = "";
      modalVideo.pause();
      modalVideo.src = "";
    };

    const renderItem = (index) => {
      const item = items[index];
      const isVideo = item.dataset.type === "video";
      modalImg.style.display = "none";
      modalVideo.style.display = "none";
      modalVideo.pause();
      if (isVideo) {
        modalVideo.src = item.dataset.src;
        modalVideo.style.display = "block";
        modalVideo.play().catch(() => {});
      } else {
        modalImg.src = item.dataset.src || item.src;
        modalImg.alt = item.alt;
        modalImg.style.display = "block";
      }
    };

    const navigate = (step) => {
      currentIndex = (currentIndex + step + items.length) % items.length;
      renderItem(currentIndex);
    };

    items.forEach((item, idx) => {
      item.addEventListener("click", () => {
        currentIndex = idx;
        renderItem(idx);
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
      });
    });

    // Swipe touch
    let touchStartX = 0;
    modal.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    modal.addEventListener("touchmove", (e) => {
      e.preventDefault();
    }, { passive: false });

    modal.addEventListener("touchend", (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) navigate(delta < 0 ? 1 : -1);
    });

    prevBtn.onclick = (e) => { e.stopPropagation(); navigate(-1); };
    nextBtn.onclick = (e) => { e.stopPropagation(); navigate(1); };
    closeBtn.onclick = closeModalFunc;
    modal.onclick = (e) => { if (e.target === modal) closeModalFunc(); };

    document.addEventListener("keydown", (e) => {
      if (modal.style.display !== "block") return;
      if (e.key === "Escape") closeModalFunc();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    });
  }

});
