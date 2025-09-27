document.addEventListener("DOMContentLoaded", function () {
    const sectionContainer = document.getElementById("sectionContainer");
    const character = document.getElementById("character");
    const progressFill = document.getElementById("progressFill");
  
    let currentOffset = 0;
    let isScrolling = false;
    let scrollDirection = "none";
    let walkAnimationInterval = null;
    let idleTimeout = null;
    let isIdle = false;
    let isKeyScrolling = false;
  
    const characterStates = {
      standRight: "/img/stand.png",
      walkRight1: "/img/walk1.png",
      walkRight2: "/img/walk2.png",
      standLeft: "/img/stand2.png",
      walkLeft1: "/img/walk3.png",
      walkLeft2: "/img/walk4.png",
      idle: "/img/break.png",
      jump: "/img/jump.png",
    };
  
    character.src = characterStates.standRight;
  
    const totalWidth = sectionContainer.scrollWidth;
    document.body.style.height = `${totalWidth}px`;
  
    function updateUI() {
      sectionContainer.style.transform = `translateX(-${currentOffset}px)`;
      const maxOffset = totalWidth - window.innerWidth;
      const progressPercentage = (currentOffset / maxOffset) * 100;
      progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    }
  
    function startWalkingAnimation(direction) {
      clearInterval(walkAnimationInterval);
      clearTimeout(idleTimeout);
      isIdle = false;
  
      if (direction === "right") {
        character.src = characterStates.walkRight1;
      } else if (direction === "left") {
        character.src = characterStates.walkLeft1;
      }
  
      let isFirstFrame = true;
      walkAnimationInterval = setInterval(() => {
        if (direction === "right") {
          character.src = isFirstFrame ? characterStates.walkRight1 : characterStates.walkRight2;
        } else if (direction === "left") {
          character.src = isFirstFrame ? characterStates.walkLeft1 : characterStates.walkLeft2;
        }
        isFirstFrame = !isFirstFrame;
      }, 150);
    }
  
    function stopWalkingAnimation() {
      clearInterval(walkAnimationInterval);
      walkAnimationInterval = null;
      if (!isIdle) {
        character.src = characterStates.standRight;
      }
      startIdleTimer();
    }
  
    function triggerJump() {
        if (character.classList.contains("jumping")) return;
      
        clearTimeout(idleTimeout);
        isIdle = false;
        character.src = characterStates.jump;
      
        character.classList.add("jumping");
      
        setTimeout(() => {
          character.classList.remove("jumping");
          if (!walkAnimationInterval) {
            character.src = characterStates.standRight; // Always return to standRight after jump
            startIdleTimer();
          }
        }, 500);
    }
      
    function startIdleTimer() {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          if (!walkAnimationInterval && !character.classList.contains("jumping")) {
            isIdle = true;
            character.src = characterStates.idle;
          }
        }, 5000);
    }
  
    document.addEventListener("mousemove", function () {
      clearTimeout(idleTimeout);
      if (isIdle && !walkAnimationInterval && !character.classList.contains("jumping")) {
        isIdle = false;
        character.src = characterStates.standRight;
      }
      startIdleTimer();
    });
  
    window.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
  
        clearTimeout(idleTimeout);
        isIdle = false;
        if (!walkAnimationInterval) {
          character.src = characterStates.standRight;
        }
  
        if (e.deltaY > 0) {
          currentOffset += 50;
          if (scrollDirection !== "right") {
            scrollDirection = "right";
            startWalkingAnimation("right");
          }
        } else if (e.deltaY < 0) {
          currentOffset -= 50;
          if (scrollDirection !== "left") {
            scrollDirection = "left";
            startWalkingAnimation("left");
          }
        }
  
        const maxOffset = totalWidth - window.innerWidth;
        currentOffset = Math.max(0, Math.min(currentOffset, maxOffset));
  
        window.scrollTo(0, 0);
  
        updateUI();
  
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
          scrollDirection = "none";
          stopWalkingAnimation();
        }, 300);
      },
      { passive: false }
    );
  
    window.addEventListener(
      "scroll",
      function () {
        window.scrollTo(0, 0);
      },
      { passive: false }
    );
  
    document.addEventListener("keydown", function (e) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
      }
  
      if (e.key === "ArrowLeft") {
        if (scrollDirection !== "left") {
          scrollDirection = "left";
          startWalkingAnimation("left");
        }
        currentOffset -= 20;
        isKeyScrolling = true;
      }
  
      if (e.key === "ArrowRight") {
        if (scrollDirection !== "right") {
          scrollDirection = "right";
          startWalkingAnimation("right");
        }
        currentOffset += 20;
        isKeyScrolling = true;
      }
  
      if (e.key === "ArrowUp") {
        triggerJump();
      }
  
      const maxOffset = totalWidth - window.innerWidth;
      currentOffset = Math.max(0, Math.min(currentOffset, maxOffset));
  
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        updateUI();
      }
    });
  
    document.addEventListener("keyup", function (e) {
      if (["ArrowLeft", "ArrowRight"].includes(e.key) && isKeyScrolling) {
        scrollDirection = "none";
        stopWalkingAnimation();
        isKeyScrolling = false;
      }
    });
  
    document.querySelectorAll('a[data-type="walk"]').forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
  
        clearTimeout(idleTimeout);
        isIdle = false;
  
        const targetId = this.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;
  
        const targetOffset = targetSection.offsetLeft;
        const direction = targetOffset > currentOffset ? "right" : "left";
  
        startWalkingAnimation(direction);
  
        const duration = 2000;
        const startOffset = currentOffset;
        const distance = targetOffset - startOffset;
        const startTime = performance.now();
  
        function animate(time) {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easing = 1 - Math.pow(1 - progress, 3);
  
          currentOffset = startOffset + distance * easing;
          updateUI();
  
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            stopWalkingAnimation();
            scrollDirection = "none";
          }
        }
  
        requestAnimationFrame(animate);
      });
    });
  
    document.addEventListener("click", function (e) {
      const isWalkLink = e.target.closest('a[data-type="walk"]');
      const isButton = e.target.closest("button") || e.target.closest('input[type="submit"]');
  
      if (!isWalkLink && !isButton) {
        triggerJump();
      }
    });
  
    window.scrollTo(0, 0);
    updateUI();
    startIdleTimer();
  });