/**
 * L'Élixir Noir — Core Interaction Logic
 * Features: Luxury Preloader, Custom Cursor Lerp, Canvas Atmosphere (Light & Steam),
 * GSAP ScrollTrigger transitions, Interactive Menu filtering, 3D Tilt Cards, Immersive Gallery Swiper.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. Luxury Preloader & Intro Timeline
    // ==========================================================================
    const preloader = document.getElementById('preloader');
    const percentEl = document.getElementById('preloader-percentage');
    const preloaderLogo = document.getElementById('preloader-logo');
    const preloaderSpinner = document.getElementById('preloader-spinner-wrap');
    
    // Set GSAP defaults
    gsap.config({ nullTargetWarn: false });

    // Animate loader logo and spinner initial state
    gsap.to(preloaderLogo, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: 'power3.out'
    });

    gsap.to(preloaderSpinner, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Simulate progress load
    let count = 0;
    const counterInterval = setInterval(() => {
        count += Math.floor(Math.random() * 4) + 1;
        if (count >= 100) {
            count = 100;
            clearInterval(counterInterval);
            dismissPreloader();
        }
        percentEl.textContent = `${count}%`;
    }, 45);

    function dismissPreloader() {
        // Exit timeline for loader
        const tl = gsap.timeline({
            onComplete: () => {
                preloader.style.display = 'none';
                initScrollAnimations();
            }
        });

        tl.to(preloaderSpinner, {
            opacity: 0,
            y: -20,
            duration: 0.6,
            ease: 'power3.in'
        })
        .to(preloaderLogo, {
            opacity: 0,
            scale: 1.05,
            filter: 'blur(10px)',
            duration: 0.8,
            ease: 'power3.in'
        }, '-=0.4')
        .to(preloader, {
            opacity: 0,
            duration: 1,
            ease: 'power4.inOut'
        }, '-=0.4')
        
        // Hero section entry (staggered fade + blur reveal)
        .fromTo('.hero-subtitle-top', 
            { opacity: 0, y: 30, filter: 'blur(8px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        )
        .fromTo('.hero-title', 
            { opacity: 0, y: 40, filter: 'blur(12px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.8, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            '-=0.9'
        )
        .fromTo('.hero-description', 
            { opacity: 0, y: 30, filter: 'blur(8px)' },
            { opacity: 0.8, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            '-=1.2'
        )
        .fromTo('.hero-ctas', 
            { opacity: 0, y: 20, filter: 'blur(6px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
            '-=1.2'
        )
        .fromTo('header', 
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' },
            '-=1.5'
        )
        .fromTo('.scroll-indicator', 
            { opacity: 0, y: -10 },
            { opacity: 0.7, y: 0, duration: 1, ease: 'power2.out' },
            '-=0.5'
        );
    }

    // Scroll Down indicator click
    document.getElementById('scroll-indicator').addEventListener('click', () => {
        document.getElementById('story').scrollIntoView({ behavior: 'smooth' });
    });

    // ==========================================================================
    // 2. Custom Glowing Cursor (Lerped)
    // ==========================================================================
    const cursor = document.getElementById('custom-cursor');
    const cursorRing = document.getElementById('custom-cursor-ring');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    // Follow mouse directly
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Lerp outer ring movement for buttery smooth lag
    function tickCursor() {
        const ringSpeed = 0.15; // lower is slower/smoother
        
        ringX += (mouseX - ringX) * ringSpeed;
        ringY += (mouseY - ringY) * ringSpeed;
        
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        
        requestAnimationFrame(tickCursor);
    }
    tickCursor();

    // Attach hover classes
    function initCursorTriggers() {
        const triggers = document.querySelectorAll('.cursor-hover-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            trigger.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                document.body.classList.remove('cursor-drag');
            });
        });
    }
    initCursorTriggers();

    // ==========================================================================
    // 3. Floating Atmosphere Effects (Light Particles & Coffee Steam)
    // ==========================================================================
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let steamPuffs = [];

    // Fit canvas to window with DPI scaling
    function resizeCanvas() {
        const scale = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(scale, scale);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Light Particle Class
    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * window.innerWidth;
            this.y = initial ? Math.random() * window.innerHeight : window.innerHeight + 10;
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * 0.4 + 0.15;
            this.speedX = Math.random() * 0.2 - 0.1;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.maxOpacity = this.opacity;
            this.wiggleFreq = Math.random() * 0.005 + 0.002;
            this.wiggleAmp = Math.random() * 20 + 5;
            this.seed = Math.random() * 1000;
        }

        update(time) {
            this.y -= this.speedY;
            this.x += this.speedX + Math.sin(time * this.wiggleFreq + this.seed) * 0.15;
            
            // Fade out near the top
            if (this.y < window.innerHeight * 0.8) {
                const ratio = this.y / (window.innerHeight * 0.8);
                this.opacity = this.maxOpacity * ratio;
            }

            if (this.y < -20 || this.x < -20 || this.x > window.innerWidth + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(197, 168, 128, ${this.opacity})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(197, 168, 128, 0.4)';
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
        }
    }

    // Soft Coffee Steam Puff Class
    class SteamPuff {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            // Steam rises from central points like an imaginary coffee machine/bar
            const sources = [
                window.innerWidth * 0.2, 
                window.innerWidth * 0.5, 
                window.innerWidth * 0.8
            ];
            const chosenSource = sources[Math.floor(Math.random() * sources.length)];
            
            this.x = chosenSource + (Math.random() * 120 - 60);
            this.y = initial ? Math.random() * window.innerHeight : window.innerHeight + 100;
            this.radius = Math.random() * 150 + 80;
            this.speedY = Math.random() * 0.6 + 0.3;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.opacity = 0;
            this.maxOpacity = Math.random() * 0.035 + 0.01;
            this.life = 0;
            this.maxLife = Math.random() * 800 + 600;
            this.growRate = Math.random() * 0.15 + 0.08;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.radius += this.growRate;
            this.life++;

            // Fade in, then fade out
            const halfLife = this.maxLife / 2;
            if (this.life < 100) {
                this.opacity = (this.life / 100) * this.maxOpacity;
            } else if (this.life > halfLife) {
                const progress = (this.maxLife - this.life) / (this.maxLife - halfLife);
                this.opacity = this.maxOpacity * progress;
            } else {
                this.opacity = this.maxOpacity;
            }

            if (this.life >= this.maxLife || this.y < -200) {
                this.reset();
            }
        }

        draw() {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(197, 168, 128, ${this.opacity})`);
            grad.addColorStop(0.3, `rgba(150, 130, 110, ${this.opacity * 0.6})`);
            grad.addColorStop(1, 'rgba(7, 7, 7, 0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    // Populate arrays
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    for (let i = 0; i < 8; i++) {
        steamPuffs.push(new SteamPuff());
    }

    // Loop
    function animateAtmosphere(time) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Draw steam puffs first (background ambiance)
        steamPuffs.forEach(puff => {
            puff.update();
            puff.draw();
        });

        // Draw light particles
        particles.forEach(p => {
            p.update(time);
            p.draw();
        });

        requestAnimationFrame(animateAtmosphere);
    }
    requestAnimationFrame(animateAtmosphere);

    // ==========================================================================
    // 4. GSAP Scroll-Triggered Storytelling
    // ==========================================================================
    function initScrollAnimations() {
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);

        // Header Scrolled styling transition
        ScrollTrigger.create({
            trigger: "body",
            start: "100px top",
            onEnter: () => document.getElementById('main-header').classList.add('scrolled'),
            onLeaveBack: () => document.getElementById('main-header').classList.remove('scrolled'),
        });

        // Story Section reveal elements
        const revealElements = document.querySelectorAll('.reveal-element');
        revealElements.forEach(el => {
            gsap.fromTo(el, 
                { 
                    opacity: 0, 
                    y: 35, 
                    filter: 'blur(10px)' 
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Parallax image scrolling
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
            gsap.to(layer, {
                yPercent: -15, // Move slower upward on scroll down
                ease: 'none',
                scrollTrigger: {
                    trigger: layer.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Line-by-line mask reveal for story paragraph (luxury Apple-like)
        const storyTextElements = document.querySelectorAll('.story-text');
        storyTextElements.forEach(textEl => {
            // Split paragraph into lines using basic DOM manipulation
            const textContent = textEl.innerHTML;
            const words = textContent.split(' ');
            let lineContent = '';
            let newHTML = '';
            
            // Approximate lines (since we don't have SplitText, we simulate elegant block masks)
            // Splitting elements or applying GSAP mask reveal:
            // We can do a smooth wipe-in clip path for the story text container to simulate luxury text masking.
            gsap.fromTo(textEl,
                {
                    clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                    opacity: 0.3
                },
                {
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    opacity: 1,
                    duration: 1.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: textEl,
                        start: "top 80%",
                        end: "top 40%",
                        scrub: 1
                    }
                }
            );
        });

        // Masonry staggered loading animation
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            gsap.fromTo(item, 
                { 
                    opacity: 0, 
                    y: 50,
                    filter: 'blur(10px)'
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                    delay: (index % 3) * 0.15 // staggered columns
                }
            );
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
        if (document.body.classList.contains('nav-open')) {
            navLinks.style.display = 'flex';
            gsap.fromTo('.nav-links', 
                { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
                { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
            );
            gsap.fromTo('.nav-link', 
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.1 }
            );
        } else {
            gsap.to('.nav-links', {
                opacity: 0,
                scale: 0.95,
                filter: 'blur(5px)',
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    navLinks.style.display = '';
                }
            });
        }
    });

    // Close menu when clicking nav link on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('nav-open')) {
                document.body.classList.remove('nav-open');
                navLinks.style.display = '';
            }
        });
    });

    // ==========================================================================
    // 5. Dynamic Menu System & Interaction (3D Card Tilt)
    // ==========================================================================
    const menuData = {
        espresso: [
            {
                title: "Obsidian Espresso",
                price: "$6.50",
                desc: "Rich double extraction of direct-trade Ethiopian Geisha with deep dark cacao and orange blossom notes.",
                img: "https://images.unsplash.com/photo-151097252790b-af4f42dfb67f?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Smoked Maple Latte",
                price: "$8.00",
                desc: "Espresso pulled over wood-smoked maple syrup, organic velvet steamed milk, and pecan dust.",
                img: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Gold Velvet Cappuccino",
                price: "$9.50",
                desc: "Single origin espresso, silky textured milk, dusted with dark chocolate and finished with 24k gold leaf flakes.",
                img: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "The Elixir Rose Shakerato",
                price: "$7.50",
                desc: "Double-shot espresso shaken over crystal ice with fresh organic rosewater syrup, double strained.",
                img: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&q=80&w=200"
            }
        ],
        patisserie: [
            {
                title: "Truffle Chocolate Mousse",
                price: "$12.00",
                desc: "Valrhona dark chocolate mousse infused with black winter truffle oil, resting on a crisp hazelnut biscuit.",
                img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Golden Saffron Croissant",
                price: "$8.50",
                desc: "Traditional French croissant laminated with Isigny butter, brushed with organic Kashmiri saffron syrup glaze.",
                img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Pistachio Praline Éclair",
                price: "$10.50",
                desc: "Choux pastry filled with smooth Sicilian pistachio cream, coated with praline crunch and freeze-dried raspberry.",
                img: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Tahitian Vanilla Mille-Feuille",
                price: "$11.00",
                desc: "Three layers of caramelized puff pastry separated by luxurious piping of pure Tahitian vanilla bean custard.",
                img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200"
            }
        ],
        slowbar: [
            {
                title: "Siphon Geisha Reserve",
                price: "$14.00",
                desc: "Vacuum-brewed coffee using copper siphons. Highly aromatic, with notes of red currant, jasmine, and clean bergamot tea finish.",
                img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Kyoto Whiskey Cold Drip",
                price: "$11.00",
                desc: "24-hour slow drip extraction through spiral glass coils, resting in oak wood barrels. Deep, woodsy, and complex.",
                img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200"
            },
            {
                title: "Ethiopian Bloom Chemex",
                price: "$9.50",
                desc: "Pour-over method with custom thick paper filter, enhancing the clarity of citrus peel notes and sweet cane sugar finish.",
                img: "https://images.unsplash.com/photo-1607681034540-2c46cc71896d?auto=format&fit=crop&q=80&w=200"
            }
        ]
    };

    const menuGrid = document.getElementById('menu-grid');
    const menuTabs = document.querySelectorAll('.menu-tab');

    // Load category with staggered GSAP scale and blur reveal
    function loadMenuCategory(category) {
        // Fade out grid first
        gsap.to(menuGrid, {
            opacity: 0,
            y: 15,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                menuGrid.innerHTML = '';
                
                const items = menuData[category] || [];
                items.forEach((item) => {
                    const card = document.createElement('div');
                    card.className = 'menu-item cursor-hover-trigger';
                    card.innerHTML = `
                        <div class="menu-item-img-wrap">
                            <img src="${item.img}" alt="${item.title}" class="menu-item-img">
                        </div>
                        <div class="menu-item-info">
                            <div class="menu-item-header">
                                <h3 class="menu-item-title">${item.title}</h3>
                                <div class="menu-item-line"></div>
                                <span class="menu-item-price">${item.price}</span>
                            </div>
                            <p class="menu-item-desc">${item.desc}</p>
                        </div>
                    `;
                    menuGrid.appendChild(card);
                    
                    // Wire up Card Tilt effect to newly created cards
                    initCardTilt(card);
                });
                
                // Refresh cursor elements dynamically
                initCursorTriggers();

                // Staggered reveal of new items
                const menuItems = menuGrid.querySelectorAll('.menu-item');
                gsap.fromTo(menuItems, 
                    { 
                        opacity: 0, 
                        scale: 0.96, 
                        filter: 'blur(10px)',
                        y: 30
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        y: 0,
                        duration: 0.8,
                        stagger: 0.08,
                        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        onComplete: () => {
                            // Trigger price sliding visual after cards settle
                            menuItems.forEach(el => el.classList.add('visible'));
                        }
                    }
                );
                
                // Fade in grid back
                gsap.to(menuGrid, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });
    }

    // Initialize with first tab
    loadMenuCategory('espresso');

    // Tab switcher
    menuTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            if (tab.classList.contains('active')) return;
            
            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const category = tab.getAttribute('data-category');
            loadMenuCategory(category);
        });
    });

    // 3D Card Tilt Implementation
    function initCardTilt(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Calculate absolute mouse coordinates inside the element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set variables for soft glow background gradient (CSS)
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
            
            // Normalize relative positions from -0.5 to 0.5
            const normX = (x / rect.width) - 0.5;
            const normY = (y / rect.height) - 0.5;
            
            // Max tilt angle (degrees)
            const maxTilt = 8;
            const rotateX = -normY * maxTilt;
            const rotateY = normX * maxTilt;
            
            // 3D rotation transition with pure JS styles for micro-responsiveness
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset to flat
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // remove transition during active hover tracking
        });
    }

    // ==========================================================================
    // 6. Gallery Immersive Mode & Touch Swiper
    // ==========================================================================
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryModal = document.getElementById('gallery-modal');
    const modalSlider = document.getElementById('modal-slider');
    const modalClose = document.getElementById('modal-close');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');
    const progressEl = document.getElementById('modal-progress');
    
    // Select all gallery items (statically written in HTML)
    const galleryItemsList = Array.from(document.querySelectorAll('.gallery-item'));
    
    let activeIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationId = 0;

    // Open Modal
    galleryItemsList.forEach((item, index) => {
        item.classList.add('loaded'); // Mark loaded
        item.addEventListener('click', () => {
            activeIndex = index;
            openGalleryModal();
        });
    });

    function openGalleryModal() {
        document.body.style.overflow = 'hidden';
        galleryModal.classList.add('active');
        
        // Build slides dynamically
        modalSlider.innerHTML = '';
        galleryItemsList.forEach((item, idx) => {
            const imgEl = item.querySelector('.gallery-img');
            const catText = item.querySelector('.gallery-cat').textContent;
            const titleText = item.querySelector('.gallery-title').textContent;
            
            const slide = document.createElement('div');
            slide.className = `modal-slide ${idx === activeIndex ? 'active' : ''}`;
            slide.setAttribute('data-slide-index', idx);
            slide.innerHTML = `
                <div class="modal-img-wrap">
                    <img src="${imgEl.src}" alt="${imgEl.alt}" class="modal-img" draggable="false">
                </div>
                <div class="modal-caption">
                    <span class="modal-caption-cat">${catText}</span>
                    <h4 class="modal-caption-title">${titleText}</h4>
                </div>
            `;
            modalSlider.appendChild(slide);
            
            // Set up Drag/Swipe events on slide images
            const slideImgWrap = slide.querySelector('.modal-img-wrap');
            initSwipeEvents(slideImgWrap);
        });
        
        updateModalUI();
        
        // Stagger animations inside the open slide
        const activeSlide = modalSlider.querySelector('.modal-slide.active');
        gsap.fromTo(activeSlide.querySelector('.modal-img-wrap'),
            { scale: 0.9, filter: 'blur(10px)' },
            { scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
    }

    function closeGalleryModal() {
        document.body.style.overflow = '';
        galleryModal.classList.remove('active');
    }

    modalClose.addEventListener('click', closeGalleryModal);
    
    // Close modal on background click
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal || e.target === modalSlider) {
            closeGalleryModal();
        }
    });

    // Modal navigation
    function slideTo(index) {
        if (index < 0) index = galleryItemsList.length - 1;
        if (index >= galleryItemsList.length) index = 0;
        
        const slides = Array.from(modalSlider.querySelectorAll('.modal-slide'));
        const oldActive = modalSlider.querySelector('.modal-slide.active');
        const newActive = slides[index];
        
        if (oldActive === newActive) return;
        
        activeIndex = index;
        
        // Cinematic Transition: out slide fades/blurs, new slide slides & reveals
        const isNext = index > parseInt(oldActive.getAttribute('data-slide-index'));
        
        gsap.to(oldActive.querySelector('.modal-img-wrap'), {
            opacity: 0,
            x: isNext ? -60 : 60,
            scale: 0.93,
            filter: 'blur(10px)',
            duration: 0.8,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
            onComplete: () => {
                oldActive.classList.remove('active');
            }
        });
        
        gsap.to(oldActive.querySelector('.modal-caption'), {
            opacity: 0,
            y: 10,
            duration: 0.5
        });

        // Set layout position of new active slide prior to rendering
        newActive.classList.add('active');
        const newImgWrap = newActive.querySelector('.modal-img-wrap');
        const newCaption = newActive.querySelector('.modal-caption');
        
        gsap.fromTo(newImgWrap,
            { opacity: 0, x: isNext ? 60 : -60, scale: 0.93, filter: 'blur(10px)' },
            { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        
        gsap.fromTo(newCaption,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
        );
        
        updateModalUI();
    }

    function updateModalUI() {
        progressEl.textContent = `${activeIndex + 1} / ${galleryItemsList.length}`;
    }

    prevBtn.addEventListener('click', () => slideTo(activeIndex - 1));
    nextBtn.addEventListener('click', () => slideTo(activeIndex + 1));

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (!galleryModal.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeGalleryModal();
        if (e.key === 'ArrowLeft') slideTo(activeIndex - 1);
        if (e.key === 'ArrowRight') slideTo(activeIndex + 1);
    });

    // Swipe Event Hooks
    function initSwipeEvents(element) {
        element.addEventListener('mousedown', dragStart);
        element.addEventListener('touchstart', dragStart);
        element.addEventListener('mouseup', dragEnd);
        element.addEventListener('touchend', dragEnd);
        element.addEventListener('mousemove', dragAction);
        element.addEventListener('touchmove', dragAction);
        element.addEventListener('mouseleave', dragEnd);
    }

    function dragStart(e) {
        isDragging = true;
        startX = getPositionX(e);
        document.body.classList.add('cursor-drag');
        
        // Remove transitions during drag tracking
        const activeSlide = modalSlider.querySelector('.modal-slide.active');
        if (activeSlide) {
            const wrap = activeSlide.querySelector('.modal-img-wrap');
            wrap.style.transition = 'none';
        }
    }

    function dragAction(e) {
        if (!isDragging) return;
        
        const currentX = getPositionX(e);
        const diffX = currentX - startX;
        
        const activeSlide = modalSlider.querySelector('.modal-slide.active');
        if (activeSlide) {
            const wrap = activeSlide.querySelector('.modal-img-wrap');
            // Pull factor (soft boundaries)
            wrap.style.transform = `translateX(${diffX * 0.8}px) rotate(${diffX * 0.015}deg)`;
        }
    }

    function dragEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        document.body.classList.remove('cursor-drag');
        
        const activeSlide = modalSlider.querySelector('.modal-slide.active');
        if (!activeSlide) return;
        
        const wrap = activeSlide.querySelector('.modal-img-wrap');
        wrap.style.transition = ''; // Restore transition
        
        // Extract translation width
        const matrix = new DOMMatrix(window.getComputedStyle(wrap).transform);
        const diffX = matrix.m41; // TranslateX value
        
        wrap.style.transform = ''; // Clear temporary values

        // Trigger slide if dragged past threshold (100px)
        if (diffX < -100) {
            slideTo(activeIndex + 1);
        } else if (diffX > 100) {
            slideTo(activeIndex - 1);
        }
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    // ==========================================================================
    // 8. Taste Quiz / Blend Configurator (Canvas Blob & Matcher)
    // ==========================================================================
    const roastInput = document.getElementById('quiz-roast');
    const acidityInput = document.getElementById('quiz-acidity');
    const bodyInput = document.getElementById('quiz-body');
    const sweetnessInput = document.getElementById('quiz-sweetness');

    const roastVal = document.getElementById('val-roast');
    const acidityVal = document.getElementById('val-acidity');
    const bodyVal = document.getElementById('val-body');
    const sweetnessVal = document.getElementById('val-sweetness');

    if (roastInput && acidityInput && bodyInput && sweetnessInput) {
        const roastLabels = { 1: "Light", 2: "Medium", 3: "Dark" };
        const acidityLabels = { 1: "Low", 2: "Crisp", 3: "Vibrant" };
        const bodyLabels = { 1: "Light", 2: "Balanced", 3: "Heavy" };
        const sweetnessLabels = { 1: "Floral Honey", 2: "Caramel", 3: "Rich Cacao" };

        const blobCanvas = document.getElementById('blob-canvas');
        const bCtx = blobCanvas ? blobCanvas.getContext('2d') : null;

        function matchCoffee() {
            const roast = parseInt(roastInput.value);
            const acidity = parseInt(acidityInput.value);
            const body = parseInt(bodyInput.value);
            const sweetness = parseInt(sweetnessInput.value);

            let title = "";
            let price = "";
            let desc = "";

            if (roast === 1 && acidity === 3) {
                title = "Ethiopian Geisha Rose";
                price = "$14.00";
                desc = "An exquisite light roast showcasing vibrant acidity, sweet jasmine aromas, floral honey undertones, and a remarkably light, tea-like body.";
            } else if (roast === 3 && body === 3) {
                title = "Java Obsidian";
                price = "$12.50";
                desc = "A bold, heavy-bodied dark roast featuring low acidity, notes of rich roasted cacao, toasted walnut, and a smooth velvet finish.";
            } else if (roast === 2 && acidity === 2) {
                title = "Kona Saffron Reserve";
                price = "$11.50";
                desc = "A perfectly balanced medium roast featuring crisp acidity, smooth caramel sweetness, subtle saffron highlights, and a medium body.";
            } else {
                title = "Sumatra Forest";
                price = "$10.00";
                desc = "A rustic, low-acidity medium-dark roast with a heavy body, presenting deep earthy tones, caramel sweetness, and a sweet cedar finish.";
            }

            const resultCard = document.getElementById('quiz-result-card');
            const resultTitle = document.getElementById('result-title');
            const resultPrice = document.getElementById('result-price');
            const resultDesc = document.getElementById('result-desc');

            if (resultTitle && resultTitle.textContent !== title) {
                gsap.to(resultCard, {
                    filter: 'blur(10px)',
                    opacity: 0.3,
                    scale: 0.98,
                    duration: 0.3,
                    onComplete: () => {
                        resultTitle.textContent = title;
                        resultPrice.textContent = price;
                        resultDesc.textContent = desc;

                        gsap.to(resultCard, {
                            filter: 'blur(0px)',
                            opacity: 1,
                            scale: 1,
                            duration: 0.6,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        }

        function updateSliderValues() {
            roastVal.textContent = roastLabels[roastInput.value];
            acidityVal.textContent = acidityLabels[acidityInput.value];
            bodyVal.textContent = bodyLabels[bodyInput.value];
            sweetnessVal.textContent = sweetnessLabels[sweetnessInput.value];
            matchCoffee();
        }

        [roastInput, acidityInput, bodyInput, sweetnessInput].forEach(slider => {
            slider.addEventListener('input', updateSliderValues);
        });

        // Blob drawing logic
        let blobTime = 0;
        function drawBlob() {
            if (!blobCanvas || !bCtx) return;

            bCtx.clearRect(0, 0, blobCanvas.width, blobCanvas.height);

            const roast = parseInt(roastInput.value);
            const acidity = parseInt(acidityInput.value);
            const body = parseInt(bodyInput.value);
            const sweetness = parseInt(sweetnessInput.value);

            // Parameters based on sliders
            const baseRadius = 75 + body * 15;
            const waveSpeed = 0.01 + acidity * 0.015;
            const waveAmp = 8 + acidity * 10 - sweetness * 2.5;

            blobTime += waveSpeed;

            const points = [];
            const numPoints = 8;
            const cx = 160;
            const cy = 160;

            for (let i = 0; i < numPoints; i++) {
                const angle = (i * Math.PI * 2) / numPoints;
                const offset = Math.sin(blobTime + i * 1.5) * waveAmp + Math.cos(blobTime * 0.7 - i * 0.8) * (waveAmp / 2);
                const r = baseRadius + offset;
                points.push({
                    x: cx + Math.cos(angle) * r,
                    y: cy + Math.sin(angle) * r
                });
            }

            bCtx.beginPath();
            bCtx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < numPoints; i++) {
                const p0 = points[i];
                const p1 = points[(i + 1) % numPoints];
                const xc = (p0.x + p1.x) / 2;
                const yc = (p0.y + p1.y) / 2;
                bCtx.quadraticCurveTo(p0.x, p0.y, xc, yc);
            }
            bCtx.closePath();

            // Set colors depending on Roast depth
            let colorStart, colorEnd;
            if (roast === 1) {
                colorStart = "rgba(224, 184, 120, 0.85)";
                colorEnd = "rgba(163, 114, 52, 0.15)";
            } else if (roast === 2) {
                colorStart = "rgba(197, 168, 128, 0.85)";
                colorEnd = "rgba(115, 87, 50, 0.15)";
            } else {
                colorStart = "rgba(97, 68, 38, 0.9)";
                colorEnd = "rgba(36, 20, 10, 0.2)";
            }

            const grad = bCtx.createRadialGradient(cx, cy, 10, cx, cy, baseRadius + waveAmp);
            grad.addColorStop(0, colorStart);
            grad.addColorStop(0.75, colorEnd);
            grad.addColorStop(1, "rgba(7, 7, 7, 0)");

            bCtx.fillStyle = grad;
            bCtx.fill();

            // Border
            bCtx.strokeStyle = "rgba(197, 168, 128, 0.3)";
            bCtx.lineWidth = 2;
            bCtx.stroke();

            requestAnimationFrame(drawBlob);
        }

        // Initialize quiz slider settings
        updateSliderValues();
        if (blobCanvas) {
            blobCanvas.width = 320;
            blobCanvas.height = 320;
            requestAnimationFrame(drawBlob);
        }

        // Connect match button to Form input
        const quizActionBtn = document.querySelector('.result-action-btn');
        const notesInput = document.getElementById('notes');

        if (quizActionBtn && notesInput) {
            quizActionBtn.addEventListener('click', (e) => {
                const recommendedCoffee = document.getElementById('result-title').textContent;
                notesInput.value = `Please include a tasting of the ${recommendedCoffee} with our experience.`;
                setTimeout(() => {
                    notesInput.focus();
                    gsap.fromTo(notesInput.parentElement, {
                        borderColor: '#c5a880',
                        boxShadow: '0 0 15px rgba(197, 168, 128, 0.4)'
                    }, {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: 'none',
                        duration: 1.5,
                        ease: 'power2.out'
                    });
                }, 600);
            });
        }
    }

    // ==========================================================================
    // 9. 3D Golden Invitation Ticket & Envelope Submission
    // ==========================================================================
    const reserveForm = document.getElementById('reserve-form');
    const reserveSuccessWrap = document.getElementById('reserve-success-wrap');
    const reserveHeaderWrap = document.getElementById('reserve-header-wrap');
    const waxSealButton = document.getElementById('wax-seal-button');
    const envelopeContainer = document.getElementById('envelope-container');
    const goldTicket = document.getElementById('gold-ticket');
    const successActions = document.getElementById('success-actions');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    if (reserveForm && reserveSuccessWrap) {
        // Intercept form submission
        reserveForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract values
            const nameVal = document.getElementById('name').value;
            const guestsVal = document.getElementById('guests').value;
            const dateVal = document.getElementById('date').value;
            const timeVal = document.getElementById('time').value;

            // Pre-fill ticket fields
            document.getElementById('ticket-name').textContent = nameVal.toUpperCase();
            document.getElementById('ticket-guests').textContent = guestsVal.toUpperCase();
            document.getElementById('ticket-date').textContent = dateVal;
            document.getElementById('ticket-time').textContent = timeVal;

            // Generate unique invitation code
            const randHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
            document.getElementById('ticket-code').textContent = `EN-2026-${randHex}`;

            // Animate exit of Form
            const formTimeline = gsap.timeline({
                onComplete: () => {
                    reserveForm.style.display = 'none';
                    if (reserveHeaderWrap) reserveHeaderWrap.style.display = 'none';

                    // Enforce min-height by adding success-mode class
                    const containerElement = document.querySelector('.reserve-container');
                    if (containerElement) containerElement.classList.add('success-mode');

                    // Reveal Success Container
                    reserveSuccessWrap.style.display = 'flex';
                    gsap.fromTo(reserveSuccessWrap, {
                        opacity: 0
                    }, {
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power2.out'
                    });

                    // Clear previous states
                    if (envelopeContainer) envelopeContainer.className = 'envelope-container';
                    if (goldTicket) {
                        goldTicket.style.transform = '';
                        goldTicket.style.transition = '';
                    }
                    if (successActions) {
                        successActions.style.opacity = '0';
                        successActions.style.transform = 'translateY(15px)';
                    }

                    // Animate Envelope slide-in
                    if (envelopeContainer) {
                        gsap.fromTo(envelopeContainer, {
                            y: 80,
                            opacity: 0,
                            rotateX: -15
                        }, {
                            y: 0,
                            opacity: 1,
                            rotateX: 0,
                            duration: 1.2,
                            ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
                        });
                    }
                }
            });

            formTimeline.to([reserveForm, reserveHeaderWrap].filter(Boolean), {
                opacity: 0,
                y: -25,
                filter: 'blur(8px)',
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.in'
            });
        });

        // Click Wax Seal to Open Envelope
        if (waxSealButton && envelopeContainer && goldTicket) {
            waxSealButton.addEventListener('click', () => {
                // Break seal
                envelopeContainer.classList.add('broken');

                // Open flap and slide ticket out
                setTimeout(() => {
                    envelopeContainer.classList.add('open');

                    const ticketY = window.innerWidth <= 568 ? -110 : -150;
                    const ticketTimeline = gsap.timeline();
                    ticketTimeline.to(goldTicket, {
                        y: ticketY,
                        z: 50,
                        rotationX: 10,
                        duration: 1.4,
                        ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
                    });

                    if (successActions) {
                        ticketTimeline.to(successActions, {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power2.out'
                        }, '-=0.5');
                    }

                    // Initialize 3D mouse card tilt
                    initTicketTilt();

                }, 800);
            });
        }

        // Return to website reset handler
        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', () => {
                gsap.to(reserveSuccessWrap, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.in',
                    onComplete: () => {
                        reserveSuccessWrap.style.display = 'none';
                        reserveForm.reset();

                        // Reset layouts
                        reserveForm.style.display = '';
                        if (reserveHeaderWrap) reserveHeaderWrap.style.display = '';

                        // Remove success-mode class to let height contract back smoothly
                        const containerElement = document.querySelector('.reserve-container');
                        if (containerElement) containerElement.classList.remove('success-mode');

                        gsap.fromTo([reserveHeaderWrap, reserveForm].filter(Boolean), {
                            opacity: 0,
                            y: 25,
                            filter: 'blur(8px)'
                        }, {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            duration: 0.8,
                            stagger: 0.1,
                            ease: 'power3.out'
                        });
                    }
                });
            });
        }

        // 3D Tilt interaction on Invitation Card
        function initTicketTilt() {
            if (!goldTicket) return;

            goldTicket.addEventListener('mousemove', (e) => {
                const rect = goldTicket.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Sheen
                const sheenX = (x / rect.width) * 100;
                const sheenY = (y / rect.height) * 100;
                goldTicket.style.setProperty('--sheen-x', `${sheenX}%`);
                goldTicket.style.setProperty('--sheen-y', `${sheenY}%`);

                // Normal coordinates
                const normX = (x / rect.width) - 0.5;
                const normY = (y / rect.height) - 0.5;

                const maxTilt = 12;
                const rotateX = -normY * maxTilt + 10; // 10deg default offset
                const rotateY = normX * maxTilt;

                const ticketY = window.innerWidth <= 568 ? -110 : -150;
                goldTicket.style.transform = `translate3d(0, ${ticketY}px, 50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            goldTicket.addEventListener('mouseleave', () => {
                const ticketY = window.innerWidth <= 568 ? -110 : -150;
                goldTicket.style.transform = `translate3d(0, ${ticketY}px, 50px) rotateX(10deg) rotateY(0deg)`;
                goldTicket.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                goldTicket.style.setProperty('--sheen-x', '0%');
                goldTicket.style.setProperty('--sheen-y', '0%');
            });

            goldTicket.addEventListener('mouseenter', () => {
                goldTicket.style.transition = 'none';
            });
        }
    }
});
