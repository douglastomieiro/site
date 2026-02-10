document.addEventListener("DOMContentLoaded", () => {
  // --- 1. POP-UP ---
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");
  const closePopup = document.getElementById("closePopup");

  if (popup && overlay && !sessionStorage.getItem("popupClosed")) {
    popup.style.display = "block";
    overlay.style.display = "block";
  }

  const closePop = () => {
    popup.style.display = "none";
    overlay.style.display = "none";
    sessionStorage.setItem("popupClosed", "true");
  };

  closePopup?.addEventListener("click", closePop);
  overlay?.addEventListener("click", closePop);

  // --- 2. ROLAGEM SUAVE ---
  document.querySelectorAll("header nav ul li a").forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href")?.substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        const hHeight = document.getElementById("header")?.offsetHeight || 0;
        window.scrollTo({
          top: targetSection.offsetTop - hHeight,
          behavior: "smooth",
        });
      }
    });
  });

  // --- 3. MODAL DE GALERIA ---
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const modalVideo = document.getElementById("modalVideo");
  const closeBtn = document.getElementById("closeModal"); // Pega o span do HTML

  // Seleciona as imagens que funcionam como gatilho
  const items = Array.from(document.querySelectorAll(".gallery .square img"));
  let currentIndex = -1;

  if (modal && modalImg) {
    // Criação dos botões de navegação
    const prevBtn = document.createElement("button");
    const nextBtn = document.createElement("button");
    prevBtn.className = "modal-prev"; nextBtn.className = "modal-next";
    prevBtn.innerHTML = "‹"; nextBtn.innerHTML = "›";
    modal.append(prevBtn, nextBtn);

    const closeModalFunc = () => {
      modal.style.display = "none";
      modalVideo.pause(); // Para o vídeo ao fechar
      modalVideo.src = ""; // Limpa o buffer
    };

    const renderItem = (index) => {
      const item = items[index];
      const isVideo = item.dataset.type === "video";

      // Reset total
      modalImg.style.display = "none";
      modalVideo.style.display = "none";
      modalVideo.pause();

      if (isVideo) {
        modalVideo.src = item.dataset.src;
        modalVideo.style.display = "block";
        modalVideo.play().catch(() => { });
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
      });
    });

    // Eventos de Clique
    prevBtn.onclick = (e) => { e.stopPropagation(); navigate(-1); };
    nextBtn.onclick = (e) => { e.stopPropagation(); navigate(1); };

    // Fechar ao clicar no fundo ou no botão X
    closeBtn.onclick = closeModalFunc;
    modal.onclick = (e) => { if (e.target === modal) closeModalFunc(); };

    // Teclado
    document.addEventListener("keydown", (e) => {
      if (modal.style.display !== "block") return;
      if (e.key === "Escape") closeModalFunc();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    });
  }

  // --- 4. OBSERVER DE ANIMAÇÃO ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".opacidade").forEach(el => observer.observe(el));
});