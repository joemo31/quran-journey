document.addEventListener('DOMContentLoaded', function() {
    // Teacher hover effect
    const teacherCards = document.querySelectorAll('.teacher-card');
    
    teacherCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.1)';
            
            // Add pulse animation to social icons
            const socialIcons = this.querySelectorAll('.teacher-social a');
            socialIcons.forEach((icon, index) => {
                icon.style.animation = `pulse 0.5s ease ${index * 0.1}s forwards`;
            });
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
            
            // Reset animation
            const socialIcons = this.querySelectorAll('.teacher-social a');
            socialIcons.forEach(icon => {
                icon.style.animation = '';
            });
        });
    });

    // Add click handlers for teacher profile and video buttons
    document.querySelectorAll('.teacher-social a').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const teacherCard = this.closest('.teacher-card');
            const teacherName = teacherCard.querySelector('h3').textContent;
            
            if (this.querySelector('.fa-user')) {
                // View Profile button clicked
                console.log(`Viewing profile of ${teacherName}`);
                // Here you can add code to open a modal or navigate to the teacher's profile
            } else if (this.querySelector('.fa-play')) {
                // Watch Video button clicked
                console.log(`Playing introduction video for ${teacherName}`);
                // Here you can add code to open a video modal or play the video
            }
        });
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
