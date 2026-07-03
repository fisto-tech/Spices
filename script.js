const preloader = document.getElementById("preloader");
const preloaderPercentage = document.getElementById("preloader-percentage");
const canvas = document.getElementById("hero-lightpass");
const context = canvas ? canvas.getContext("2d") : null;
if (canvas) {
    canvas.width = 1920;
    canvas.height = 1080;
}

const frameCount = 240;
const currentFrame = index => (
    `./src/assets/sec1vdo-Frame/${(index + 1).toString().padStart(5, '0')}.webp`
);

const videoImages = [];
const videoState = {
    frame: 0
};

let loadedCount = 0;

function hidePreloader() {
    if (preloader) {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
        setTimeout(() => {
            preloader.style.display = "none";
        }, 500);
    }
}

function renderVideoFrame() {
    if (context && videoImages[videoState.frame]) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(videoImages[videoState.frame], 0, 0, canvas.width, canvas.height);
    }
}

// Load frames and update percentage
if (canvas) {
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();

        const handleLoad = () => {
            loadedCount++;
            if (preloaderPercentage) {
                const percent = Math.floor((loadedCount / frameCount) * 100);
                preloaderPercentage.innerText = `${percent}%`;
            }
            if (loadedCount === 1) {
                // Render the first frame as soon as it's ready
                renderVideoFrame();
            }
            if (loadedCount === frameCount) {
                // All frames loaded (or failed), hide preloader
                hidePreloader();
            }
        };

        img.onload = handleLoad;
        img.onerror = handleLoad;

        img.src = currentFrame(i);
        videoImages.push(img);
    }

    gsap.to(videoState, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        duration: 8,
        repeat: -1,
        onUpdate: renderVideoFrame
    });
} else {
    hidePreloader();
}

console.clear();

const sections = gsap.utils.toArray(".slide");
const images = gsap.utils.toArray(".image");
const slideImages = gsap.utils.toArray(".slide__img");
const outerWrappers = gsap.utils.toArray(".slide__outer");
const innerWrappers = gsap.utils.toArray(".slide__inner");
const wrap = gsap.utils.wrap(0, sections.length);
let animating;
let isNavigating = false;
let currentIndex = 0;
let section2Active = false;
let normalContentActive = false;
let section2Step = 0;

function updateSection2Popups() {
    const popups = document.querySelectorAll('.bowl-popup');
    if (popups.length < 5) return;
    popups.forEach(p => p.classList.remove('active'));

    if (section2Step === 1) {
        popups[2].classList.add('active'); // Middle
    }
    if (section2Step === 2) {
        popups[1].classList.add('active');
        popups[3].classList.add('active');
    }
    if (section2Step === 3) {
        popups[0].classList.add('active');
        popups[4].classList.add('active');
    }
}

gsap.set(outerWrappers, { xPercent: 100 });
gsap.set(innerWrappers, { xPercent: -100 });
gsap.set(".slide:nth-of-type(1) .slide__outer", { xPercent: 0 });
gsap.set(".slide:nth-of-type(1) .slide__inner", { xPercent: 0 });

function gotoSection(index, direction) {
    animating = true;
    index = wrap(index);

    let tl = gsap.timeline({
        defaults: { duration: 0.5, ease: "expo.inOut" },
        onComplete: () => {
            animating = false;
        }
    });

    let currentSection = sections[currentIndex];
    let heading = currentSection.querySelector(".slide__heading");
    let nextSection = sections[index];
    let nextHeading = nextSection.querySelector(".slide__heading");

    gsap.set([sections, images], { zIndex: 0, autoAlpha: 0 });
    gsap.set([sections[currentIndex], images[index]], { zIndex: 1, autoAlpha: 1 });
    gsap.set([sections[index], images[currentIndex]], { zIndex: 2, autoAlpha: 1 });

    tl
        .fromTo(
            outerWrappers[index],
            {
                xPercent: 100 * direction
            },
            { xPercent: 0 },
            0
        )
        .fromTo(
            innerWrappers[index],
            {
                xPercent: -100 * direction
            },
            { xPercent: 0 },
            0
        )
        .to(
            heading,
            {
                "--width": 800,
                xPercent: 30 * direction
            },
            0
        )
        .fromTo(
            nextHeading,
            {
                "--width": 800,
                xPercent: -30 * direction
            },
            {
                "--width": 200,
                xPercent: 0
            },
            0
        )
        .fromTo(
            images[index],
            {
                xPercent: 125 * direction,
                scaleX: 1.5,
                scaleY: 1.3
            },
            { xPercent: 0, scaleX: 1, scaleY: 1, duration: 0.5 },
            0
        )
        .fromTo(
            images[currentIndex],
            { xPercent: 0, scaleX: 1, scaleY: 1 },
            {
                xPercent: -125 * direction,
                scaleX: 1.5,
                scaleY: 1.3
            },
            0
        )
        .fromTo(
            slideImages[index],
            {
                scale: 2
            },
            { scale: 1 },
            0
        )
        .timeScale(1.5);

    currentIndex = index;
}

const observer = Observer.create({
    type: "wheel,touch,pointer",
    preventDefault: true,
    wheelSpeed: -1,
    onUp: () => {
        console.log("down");
        if (animating) return;
        if (section2Active) {
            if (section2Step < 3) {
                section2Step++;
                updateSection2Popups();
                animating = true;
                setTimeout(() => animating = false, 400);
                return;
            } else {
                animating = true;
                gsap.to(".section2", { yPercent: -100, duration: 0.5, ease: "expo.inOut", onComplete: () => { animating = false; section2Active = false; } });
                return;
            }
        }
        if (currentIndex === sections.length - 1 && !normalContentActive) {
            animating = true;
            gsap.to(".normal-content", {
                yPercent: -100, duration: 0.5, ease: "expo.inOut", onComplete: () => {
                    animating = false;
                    normalContentActive = true;
                    observer.disable(); // Allow native scroll
                }
            });
            return;
        }
        if (normalContentActive) return;
        gotoSection(currentIndex + 1, +1);
    },
    onDown: () => {
        console.log("up");
        if (animating) return;
        if (normalContentActive) {
            animating = true;
            gsap.to(".normal-content", { yPercent: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => { animating = false; normalContentActive = false; } });
            return;
        }
        if (!section2Active && currentIndex === 0) {
            animating = true;
            gsap.to(".section2", { yPercent: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => { animating = false; section2Active = true; section2Step = 3; updateSection2Popups(); } });
            return;
        }
        if (section2Active) {
            if (section2Step > 0) {
                section2Step--;
                updateSection2Popups();
                animating = true;
                setTimeout(() => animating = false, 400);
            } else {
                // Transition back to section 1
                section2Active = false;
                observer.disable();
                document.body.style.overflowX = '';
                document.body.style.overflowY = '';
                document.body.style.overflow = ''; // allow native scroll
                window.scrollBy(0, -10); // nudge up slightly to re-trigger normal scrolling
            }
            return;
        }
        gotoSection(currentIndex - 1, -1);
    },
    tolerance: 0
});

// Initially disable observer for section 1
observer.disable();

ScrollTrigger.create({
    trigger: ".section2",
    start: "top top",
    onEnter: () => {
        if (isNavigating) return;
        gsap.set(".section1", { autoAlpha: 0 });
        document.body.style.overflow = 'hidden';
        observer.enable();
        section2Active = true;
        section2Step = 0;
        updateSection2Popups();
    },
    onLeaveBack: () => {
        gsap.set(".section1", { autoAlpha: 1 });
    }
});

document.addEventListener("keydown", logKey);

function logKey(e) {
    if ((e.code === "ArrowUp" || e.code === "ArrowLeft") && !animating) {
        if (normalContentActive) {
            animating = true;
            gsap.to(".normal-content", { yPercent: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => { animating = false; normalContentActive = false; } });
            return;
        }
        if (!section2Active && currentIndex === 0) {
            animating = true;
            gsap.to(".section2", { yPercent: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => { animating = false; section2Active = true; section2Step = 3; updateSection2Popups(); } });
            return;
        }
        if (section2Active) {
            if (section2Step > 0) {
                section2Step--;
                updateSection2Popups();
                animating = true;
                setTimeout(() => animating = false, 400);
            } else {
                section2Active = false;
                observer.disable();
                document.body.style.overflowX = 'hidden';
                document.body.style.overflowY = 'auto'; // allow native scroll
                window.scrollBy(0, -10); // nudge up slightly
            }
            return;
        }
        gotoSection(currentIndex - 1, -1);
    }
    if (
        (e.code === "ArrowDown" ||
            e.code === "ArrowRight" ||
            e.code === "Space" ||
            e.code === "Enter") &&
        !animating
    ) {
        if (section2Active) {
            if (section2Step < 3) {
                section2Step++;
                updateSection2Popups();
                animating = true;
                setTimeout(() => animating = false, 400);
                return;
            } else {
                animating = true;
                gsap.to(".section2", { yPercent: -100, duration: 0.5, ease: "expo.inOut", onComplete: () => { animating = false; section2Active = false; } });
                return;
            }
        }
        if (currentIndex === sections.length - 1 && !normalContentActive) {
            animating = true;
            gsap.to(".normal-content", {
                yPercent: -100, duration: 0.5, ease: "expo.inOut", onComplete: () => {
                    animating = false;
                    normalContentActive = true;
                    observer.disable();
                }
            });
            return;
        }
        if (normalContentActive) return;
        gotoSection(currentIndex + 1, 1);
    }
}

// Re-enable observer when scrolling back up to the top of normal-content
const normalContentEl = document.querySelector(".normal-content");
if (normalContentEl) {
    normalContentEl.addEventListener("wheel", (e) => {
        if (normalContentEl.scrollTop <= 0 && e.deltaY < 0 && !animating) {
            // user scrolled up at the very top of normal content
            e.preventDefault();
            animating = true;
            gsap.to(".normal-content", {
                yPercent: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => {
                    animating = false;
                    normalContentActive = false;
                    observer.enable();
                }
            });
        }
    });
}

// Section 4 Card Selection Logic
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('click', () => {
        productCards.forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');
    });
});

// Section 4 Product Pagination & Filtering
const tabs = document.querySelectorAll('.section4-tabs .tab');
const productCardsItems = document.querySelectorAll('.product-card');
const prevBtn = document.querySelector('.section4-pagination .prev-btn');
const nextBtn = document.querySelector('.section4-pagination .next-btn');
const pageDotsContainer = document.querySelector('.section4-pagination .page-dots');

let currentFilter = 'all';
let currentPage = 0;
const itemsPerPage = 8;
let filteredCards = [];

function renderProducts() {
    filteredCards = Array.from(productCardsItems).filter(card => {
        return currentFilter === 'all' || card.getAttribute('data-category') === currentFilter;
    });

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    if (currentPage >= totalPages && totalPages > 0) {
        currentPage = totalPages - 1;
    }

    productCardsItems.forEach(card => card.style.display = 'none');
    const startIdx = currentPage * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    for (let i = startIdx; i < Math.min(endIdx, filteredCards.length); i++) {
        filteredCards[i].style.display = 'block';
    }

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1 || totalPages === 0;

    if (pageDotsContainer) {
        pageDotsContainer.innerHTML = '';
        if (totalPages > 1) {
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === currentPage) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    currentPage = i;
                    renderProducts();
                });
                pageDotsContainer.appendChild(dot);
            }
            document.querySelector('.section4-pagination').style.display = 'flex';
        } else {
            document.querySelector('.section4-pagination').style.display = 'none';
        }
    }
}

if (productCardsItems.length > 0) renderProducts();

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        currentFilter = tab.getAttribute('data-filter');
        currentPage = 0;
        renderProducts();
    });
});

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            renderProducts();
        }
    });
}
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderProducts();
        }
    });
}

// Section 5 List Item Animation
gsap.from(".choose-item", {
    scrollTrigger: {
        trigger: ".section5",
        scroller: ".normal-content",
        start: "top 75%",
        toggleActions: "play none none reverse"
    },
    x: -100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out"
});

// Golden Glitters Effect
function createGlitters() {
    const slides = document.querySelectorAll('.slide__content');
    if (slides.length === 0) return;

    slides.forEach(slide => {
        if (slide.querySelector('.glitter-container')) return;

        const container = document.createElement('div');
        container.classList.add('glitter-container');

        const glitterCount = 30;
        for (let i = 0; i < glitterCount; i++) {
            const glitter = document.createElement('div');
            glitter.classList.add('glitter');

            const size = Math.random() * 5 + 2;
            const left = Math.random() * 100;
            const duration = Math.random() * 4 + 3;
            const delay = Math.random() * 5;

            glitter.style.width = `${size}px`;
            glitter.style.height = `${size}px`;
            glitter.style.left = `${left}vw`;
            glitter.style.animationDuration = `${duration}s`;
            glitter.style.animationDelay = `${delay}s`;

            container.appendChild(glitter);
        }

        slide.insertBefore(container, slide.firstChild);
    });
}
document.addEventListener("DOMContentLoaded", createGlitters);
createGlitters();

// Navigation Bar Links Logic
document.querySelectorAll('.nav-links a, .footer-links-container a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const targetId = href.substring(1);
        const sec2Top = document.querySelector('.section2').offsetTop;

        isNavigating = true;
        setTimeout(() => { isNavigating = false; }, 1000);

        // Update URL hash
        if (history.pushState) {
            history.pushState(null, null, '#' + targetId);
        } else {
            location.hash = '#' + targetId;
        }

        if (targetId === 'home') {
            isNavigating = true;
            document.body.style.overflow = '';
            document.body.style.overflowY = '';
            document.documentElement.style.overflow = '';
            document.body.offsetHeight; // Force reflow
            observer.disable();
            section2Active = false;

            // Hide section 3 slides just in case we are coming from new-arrival
            gsap.set([sections, images], { zIndex: 0, autoAlpha: 0 });
            if (sections.length > 0) {
                gsap.set([sections[0], images[0]], { zIndex: 2, autoAlpha: 1 });
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });

            gsap.set(".section1", { autoAlpha: 1 });
            if (normalContentActive) {
                animating = true;
                gsap.to(".normal-content", {
                    yPercent: 0, duration: 0.5, onComplete: () => {
                        animating = false;
                        normalContentActive = false;
                    }
                });
            }
            gsap.to(".section2", { yPercent: 0, duration: 0.5 });
        }
        else if (targetId === 'our-collections') {
            const activateSection2 = () => {
                document.body.style.overflow = '';
                document.body.style.overflowY = '';
                document.documentElement.style.overflow = '';
                document.body.offsetHeight; // Force reflow
                window.scrollTo({ top: sec2Top });
                gsap.set(".section1", { autoAlpha: 0 });
                animating = true;
                gsap.to(".section2", {
                    yPercent: 0, duration: 0.5, onComplete: () => {
                        animating = false;
                        section2Active = true;
                        section2Step = 3;
                        updateSection2Popups();
                        observer.enable();
                        document.body.style.overflow = 'hidden';
                    }
                });
            };

            if (normalContentActive) {
                animating = true;
                gsap.to(".normal-content", {
                    yPercent: 0, duration: 0.5, onComplete: () => {
                        animating = false;
                        normalContentActive = false;
                        activateSection2();
                    }
                });
            } else {
                activateSection2();
            }
        }
        else if (targetId === 'new-arrival') {
            const activateSection3 = () => {
                document.body.style.overflow = '';
                document.body.style.overflowY = '';
                document.documentElement.style.overflow = '';
                document.body.offsetHeight; // Force reflow
                window.scrollTo({ top: sec2Top });
                section2Active = false;
                gsap.set(".section1", { autoAlpha: 0 });
                gsap.set(".section2", { yPercent: -100 });
                if (currentIndex !== 0) {
                    gotoSection(0, 1);
                } else {
                    gsap.set([sections, images], { zIndex: 0, autoAlpha: 0 });
                    gsap.set([sections[0], images[0]], { zIndex: 2, autoAlpha: 1 });
                    gsap.set(outerWrappers[0], { xPercent: 0 });
                    gsap.set(innerWrappers[0], { xPercent: 0 });
                    if (sections[0].querySelector(".slide__heading")) {
                        gsap.set(sections[0].querySelector(".slide__heading"), { autoAlpha: 1, xPercent: 0, "--width": 200 });
                    }
                }
                observer.enable();
                document.body.style.overflow = 'hidden';
            };

            if (normalContentActive) {
                animating = true;
                gsap.to(".normal-content", {
                    yPercent: 0, duration: 0.5, onComplete: () => {
                        animating = false;
                        normalContentActive = false;
                        activateSection3();
                    }
                });
            } else if (section2Active) {
                animating = true;
                gsap.to(".section2", {
                    yPercent: -100, duration: 0.5, onComplete: () => {
                        animating = false;
                        section2Active = false;
                        activateSection3();
                    }
                });
            } else {
                activateSection3();
            }
        }
        else if (targetId === 'products' || targetId === 'contact-us' || targetId === 'our-process') {
            const showNormalContent = (callback) => {
                if (!normalContentActive) {
                    document.body.style.overflow = '';
                    document.body.style.overflowY = '';
                    document.documentElement.style.overflow = '';
                    document.body.offsetHeight; // Force reflow
                    window.scrollTo({ top: sec2Top });
                    gsap.set(".section1", { autoAlpha: 0 });
                    section2Active = false;
                    gsap.set(".section2", { yPercent: -100 });
                    animating = true;
                    gsap.to(".normal-content", {
                        yPercent: -100, duration: 0.5, onComplete: () => {
                            animating = false;
                            normalContentActive = true;
                            observer.disable();
                            document.body.style.overflow = 'hidden';
                            if (callback) callback();
                        }
                    });
                } else {
                    if (callback) callback();
                }
            };

            showNormalContent(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const normalContentEl = document.querySelector('.normal-content');
                    const offset = targetElement.offsetTop;
                    normalContentEl.scrollTo({
                        top: offset - 50, // Navbar height offset
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
});

// Mobile menu toggle logic
const mobileMenu = document.getElementById('mobile-menu');
const navLinksList = document.querySelector('.nav-links');

if (mobileMenu && navLinksList) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-active');
        navLinksList.classList.toggle('mobile-active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('is-active');
            navLinksList.classList.remove('mobile-active');
        });
    });
}
