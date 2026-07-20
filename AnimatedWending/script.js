document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // ELEMENTS
    // -------------------------------------------------------------
    const waxSealBtn = document.getElementById("wax-seal-btn");
    const envelope = document.getElementById("wedding-envelope");
    const envelopeScreen = document.getElementById("envelope-screen");
    const mainContent = document.getElementById("main-content");
    const musicToggle = document.getElementById("music-toggle");
    const bgMusic = document.getElementById("bg-music");
    const musicIcon = document.getElementById("music-icon");

    // -------------------------------------------------------------
    // INITIAL SETUP
    // -------------------------------------------------------------
    // Prevent scrolling while envelope is closed
    document.body.style.overflow = "hidden";

    // Set lower initial volume for background music
    bgMusic.volume = 0.4;

    // -------------------------------------------------------------
    // ENVELOPE OPENING ANIMATION SEQUENCE
    // -------------------------------------------------------------
    waxSealBtn.addEventListener("click", () => {
        // 1. Play background music (interaction allows autoplay)
        playMusic();

        // 2. Immediate Zoom Out (moves backward)
        envelope.classList.add("zoom-out");

        // 3. Open top flap (after zoom out starts, e.g., 600ms)
        setTimeout(() => {
            envelope.classList.add("flap-open");
        }, 600);

        // 4. Slide card up (after flap is open, e.g., 1400ms)
        setTimeout(() => {
            envelope.classList.add("card-slid");
        }, 1400);

        // 5. Fade out intro screen and reveal details (e.g., 3200ms)
        setTimeout(() => {
            envelopeScreen.classList.add("fade-out");
            mainContent.classList.add("visible");
            document.body.style.overflow = "auto";
        }, 3200);
    });

    // -------------------------------------------------------------
    // BACKGROUND MUSIC CONTROLS
    // -------------------------------------------------------------
    function playMusic() {
        bgMusic.play()
            .then(() => {
                musicToggle.classList.add("playing");
                musicIcon.className = "fas fa-music";
            })
            .catch(error => {
                console.log("Müzik çalınamadı (Etkileşim gerekiyor):", error);
            });
    }

    function pauseMusic() {
        bgMusic.pause();
        musicToggle.classList.remove("playing");
        musicIcon.className = "fas fa-volume-mute";
    }

    musicToggle.addEventListener("click", () => {
        if (bgMusic.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    });

    // -------------------------------------------------------------
    // COUNTDOWN TIMER LOGIC
    // -------------------------------------------------------------
    // Wedding Date: Configured in future for visual testing.
    // Replace with actual wedding date (e.g., new Date("July 4, 2026 19:00:00"))
    const targetDate = new Date("September 19, 2026 19:00:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const daysVal = document.getElementById("days");
        const hoursVal = document.getElementById("hours");
        const minutesVal = document.getElementById("minutes");
        const secondsVal = document.getElementById("seconds");

        if (difference < 0) {
            daysVal.innerText = "00";
            hoursVal.innerText = "00";
            minutesVal.innerText = "00";
            secondsVal.innerText = "00";
            return;
        }

        // Time calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format numbers to always show two digits
        daysVal.innerText = days < 10 ? "0" + days : days;
        hoursVal.innerText = hours < 10 ? "0" + hours : hours;
        minutesVal.innerText = minutes < 10 ? "0" + minutes : minutes;
        secondsVal.innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    // Run countdown update once immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // -------------------------------------------------------------
    // SCROLL REVEAL (INTERSECTION OBSERVER)
    // -------------------------------------------------------------
    const revealElements = document.querySelectorAll(".scroll-reveal");

    const observerOptions = {
        root: null, // Viewport
        rootMargin: "0px",
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
                // Stop observing after revealing once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // -------------------------------------------------------------
    // DYNAMIC FULL SCREEN ENVELOPE RESIZING
    // -------------------------------------------------------------
    function resizeEnvelope() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Make the fold height a bit higher than center (around 46% of screen height)
        const fh = h * 0.46; 
        
        const cx = w / 2; // Center X
        
        // Define a responsive but bounded scoop width in the center
        // (at most 55% of viewport width, capped at 380px on desktop)
        const scoopWidth = Math.min(w * 0.55, 380);
        const lx = cx - scoopWidth / 2; // Left fold point
        const rx = cx + scoopWidth / 2; // Right fold point
        
        // Deep curve dip (responsive, e.g. 25% of screen height or max 170px)
        const cy = fh + Math.min(h * 0.25, 170);

        // 1. Top Flap Background & Border
        // A wide parabolic-like cubic bezier curve that scoops deep in the center.
        // Control points at 35% scoopWidth create a smooth circular bottom sweep.
        const topBgD = `M 0,0 
                        L ${w},0 
                        L ${w},${fh} 
                        L ${rx},${fh} 
                        C ${rx - scoopWidth * 0.35},${cy} ${lx + scoopWidth * 0.35},${cy} ${lx},${fh} 
                        L 0,${fh} 
                        Z`;

        const topBorderD = `M 0,${fh} 
                            L ${lx},${fh} 
                            C ${lx + scoopWidth * 0.35},${cy} ${rx - scoopWidth * 0.35},${cy} ${rx},${fh} 
                            L ${w},${fh}`;

        const topFlapBg = document.getElementById("top-flap-bg");
        const topFlapBorder = document.getElementById("top-flap-border");
        
        if (topFlapBg) topFlapBg.setAttribute("d", topBgD);
        if (topFlapBorder) topFlapBorder.setAttribute("d", topBorderD);

        // 2. Front Flaps (Left, Right, Bottom)
        // Left flap starts at (0, 0), goes to center pocket bottom (cx, fh + 45), goes to bottom left (0, h)
        const leftD = `M 0,0 L ${cx},${fh + 45} L 0,${h} Z`;
        // Right flap starts at (w, 0), goes to center pocket bottom (cx, fh + 45), goes to bottom right (w, h)
        const rightD = `M ${w},0 L ${cx},${fh + 45} L ${w},${h} Z`;
        // Bottom flap starts at (0, h), goes to center pocket top (cx, fh + 40), goes to bottom right (w, h)
        const bottomD = `M 0,${h} L ${cx},${fh + 40} L ${w},${h} Z`;
        
        // Bottom flap decorative gold lines going diagonally to corners, exactly like the original
        const goldLeftD = `M ${lx},${fh} L 0,${h * 0.8}`;
        const goldRightD = `M ${rx},${fh} L ${w},${h * 0.8}`;

        const leftFlap = document.getElementById("left-flap");
        const rightFlap = document.getElementById("right-flap");
        const bottomFlap = document.getElementById("bottom-flap");
        const bottomGoldLeft = document.getElementById("bottom-gold-left");
        const bottomGoldRight = document.getElementById("bottom-gold-right");

        if (leftFlap) leftFlap.setAttribute("d", leftD);
        if (rightFlap) rightFlap.setAttribute("d", rightD);
        if (bottomFlap) bottomFlap.setAttribute("d", bottomD);
        if (bottomGoldLeft) bottomGoldLeft.setAttribute("d", goldLeftD);
        if (bottomGoldRight) bottomGoldRight.setAttribute("d", goldRightD);

        // 3. Backplate
        const backplateRect = document.getElementById("backplate-rect");
        if (backplateRect) {
            backplateRect.setAttribute("width", w);
            backplateRect.setAttribute("height", h);
        }

        // 4. Wax Seal Button Positioning
        // Nest the seal perfectly at the bottom of the top flap curve responsive to scale
        const waxSeal = document.getElementById("wax-seal-btn");
        if (waxSeal) {
            const scoopDepth = Math.min(h * 0.25, 170);
            const sealRadius = w < 600 ? 50 : 62.5;
            const sealTop = fh + (scoopDepth * 0.75) - sealRadius + 12;
            
            waxSeal.style.top = `${sealTop}px`;
            waxSeal.style.left = `${cx}px`;
        }
    }

    // Initialize and bind events
    resizeEnvelope();
    window.addEventListener("resize", resizeEnvelope);
});
