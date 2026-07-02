console.clear();

const sections = gsap.utils.toArray(".slide");
const images = gsap.utils.toArray(".image");
const slideImages = gsap.utils.toArray(".slide__img");
const outerWrappers = gsap.utils.toArray(".slide__outer");
const innerWrappers = gsap.utils.toArray(".slide__inner");
// const count = document.querySelector(".count");
const wrap = gsap.utils.wrap(0, sections.length);
let animating;
let currentIndex = 0;
let section2Active = true;
let normalContentActive = false;
let section2Step = 0;

function updateSection2Popups() {
    const popups = document.querySelectorAll('.bowl-popup');
    if(popups.length < 5) return;
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
        // .set(count, { text: index + 1 }, 0.32)
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
            gsap.to(".normal-content", { yPercent: -100, duration: 0.5, ease: "expo.inOut", onComplete: () => { 
                animating = false; 
                normalContentActive = true; 
                observer.disable(); // Allow native scroll
            } });
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
            }
            return;
        }
        gotoSection(currentIndex - 1, -1);
    },
    tolerance: 0
});

document.addEventListener("keydown", logKey);

function logKey(e) {
    console.log(e.code);
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
            gsap.to(".normal-content", { yPercent: -100, duration: 0.5, ease: "expo.inOut", onComplete: () => { 
                animating = false; 
                normalContentActive = true; 
                observer.disable();
            } });
            return;
        }
        if (normalContentActive) return;
        gotoSection(currentIndex + 1, 1);
    }
}

// Re-enable observer when scrolling back up to the top of normal-content
const normalContentEl = document.querySelector(".normal-content");
normalContentEl.addEventListener("wheel", (e) => {
    if (normalContentEl.scrollTop <= 0 && e.deltaY < 0 && !animating) {
        // user scrolled up at the very top of normal content
        e.preventDefault();
        animating = true;
        gsap.to(".normal-content", { yPercent: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => { 
            animating = false; 
            normalContentActive = false; 
            observer.enable();
        }});
    }
});

// Section 4 Card Selection Logic
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove active class from all cards
        productCards.forEach(c => c.classList.remove('active-card'));
        // Add active class to the clicked card
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
    // Filter cards
    filteredCards = Array.from(productCardsItems).filter(card => {
        return currentFilter === 'all' || card.getAttribute('data-category') === currentFilter;
    });

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    
    // Ensure currentPage is valid
    if (currentPage >= totalPages && totalPages > 0) {
        currentPage = totalPages - 1;
    }

    // Hide all cards first
    productCardsItems.forEach(card => card.style.display = 'none');

    // Show cards for current page
    const startIdx = currentPage * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    for (let i = startIdx; i < Math.min(endIdx, filteredCards.length); i++) {
        filteredCards[i].style.display = 'block';
    }

    // Update buttons state
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1 || totalPages === 0;

    // Render dots
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

// Initial render
renderProducts();

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        currentFilter = tab.getAttribute('data-filter');
        currentPage = 0;
        renderProducts();
    });
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderProducts();
    }
});

nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderProducts();
    }
});

// Section 5 List Item Animation
gsap.from(".choose-item", {
    scrollTrigger: {
        trigger: ".section5",
        scroller: ".normal-content",
        start: "top 75%", // Trigger when section 5 is 75% down the viewport
        toggleActions: "play none none reverse" // Play on scroll down, reverse on scroll up
    },
    x: -100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2, // Slide them in one by one
    ease: "power2.out"
});