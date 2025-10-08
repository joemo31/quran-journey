document.addEventListener('DOMContentLoaded', function() {
    // Initialize Slick Carousel
    $('.testimonials-slider').slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: false
                }
            }
        ]
    });

    // Add animation classes when slides are shown
    $('.testimonials-slider').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        $('.slick-active').removeClass('animate__animated animate__fadeInUp');
    });

    $('.testimonials-slider').on('afterChange', function(event, slick, currentSlide) {
        $('.slick-active').addClass('animate__animated animate__fadeInUp');
    });

    // Initialize first slide
    $('.slick-active').addClass('animate__animated animate__fadeInUp');
});
