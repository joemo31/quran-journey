// Animation Helper Function
function animateElements(elements, staggerDelay = 150) {
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        // Add animation class after a delay
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, staggerDelay * index);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Programs Section
    const programsSection = document.querySelector('.programs');
    const programCards = document.querySelectorAll('.program-card');
    
    // Why Choose Us Section
    const whyUsSection = document.querySelector('.why-us');
    const featureItems = document.querySelectorAll('.feature-item');
    
    // Testimonials Section
    const testimonialsSection = document.querySelector('.testimonials');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    // Set initial states
    programCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });
    
    featureItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
    });
    
    testimonialCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });

    // Create intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('programs')) {
                    animateElements(programCards);
                } else if (entry.target.classList.contains('why-us')) {
                    animateElements(featureItems, 100); // Slightly faster stagger for features
                } else if (entry.target.classList.contains('testimonials')) {
                    animateElements(testimonialCards, 150); // Staggered testimonials
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Start observing sections
    if (programsSection) observer.observe(programsSection);
    if (whyUsSection) observer.observe(whyUsSection);
    if (testimonialsSection) observer.observe(testimonialsSection);
});
