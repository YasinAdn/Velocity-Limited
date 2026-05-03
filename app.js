document.addEventListener('DOMContentLoaded', () => {
    
    // --- Smooth Scrolling (Lenis) ---
    const lenis = new Lenis({
        lerp: 0.08, // Snappier, smoother scroll than duration
        wheelMultiplier: 1,
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // --- 1. Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const cursorText = document.querySelector('.cursor-text');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    
    const speed = 0.1; // Slower inertia for heavier feel
    
    if (!isTouchDevice) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }
    
    function animateCursor() {
        let distX = mouseX - cursorX;
        let distY = mouseY - cursorY;
        
        cursorX = cursorX + (distX * speed);
        cursorY = cursorY + (distY * speed);
        
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    if (!isTouchDevice) {
        animateCursor();
        
        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, [data-cursor]');
        
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
    }

    // --- 2. Loading Screen ---
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.progress');
    
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 10;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            
            gsap.to(loader, {
                opacity: 0,
                duration: 1.5,
                ease: "power4.inOut",
                delay: 0.8,
                onComplete: () => {
                    loader.style.display = 'none';
                    initScrollAnimations();
                }
            });
            
            progressBar.style.width = '100%';
        } else {
            progressBar.style.width = `${loadProgress}%`;
        }
    }, 100);

    // --- 3. Three.js Enhanced Cyber Core ---
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    
    scene.fog = new THREE.FogExp2(0x03060a, 0.015); // Heavier fog
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const getBaseZ = () => window.innerWidth <= 768 ? 35 : 25;
    camera.position.z = getBaseZ();
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    
    // Complex Core
    const coreGeo = new THREE.IcosahedronGeometry(4, 1);
    const coreMat = new THREE.MeshBasicMaterial({ 
        color: 0x00e5ff, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreSphere);

    // Inner glowing solid core
    const innerGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x0077ff,
        transparent: true,
        opacity: 0.8
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);
    
    // Data Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 1500; // Reduced for performance and smoother scrolling
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
    
    // Multiple Orbital Rings
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
    
    // Mouse Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    window.addEventListener('mousemove', (event) => {
        targetRotationX = (event.clientY / window.innerHeight) - 0.5;
        targetRotationY = (event.clientX / window.innerWidth) - 0.5;
    });
    
    const clock = new THREE.Clock();
    
    function animateThree() {
        const elapsedTime = clock.getElapsedTime();
        
        // Breathing effect for inner core
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
        
        // Heavy mouse parallax
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

    // --- 4. Enhanced GSAP Scroll Animations ---
    gsap.registerPlugin(ScrollTrigger);
    
    function initScrollAnimations() {
        const chapters = document.querySelectorAll('.chapter');
        const dots = document.querySelectorAll('.nav-dot');
        
        // Hero Intro
        const tl = gsap.timeline();
        tl.from('.hero .giant-text', { y: 100, opacity: 0, duration: 1.5, ease: "power4.out", stagger: 0.2 })
          .from('.hero .fade-up', { y: 50, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.2 }, "-=1");
        
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

                // Text blocks dramatic reveal
                gsap.from(chapter.querySelectorAll('.chapter-label, .massive-text, .fade-up'), {
                    scrollTrigger: {
                        trigger: chapter,
                        start: 'top 60%',
                        toggleActions: 'play reverse play reverse'
                    },
                    y: 100,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power4.out",
                    stagger: 0.1
                });
            }
            
            // Side nav sync
            ScrollTrigger.create({
                trigger: chapter,
                start: 'top 50%',
                end: 'bottom 50%',
                onEnter: () => updateNavDot(index),
                onEnterBack: () => updateNavDot(index),
            });
            
            // Cinematic Camera Fly-through
            ScrollTrigger.create({
                trigger: chapter,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
                onUpdate: (self) => {
                    // Dive deeper into the core on scroll
                    const currentBaseZ = getBaseZ();
                    gsap.to(camera.position, {
                        z: currentBaseZ - (index * 8) + (self.progress * 4),
                        duration: 1,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                    
                    // Twist the core
                    gsap.to(coreGroup.rotation, {
                        z: index * Math.PI / 3,
                        duration: 1,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
            });
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
    }
});
