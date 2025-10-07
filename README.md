# Quran Journey - Online Islamic Learning Platform

A modern, responsive website for an online Quran and Islamic studies learning platform. This project is designed to be a complete frontend solution for an online Islamic education service, featuring course listings, teacher profiles, testimonials, and a contact form.

## Features

- **Responsive Design**: Works on all devices from mobile phones to desktops
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Interactive Elements**: Dynamic course cards, teacher profiles, and testimonials
- **Contact Form**: Easy way for potential students to get in touch
- **Performance Optimized**: Fast loading times and smooth scrolling

## Technologies Used

- HTML5
- CSS3 (with CSS Variables and Flexbox/Grid)
- JavaScript (Vanilla JS)
- Font Awesome Icons
- Google Fonts

## Project Structure

```
quran-journey/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # JavaScript functionality
└── images/             # Directory for all images (create this directory)
    ├── courses/        # Course-related images
    ├── teachers/       # Teacher profile images
    ├── testimonials/   # Testimonial author images
    ├── hero-bg.jpg     # Hero section background
    └── logo.png        # Website logo
```

## Setup Instructions

1. **Clone the repository** or download the source code
   ```bash
   git clone [your-repository-url].git
   cd quran-journey
   ```

2. **Add your images**
   - Create the following directories in the `images` folder:
     - `courses/`
     - `teachers/`
     - `testimonials/`
   - Add your images to these directories
   - Update the image paths in `index.html` and `main.js` to match your image filenames

3. **Customize the content**
   - Update the course details in the `courses` array in `main.js`
   - Add your teachers' information to the `teachers` array
   - Update testimonials in the `testimonials` array
   - Modify the contact form fields in `index.html` as needed

4. **Test locally**
   - Open `index.html` in a web browser to test the website
   - Test all interactive elements (navigation, forms, etc.)

## Customization

### Colors
You can easily change the color scheme by updating the CSS variables in the `:root` selector in `style.css`:

```css
:root {
    --primary-color: #1e88e5;
    --primary-dark: #1565c0;
    --secondary-color: #ff9800;
    --dark-color: #1a237e;
    --light-color: #f5f5f5;
    --text-color: #333;
    --text-light: #666;
    --white: #ffffff;
    --black: #000000;
    --box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
}
```

### Fonts
To change the fonts, update the Google Fonts import in `index.html` and the corresponding font-family properties in `style.css`.

## Browser Support

The website is compatible with all modern browsers including:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Safari (latest)
- Microsoft Edge (latest)
- Mobile browsers (Chrome for Android, Safari for iOS)

## Deployment

To deploy this website, you can use any static website hosting service such as:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

Simply upload all the files to your hosting provider's server or connect your repository for continuous deployment.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For any questions or support, please contact [your-email@example.com](mailto:your-email@example.com).

---

*This project was created for educational purposes and can be customized for personal or commercial use.*
