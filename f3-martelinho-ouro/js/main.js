/**
 * F3 MARTELINHO DE OURO - JAVASCRIPT PRINCIPAL
 * Funcionalidades interativas, Responsividade, Comparador Antes/Depois, 3D Parallax & Status em Tempo Real
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveBusinessHours();
  initBeforeAfterSliders();
  initHero3DTilt();
  initMobileMenu();
  initScrollSpy();
  initCardInteractions();
});

/* ==========================================================================
   1. HORÁRIO EM TEMPO REAL (CURITIBA - BRASIL / UTC-3)
   ========================================================================== */
function initLiveBusinessHours() {
  const statusBadges = document.querySelectorAll('.js-live-status');
  if (!statusBadges.length) return;

  function updateStatus() {
    // Obter data/hora atual no fuso horário de São Paulo/Curitiba
    const now = new Date();
    const curitibaTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'long',
      hour12: false
    }).formatToParts(now);

    let hour = 0;
    let minute = 0;
    let weekday = '';

    curitibaTime.forEach(part => {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
      if (part.type === 'weekday') weekday = part.value.toLowerCase();
    });

    const isWeekend = weekday.includes('sábado') || weekday.includes('sabado') || weekday.includes('domingo');
    const isSaturday = weekday.includes('sábado') || weekday.includes('sabado');
    const isWeekday = !isWeekend;
    
    // Horário comercial: Seg a Sex das 08h às 18h
    const isOpen = isWeekday && hour >= 8 && hour < 18;

    statusBadges.forEach(badge => {
      const dot = badge.querySelector('.status-indicator-dot') || badge.querySelector('.animate-pulse');
      const text = badge.querySelector('.js-status-text');

      if (!text) return;

      if (isOpen) {
        text.textContent = 'Aberto agora • Atendimento Imediato';
        if (dot) {
          dot.className = 'status-indicator-dot';
        }
      } else if (isSaturday) {
        text.textContent = 'Atendimento com Hora Marcada (Sáb)';
        if (dot) {
          dot.className = 'w-2 h-2 rounded-full bg-secondary inline-block mr-1';
        }
      } else {
        text.textContent = 'Fechado no momento • WhatsApp 24h';
        if (dot) {
          dot.className = 'w-2 h-2 rounded-full bg-outline inline-block mr-1';
        }
      }
    });
  }

  updateStatus();
  // Atualizar a cada 1 minuto
  setInterval(updateStatus, 60000);
}

/* ==========================================================================
   2. COMPARADOR ANTES & DEPOIS INTERATIVO (TOUCH + MOUSE DRAG)
   ========================================================================== */
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.before-after-container');

  sliders.forEach(container => {
    const overlay = container.querySelector('.before-after-overlay');
    const handle = container.querySelector('.before-after-handle');
    if (!overlay || !handle) return;

    let isDragging = false;

    function setPosition(xPos) {
      const rect = container.getBoundingClientRect();
      let offsetX = xPos - rect.left;
      let percentage = (offsetX / rect.width) * 100;

      // Limitar entre 5% e 95%
      if (percentage < 5) percentage = 5;
      if (percentage > 95) percentage = 95;

      overlay.style.width = `${percentage}%`;
      handle.style.left = `${percentage}%`;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      requestAnimationFrame(() => setPosition(clientX));
    }

    function startDrag(e) {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    }

    function stopDrag() {
      isDragging = false;
    }

    // Mouse Events
    container.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', stopDrag);

    // Touch Events
    container.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', stopDrag);
  });
}

/* ==========================================================================
   3. HERO 3D PARALLAX & TILT (APENAS DISPOSITIVOS COM PONTEIRO FINO)
   ========================================================================== */
function initHero3DTilt() {
  // Desabilitar em mobile ou para usuários que preferem movimento reduzido
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || prefersReduced) return;

  const stage = document.querySelector('.hero-stage-3d');
  const card = document.querySelector('.hero-card-tilt');
  if (!stage || !card) return;

  let ticking = false;

  stage.addEventListener('mousemove', (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
        const rotateY = ((x - centerX) / centerX) * 6;  // max 6deg

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  stage.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
}

/* ==========================================================================
   4. MENU MOBILE DRAWER
   ========================================================================== */
function initMobileMenu() {
  const openBtn = document.getElementById('mobileMenuOpen');
  const closeBtn = document.getElementById('mobileMenuClose');
  const drawer = document.getElementById('mobileDrawer');
  const navLinks = drawer ? drawer.querySelectorAll('a') : [];

  if (!openBtn || !closeBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   5. SCROLLSPY (DESTAQUE NA NAVEGAÇÃO ATIVA)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('text-primary', 'font-semibold');
            link.classList.remove('text-on-surface-variant');
          } else {
            link.classList.remove('text-primary', 'font-semibold');
            link.classList.add('text-on-surface-variant');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   6. MICROINTERAÇÕES NOS CARDS & MAPA
   ========================================================================== */
function initCardInteractions() {
  const cards = document.querySelectorAll('.card-interactive');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.classList.add('transition-transform', 'duration-300');
      }
    });
  });
}
