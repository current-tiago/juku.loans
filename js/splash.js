// Splash Screen Controller
class SplashScreen {
    constructor() {
        this.splashScreen = document.getElementById('splashScreen');
        this.mainContent = document.getElementById('mainContent');
        this.duration = 3000; // 3 seconds like Twitter
        this.isTransitioning = false;
        this.hasVisitedBefore = this.checkIfVisitedBefore();
        
        this.init();
    }
    
    init() {
        // Hide main content initially
        this.mainContent.style.display = 'none';
        
        // Start the splash sequence
        this.startSplash();
    }
    
    checkIfVisitedBefore() {
        return localStorage.getItem('juku_visited') === 'true';
    }
    
    markAsVisited() {
        localStorage.setItem('juku_visited', 'true');
    }
    
    startSplash() {
        // If returning visitor, show splash for shorter time
        const splashDuration = this.hasVisitedBefore ? 1500 : this.duration;
        
        // Simulate loading time
        setTimeout(() => {
            this.transitionToMain();
        }, splashDuration);
        
        // Add some loading simulation
        this.simulateLoading();
    }
    
    simulateLoading() {
        // Add a subtle loading effect to the orange circle
        const orangeCircle = document.querySelector('.orange-circle');
        
        // Create a loading ring effect
        const loadingRing = document.createElement('div');
        loadingRing.className = 'loading-ring';
        loadingRing.style.cssText = `
            position: absolute;
            width: 140px;
            height: 140px;
            border: 3px solid rgba(255, 140, 0, 0.2);
            border-top: 3px solid #FF8C00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            z-index: -1;
        `;
        
        orangeCircle.appendChild(loadingRing);
        
        // Add spin animation
        const spinStyle = document.createElement('style');
        spinStyle.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinStyle);
    }
    
    transitionToMain() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Mark as visited
        this.markAsVisited();
        
        // Animate splash screen out
        this.splashScreen.style.animation = 'slideOut 0.8s ease-in-out forwards';
        
        // Show main content after splash animation
        setTimeout(() => {
            this.splashScreen.style.display = 'none';
            this.loadMainWebsite();
        }, 800);
    }
    
    loadMainWebsite() {
        // Determine which page to load based on visitor status
        const targetPage = this.hasVisitedBefore ? 'index.html' : 'landing.html';
        
        // Smooth transition to the appropriate page
        window.location.href = targetPage;
    }
    
    showSplash() {
        // Reset states
        this.isTransitioning = false;
        this.splashScreen.style.animation = '';
        this.splashScreen.style.display = 'flex';
        this.mainContent.style.display = 'none';
        
        // Restart splash
        this.startSplash();
    }
}

// Initialize splash screen when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const splash = new SplashScreen();
    
    // Make showSplash function globally available
    window.showSplash = function() {
        splash.showSplash();
    };
    
    // Add some interactive elements
    const orangeCircle = document.querySelector('.orange-circle');
    
    // Add click effect to the logo
    orangeCircle.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Add hover effect
    orangeCircle.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 12px 40px rgba(255, 140, 0, 0.5)';
    });
    
    orangeCircle.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 8px 32px rgba(255, 140, 0, 0.3)';
    });
    
    // Add keyboard shortcut to show splash again (for testing)
    document.addEventListener('keydown', function(e) {
        if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            splash.showSplash();
        }
    });
    
    // Console messages
    console.log('🌟 Juku Splash Screen loaded!');
    console.log('💡 Press Ctrl+S to show splash again');
    console.log('⏱️ Splash duration: ' + (splash.hasVisitedBefore ? '1.5 seconds' : '3 seconds'));
    console.log('🔄 Redirecting to: ' + (splash.hasVisitedBefore ? 'index.html' : 'landing.html'));
});

// Add some additional visual effects
window.addEventListener('load', function() {
    // Add a subtle background animation
    const body = document.body;
    body.style.background = 'linear-gradient(45deg, #000000, #1a1a1a)';
    body.style.backgroundSize = '400% 400%';
    body.style.animation = 'gradientShift 8s ease infinite';
    
    // Add gradient animation
    const gradientStyle = document.createElement('style');
    gradientStyle.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
    document.head.appendChild(gradientStyle);
    
    // Add some particle effects around the logo
    const logoContainer = document.querySelector('.logo-container');
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background-color: rgba(255, 140, 0, 0.6);
            border-radius: 50%;
            animation: float ${2 + i * 0.5}s ease-in-out infinite;
            animation-delay: ${i * 0.3}s;
        `;
        
        // Position particles around the logo
        const angle = (i * 60) * (Math.PI / 180);
        const radius = 80;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;
        
        logoContainer.appendChild(particle);
    }
    
    // Add float animation for particles
    const floatStyle = document.createElement('style');
    floatStyle.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0px) scale(1);
                opacity: 0.6;
            }
            50% {
                transform: translateY(-20px) scale(1.2);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(floatStyle);
}); 