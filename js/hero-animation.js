// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    
    // Function to check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    };

    // Function to handle scroll event
    const handleScroll = () => {
        if (isInViewport(hero)) {
            hero.classList.add('animate');
            // Remove the event listener after animation is triggered
            window.removeEventListener('scroll', handleScroll);
        }
    };

    // Initial check in case hero is already in view
    if (isInViewport(hero)) {
        hero.classList.add('animate');
    } else {
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        // Also check on load in case user starts scrolled down
        window.addEventListener('load', handleScroll);
    }
});
