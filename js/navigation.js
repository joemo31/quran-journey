/**
 * Navigation and Mobile Menu Functionality
 * Handles mobile menu toggle, smooth scrolling, and scroll-based effects
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let isScrolling = false;
    
    // Initialize menu state
    if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

    // Toggle mobile menu with animation
    const toggleMenu = () => {
        if (!menuToggle || !navLinks) return;
        
        const isMenuOpen = menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Toggle between menu and close icon with animation
        menuToggle.innerHTML = isMenuOpen 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars">';
            
        // Toggle body scroll
        body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Add/remove event listeners based on menu state
        if (isMenuOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.addEventListener('click', handleOutsideClick);
            document.addEventListener('touchmove', preventScroll, { passive: false });
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('touchmove', preventScroll);
        }
    };

    // Close menu when clicking outside
    const handleOutsideClick = (e) => {
        if (navLinks && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMenu();
        }
    };

    const closeMenu = () => {
        if (!menuToggle || !navLinks) return;
        
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
        menuToggle.innerHTML = '<i class="fas fa-bars">';
        body.style.overflow = '';
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('touchmove', preventScroll);
    };
    
    // Close menu when clicking on nav links
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) { // Only for mobile
                closeMenu();
            }
        });
    });

    // Handle escape key press
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    };

    // Prevent scroll when menu is open on mobile
    const preventScroll = (e) => {
        if (navLinks.classList.contains('active')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    // Smooth scroll to section
    const smoothScroll = (e) => {
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close menu if open on mobile
                if (window.innerWidth <= 992) {
                    closeMenu();
                }
                
                // Calculate the target position with offset for fixed header
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Smooth scroll to target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Handle scroll events with throttling
    const handleScroll = () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
                
                // Add/remove scrolled class based on scroll position
                navbar.classList.toggle('scrolled', currentScroll > 50);
                
                // Hide/show navbar on scroll
                if (currentScroll <= 0) {
                    navbar.style.top = '0';
                } else if (currentScroll > lastScroll && currentScroll > 100) {
                    navbar.style.top = '-80px';
                } else {
                    navbar.style.top = '0';
                }
                
                lastScroll = currentScroll;
                isScrolling = false;
            });
            
            isScrolling = true;
        }
    };

    // Handle window resize
    const handleResize = () => {
        if (window.innerWidth > 992) {
            closeMenu();
        }
    };

    // Initialize event listeners
    const init = () => {
        // Menu toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks && navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
    };
    
    // Initialize the navigation
    init();
    
    // Close menu when clicking on nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', smoothScroll);
        
        // Add active class to current section in viewport
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                closeMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && !e.target.classList.contains('menu-toggle')) {
            closeMenu();
        }
    });

    // Handle scroll events with throttling
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Set initial scroll position
    handleScroll();
});
