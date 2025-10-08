// Animation System
class ScrollAnimator {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        this.setupObserver();
        this.setupSections();
        this.animateOnLoad();
        this.setupResizeHandler();
    }

    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    setupSections() {
        // Add animation classes to sections
        document.querySelectorAll('section').forEach((section, index) => {
            // Add animate-section class to enable animations
            section.classList.add('animate-section');
            
            // Add fade-in by default, or specific animation if specified
            if (!section.classList.contains('slide-in-left') && 
                !section.classList.contains('slide-in-right') && 
                !section.classList.contains('zoom-in')) {
                section.classList.add('fade-in');
            }
            
            // Observe the section
            this.observer.observe(section);
            
            // Setup animations for section children
            this.setupSectionChildren(section);
        });
    }

    setupSectionChildren(section) {
        // Get all direct children that should be animated
        const children = section.querySelectorAll(':scope > .animate, :scope > * > .animate, :scope > * > * > .animate');
        
        children.forEach((child, index) => {
            // Add staggered delay
            child.style.transitionDelay = `${index * 0.15}s`;
            
            // Add animation class if not already specified
            if (!child.classList.contains('fade-in') && 
                !child.classList.contains('slide-in-left') && 
                !child.classList.contains('slide-in-right') &&
                !child.classList.contains('zoom-in')) {
                child.classList.add('fade-in');
            }
            
            // Observe the element
            this.observer.observe(child);
        });
    }

    animateOnLoad() {
        // Animate elements already in viewport on load
        document.querySelectorAll('.animate-section, .animate').forEach(el => {
            const rect = el.getBoundingClientRect();
            const isInView = (
                rect.top <= window.innerHeight * 0.9 &&
                rect.bottom >= 0
            );
            
            if (isInView) {
                el.classList.add('visible');
            }
        });
    }

    setupResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.animateOnLoad();
            }, 250);
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a class to the body when animations are ready
    document.body.classList.add('animations-ready');
    
    // Initialize the animation system
    new ScrollAnimator();
});
