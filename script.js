// Navigation + interactions
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menu-icon");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const navLinks = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("contact-form");

  let isMenuOpen = false;

  // ==============================
  // CONTACT FORM → NETLIFY FUNCTION
  // ==============================
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // stop page reload

      const formData = new FormData(contactForm);

      const payload = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        message: formData.get("message"),
      };

      try {
        const res = await fetch("/.netlify/functions/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
          alert("Message sent successfully!");
          contactForm.reset();
        } else {
          alert("Something went wrong: " + (data.error || "try again later"));
        }
      } catch (err) {
        console.error(err);
        alert("Network error. Please try again later.");
      }
    });
  }

  // ==============================
  // NAVBAR SCROLL STYLE
  // ==============================
  function handleScroll() {
    const scrolled = window.scrollY > 50;

    if (scrolled) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // ==============================
  // MOBILE MENU TOGGLE
  // ==============================
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      mobileMenu.classList.add("active");
      menuIcon.className = "fas fa-times";
    } else {
      mobileMenu.classList.remove("active");
      menuIcon.className = "fas fa-bars";
    }
  }

  function closeMobileMenu() {
    isMenuOpen = false;
    mobileMenu.classList.remove("active");
    menuIcon.className = "fas fa-bars";
  }

  // ==============================
  // SMOOTH SCROLLING
  // ==============================
  function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
      const offsetTop = target.offsetTop - 64; // account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  }

  // ==============================
  // SERVICE CARD ANIMATION ON SCROLL
  // ==============================
  function animateOnScroll() {
    const serviceCards = document.querySelectorAll(".service-card");

    serviceCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, index * 100);
      }
    });
  }

  // ==============================
  // PARALLAX FOR HERO
  // ==============================
  function handleParallax() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector(".hero-bg");

    if (heroBackground) {
      const speed = scrolled * 0.5;
      heroBackground.style.transform = `translateY(${speed}px)`;
    }
  }

  // ==============================
  // EVENT LISTENERS
  // ==============================
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("scroll", animateOnScroll);
  window.addEventListener("scroll", handleParallax);

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  // Mobile nav links
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      closeMobileMenu();
      setTimeout(() => smoothScrollTo(targetId), 300);
    });
  });

  // Desktop nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      smoothScrollTo(targetId);
    });
  });

  // CTA buttons scroll to contact
  const ctaButtons = document.querySelectorAll(".btn-primary, .btn-cta");
  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollTo("#contact");
    });
  });

  // Hover effects for service cards
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // ==============================
  // INTERSECTION OBSERVER ANIMATIONS
  // ==============================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll(
    ".service-card, .testimonial-card, .about-content, .about-image"
  );
  animateElements.forEach((el) => observer.observe(el));

  // Initial animation check
  animateOnScroll();
});
