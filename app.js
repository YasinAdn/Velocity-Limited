document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Utility: Split Text into Words for Reveal ---
    const splitTextElements = document.querySelectorAll('.split-text');
    splitTextElements.forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = '';
        words.forEach((word, index) => {
            const wrapper = document.createElement('span');
            wrapper.className = 'line-wrapper';
            const inner = document.createElement('span');
            inner.className = 'line-text';
            inner.innerHTML = word;
            wrapper.appendChild(inner);
            el.appendChild(wrapper);
            if (index < words.length - 1) {
                el.appendChild(document.createTextNode(' '));
            }
        });
    });

    // --- Smooth Scrolling (Lenis) ---
    const lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 1,
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    
    // Global Scroll Progress Bar
    const progressBarGlobal = document.querySelector('.scroll-progress');
    lenis.on('scroll', (e) => {
        const progress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBarGlobal.style.width = `${progress}%`;
    });

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // --- 1. Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const cursorText = document.querySelector('.cursor-text');
    
    gsap.set(cursor, {xPercent: -50, yPercent: -50});
    
    const xTo = gsap.quickTo(cursor, "x", {duration: 0.15, ease: "power3"});
    const yTo = gsap.quickTo(cursor, "y", {duration: 0.15, ease: "power3"});
    
    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });
    
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor], .menu-toggle');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            const text = el.getAttribute('data-cursor') || 'VIEW';
            cursorText.innerText = text;
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            cursorText.innerText = '';
        });
    });

    // --- 2. Magnetic Elements ---
    const magneticEls = document.querySelectorAll('.magnetic');
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const h = rect.width / 2;
            const v = rect.height / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - v;
            
            gsap.to(el, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- 3. Audio Controller (Howler) ---
    // Using a placeholder ambient sci-fi sound from a free CDN or empty space if not available
    const ambientSound = new Howl({
        src: ['https://actions.google.com/sounds/v1/science_fiction/alien_spaceship_ambient.ogg'],
        loop: true,
        volume: 0,
        html5: true
    });

    let isAudioPlaying = false;
    const audioToggle = document.getElementById('audio-toggle');
    
    audioToggle.addEventListener('click', () => {
        if(!isAudioPlaying) {
            ambientSound.play();
            ambientSound.fade(0, 0.2, 2000); // fade in to 20% volume
            audioToggle.innerHTML = "SOUND [ ON ]";
            audioToggle.style.color = "var(--accent-primary)";
            isAudioPlaying = true;
        } else {
            ambientSound.fade(0.2, 0, 1000);
            setTimeout(() => ambientSound.pause(), 1000);
            audioToggle.innerHTML = "SOUND [ OFF ]";
            audioToggle.style.color = "var(--text-primary)";
            isAudioPlaying = false;
        }
    });

    // --- 4. Full Screen Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const fullMenu = document.querySelector('.full-menu');
    const menuLinks = document.querySelectorAll('.menu-link .line-text');
    let isMenuOpen = false;

    // Timeline for menu
    const menuTl = gsap.timeline({ paused: true });
    
    menuTl.to('.menu-bg', { opacity: 1, duration: 0.5, ease: "power2.inOut" })
          .to('.menu-link .line-text', { 
              y: 0, 
              opacity: 1, 
              duration: 0.8, 
              stagger: 0.1, 
              ease: "power4.out" 
          }, "-=0.3")
          .to('.menu-footer', { 
              y: 0, 
              opacity: 1, 
              duration: 0.5, 
              ease: "power2.out" 
          }, "-=0.5");

    menuToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if(isMenuOpen) {
            menuToggle.classList.add('active');
            fullMenu.classList.add('active');
            menuTl.play();
            lenis.stop(); // Prevent scrolling while menu is open
        } else {
            menuToggle.classList.remove('active');
            menuTl.reverse().then(() => {
                fullMenu.classList.remove('active');
            });
            lenis.start();
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            if(isMenuOpen) menuToggle.click();
        });
    });

    // --- 5. Loading Screen ---
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-percentage');
    
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += 1;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            
            gsap.to(loader, {
                opacity: 0,
                duration: 1.5,
                ease: "power4.inOut",
                delay: 0.2,
                onComplete: () => {
                    loader.style.display = 'none';
                    initScrollAnimations();
                }
            });
            
            progressBar.style.width = '100%';
            if(progressText) progressText.innerText = '100%';
        } else {
            progressBar.style.width = `${loadProgress}%`;
            if(progressText) progressText.innerText = `${loadProgress}%`;
        }
    }, 15);

    // --- 6. Three.js Enhanced Cyber Core ---
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    
    scene.fog = new THREE.FogExp2(0x03060a, 0.015);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const getBaseZ = () => window.innerWidth <= 768 ? 35 : 25;
    camera.position.z = getBaseZ();
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    
    const coreGeo = new THREE.IcosahedronGeometry(4, 1);
    const coreMat = new THREE.MeshBasicMaterial({ 
        color: 0x00e5ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreSphere);

    const innerGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x0077ff,
        transparent: true,
        opacity: 0.8
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);
    
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 1500; 
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 150;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    coreGroup.add(particlesMesh);
    
    for(let i = 0; i < 5; i++) {
        const ringGeo = new THREE.TorusGeometry(6 + (i * 2.5), 0.01, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: i % 2 === 0 ? 0x00e5ff : 0x0077ff, 
            transparent: true, 
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        coreGroup.add(ring);
    }
    
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    window.addEventListener('mousemove', (event) => {
        targetRotationX = (event.clientY / window.innerHeight) - 0.5;
        targetRotationY = (event.clientX / window.innerWidth) - 0.5;
    });
    
    const clock = new THREE.Clock();
    
    function animateThree() {
        const elapsedTime = clock.getElapsedTime();
        
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.1;
        innerSphere.scale.set(scale, scale, scale);
        
        coreSphere.rotation.y += 0.002;
        coreSphere.rotation.x += 0.001;
        innerSphere.rotation.y -= 0.005;
        
        coreGroup.children.forEach((child, index) => {
            if (child.geometry && child.geometry.type === 'TorusGeometry') {
                child.rotation.x += 0.001 * (index + 1);
                child.rotation.y += 0.002 * (index + 1);
            }
        });
        
        particlesMesh.rotation.y = -elapsedTime * 0.02;
        
        coreGroup.rotation.x += (targetRotationX * 0.5 - coreGroup.rotation.x) * 0.02;
        coreGroup.rotation.y += (targetRotationY * 0.5 - coreGroup.rotation.y) * 0.02;
        
        renderer.render(scene, camera);
        requestAnimationFrame(animateThree);
    }
    animateThree();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- 7. Enhanced GSAP Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);
    
    function initScrollAnimations() {
        const chapters = document.querySelectorAll('.chapter');
        const dots = document.querySelectorAll('.nav-dot');
        
        // Hero Intro
        const tl = gsap.timeline();
        tl.to('.hero .line-text', { 
              y: 0, 
              opacity: 1, 
              duration: 1.2, 
              ease: "power4.out", 
              stagger: 0.1 
          })
          .from('.hero .btn', { y: 20, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5");
        
        chapters.forEach((chapter, index) => {
            
            if(index > 0) {
                // Background massive number reveal
                gsap.from(chapter.querySelector('.bg-number'), {
                    scrollTrigger: {
                        trigger: chapter,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        scrub: 1
                    },
                    y: 200,
                    opacity: 0,
                    scale: 0.8
                });

                // Text blocks dramatic line-by-line reveal
                const chapterLines = chapter.querySelectorAll('.line-text');
                if(chapterLines.length > 0) {
                    gsap.to(chapterLines, {
                        scrollTrigger: {
                            trigger: chapter,
                            start: 'top 70%',
                            toggleActions: 'play reverse play reverse'
                        },
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power4.out",
                        stagger: 0.05
                    });
                }
            }
            
            // Side nav sync
            ScrollTrigger.create({
                trigger: chapter,
                start: 'top 50%',
                end: 'bottom 50%',
                onEnter: () => updateNavDot(index),
                onEnterBack: () => updateNavDot(index),
            });
        });
        
        // Cinematic Camera Fly-through (Global instead of per-chapter)
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                const currentBaseZ = getBaseZ();
                gsap.to(camera.position, {
                    z: currentBaseZ - (self.progress * 25),
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
                
                gsap.to(coreGroup.rotation, {
                    z: self.progress * Math.PI * 2,
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        });
        
        function updateNavDot(activeIndex) {
            dots.forEach((dot, idx) => {
                if(idx === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Counter Animations
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            ScrollTrigger.create({
                trigger: '#contact',
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    const target = +counter.getAttribute('data-target');
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2.5,
                        ease: "power3.out",
                        snap: { innerHTML: 1 }
                    });
                }
            });
        });
    }

    // --- 8. Contact Modal Logic ---
    const modal = document.getElementById('contact-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const modalBg = document.getElementById('modal-bg');

    function openModal(e) {
        if(e) e.preventDefault();
        modal.classList.add('active');
        lenis.stop(); // Stop background scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        lenis.start();
    }

    if(openModalBtn) openModalBtn.addEventListener('click', openModal);
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalBg) modalBg.addEventListener('click', closeModal);

    // --- 9. Form Submission Simulation ---
    const uplinkForm = document.getElementById('uplink-form');
    const formStatus = document.getElementById('form-status');

    if(uplinkForm) {
        uplinkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = uplinkForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.querySelector('span').innerText;
            
            submitBtn.querySelector('span').innerText = 'TRANSMITTING...';
            submitBtn.style.pointerEvents = 'none';
            
            // Simulate API Call / Supabase Backend
            setTimeout(() => {
                submitBtn.querySelector('span').innerText = originalText;
                submitBtn.style.pointerEvents = 'auto';
                formStatus.innerText = 'DATA PAYLOAD RECEIVED SUCCESSFULLY.';
                formStatus.className = 'form-status success';
                uplinkForm.reset();
                
                setTimeout(() => {
                    formStatus.innerText = '';
                    closeModal();
                }, 3000);
            }, 2000);
        });
    }

    // --- 10. Glass Card Tilt Effect ---
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // max rotation 5deg
            const rotateY = ((x - centerX) / centerX) * 5;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 1000
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.7,
                ease: "power2.out"
            });
        });
    });

});
