// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const backToTopBtn = document.querySelector('.back-to-top');
const form = document.getElementById('contactForm');

// Sample data for courses (replace with your actual data)
const courses = [
    {
        id: 1,
        title: 'Quran Memorization',
        description: 'Learn to memorize the Holy Quran with proper Tajweed rules from certified instructors.',
        image: 'images/courses/quran-memorization.jpg',
        duration: '6 Months',
        level: 'All Levels',
        price: '$49/month'
    },
    {
        id: 2,
        title: 'Tajweed Course',
        description: 'Master the rules of Tajweed to recite the Quran correctly with proper pronunciation.',
        image: 'images/courses/tajweed.jpg',
        duration: '3 Months',
        level: 'Beginner',
        price: '$39/month'
    },
    {
        id: 3,
        title: 'Arabic Language',
        description: 'Learn Modern Standard Arabic to understand the Quran and communicate effectively.',
        image: 'images/courses/arabic.jpg',
        duration: '6 Months',
        level: 'Beginner',
        price: '$44/month'
    },
    {
        id: 4,
        title: 'Islamic Studies',
        description: 'Comprehensive Islamic education covering Aqeedah, Fiqh, Seerah, and more.',
        image: 'images/courses/islamic-studies.jpg',
        duration: '12 Months',
        level: 'All Levels',
        price: '$34/month'
    }
];

// Sample data for teachers (replace with your actual data)
const teachers = [
    {
        id: 1,
        name: 'Sheikh Ahmed Ali',
        specialization: 'Quran & Tajweed Expert',
        image: 'images/teachers/teacher-1.jpg',
        bio: 'Over 15 years of experience in teaching Quran and Tajweed to students worldwide.'
    },
    {
        id: 2,
        name: 'Ustadha Fatima Khan',
        specialization: 'Arabic Language',
        image: 'images/teachers/teacher-2.jpg',
        bio: 'Specialized in teaching Arabic as a second language with a focus on Quranic Arabic.'
    },
    {
        id: 3,
        name: 'Dr. Yusuf Abdullah',
        specialization: 'Islamic Studies',
        image: 'images/teachers/teacher-3.jpg',
        bio: 'PhD in Islamic Studies with extensive knowledge in Fiqh and Islamic History.'
    },
];

// Sample testimonials (replace with your actual testimonials)
const testimonials = [
    {
        id: 1,
        content: 'The teachers at Quran Journey are exceptional. My children have improved their recitation significantly in just a few months.',
        author: 'Amina Khan',
        role: 'Parent',
        image: 'images/testimonials/testimonial1.jpg'
    },
    {
        id: 2,
        content: 'I\'ve tried many online platforms, but Quran Journey stands out with their qualified teachers and well-structured curriculum.',
        author: 'Omar Farooq',
        role: 'Student',
        image: 'images/testimonials/testimonial2.jpg'
    },
    {
        id: 3,
        content: 'The flexibility of the schedule allowed me to learn at my own pace. Highly recommended for anyone serious about learning the Quran.',
        author: 'Sarah Ahmed',
        role: 'Student',
        image: 'images/testimonials/testimonial3.jpg'
    }
];

// Toggle mobile menu (handled in js/navigation.js) - disable duplicate listener here
// menuToggle.addEventListener('click', () => {
//     navLinks.classList.toggle('active');
//     menuToggle.classList.toggle('active');
// });

// Close mobile menu when clicking on a nav link is handled in js/navigation.js
// document.querySelectorAll('.nav-links a').forEach(link => {
//     link.addEventListener('click', () => {
//         navLinks.classList.remove('active');
//         menuToggle.classList.remove('active');
//     });
// });

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('active');
    } else {
        backToTopBtn.classList.remove('active');
    }
});

// Back to top button
backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Render courses
function renderCourses() {
    const coursesGrid = document.querySelector('.courses-grid');
    if (!coursesGrid) return;

    const coursesHTML = courses.map(course => `
        <div class="course-card fadeInUp">
            <div class="course-img">
                <img src="${course.image}" alt="${course.title}">
            </div>
            <div class="course-content">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span><i class="far fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-signal"></i> ${course.level}</span>
                </div>
                <div class="course-price">${course.price}</div>
                <a href="#contact" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Enroll Now</a>
            </div>
        </div>
    `).join('');

    coursesGrid.innerHTML = coursesHTML;
}

// Render teachers
function renderTeachers() {
    const teachersGrid = document.querySelector('.teachers-grid');
    if (!teachersGrid) return;

    const teachersHTML = teachers.map(teacher => `
        <div class="teacher-card fadeInUp">
            <div class="teacher-img">
                <img src="${teacher.image}" alt="${teacher.name}">
            </div>
            <div class="teacher-info">
                <h3>${teacher.name}</h3>
                <p>${teacher.specialization}</p>
                <p class="teacher-bio">${teacher.bio}</p>
                <div class="teacher-social">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
    `).join('');

    teachersGrid.innerHTML = teachersHTML;
}

// Render testimonials
function renderTestimonials() {
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (!testimonialsSlider) return;

    const testimonialsHTML = testimonials.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <p>"${testimonial.content}"</p>
            </div>
            <div class="testimonial-author">
                <img src="${testimonial.image}" alt="${testimonial.author}">
                <div class="author-info">
                    <h4>${testimonial.author}</h4>
                    <p>${testimonial.role}</p>
                </div>
            </div>
        </div>
    `).join('');

    testimonialsSlider.innerHTML = testimonialsHTML;
}

// Handle form submission
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        form.reset();
    });
}

// Initialize animations on scroll
function initAnimations() {
    const animateElements = document.querySelectorAll('.fadeInUp');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Initialize the page
function init() {
    // Rendering is handled statically in index.html; disable JS render to avoid duplication/overwrites
    // renderCourses();
    // renderTeachers();
    // renderTestimonials();
    initAnimations();
    
    // Add scrolled class to navbar on page load if scrolled
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
}

// Run when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
