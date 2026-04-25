-- Seed all site content blocks (safe to run multiple times)
INSERT INTO site_content (page, section, key, value, type, label) VALUES

-- ══ GLOBAL (affects ALL pages) ══
('global','nav','logo_url','','image','Logo Image URL'),
('global','nav','logo_text','Quran Journey','text','Logo Text'),
('global','nav','logo_subtitle','Academy','text','Logo Subtitle'),
('global','contact','whatsapp','+201508018609','text','WhatsApp Number (shown everywhere)'),
('global','contact','email','info@quranjourney.com','text','Email Address (shown everywhere)'),
('global','contact','whatsapp_link','https://wa.me/201508018609','text','WhatsApp Full Link'),
('global','footer','tagline','Excellence in Quranic Education','text','Footer Tagline'),
('global','footer','about_text','Learn Quran, Tajweed, Arabic, and Islamic Studies with native Arabic teachers from Al-Azhar University.','text','Footer About Text'),
('global','seo','site_name','Quran Journey Academy','text','Website Name'),

-- ══ HOME PAGE ══
('home','hero','title','Start Your Qur''an Journey Today 🌟','text','Hero Main Title'),
('home','hero','subtitle','Learn Qur''an, Tajweed, Arabic, and Islamic Studies with native Arabic teachers from Al-Azhar University.','text','Hero Subtitle Text'),
('home','hero','cta_primary','Book Your Free Trial Class','text','Primary Button Text'),
('home','hero','cta_secondary','Explore Courses','text','Secondary Button Text'),
('home','hero','bg_image','','image','Hero Background Image'),
('home','hero','badge_text','Al-Azhar Certified Teachers','text','Hero Badge Text'),
('home','stats','students','5,000+','text','Students Count'),
('home','stats','experience','15+','text','Years of Experience'),
('home','stats','certified','100%','text','Certified Teachers'),
('home','stats','availability','24/7','text','Availability Label'),
('home','why_us','title','Why Choose Us?','text','Why Us Section Title'),
('home','why_us','subtitle','We''re committed to providing the best Quranic education with a personal touch','text','Why Us Subtitle'),
('home','programs','title','Our Programs','text','Programs Section Title'),
('home','programs','subtitle','Choose the perfect course to begin your journey','text','Programs Subtitle'),
('home','testimonials','title','What Our Students Say','text','Testimonials Section Title'),
('home','testimonials','subtitle','Real feedback from our global community of learners','text','Testimonials Subtitle'),
('home','cta','title','Begin Your Journey with the Qur''an Today!','text','CTA Banner Title'),
('home','cta','subtitle','Take your first step towards a stronger connection with the Qur''an.','text','CTA Banner Subtitle'),
('home','cta','button_primary','Book Free Trial','text','CTA Primary Button'),
('home','cta','button_secondary','WhatsApp Us','text','CTA Secondary Button'),
('home','contact','title','Get In Touch','text','Contact Section Title'),
('home','contact','subtitle','Have questions? We''re here to help you start your Quran learning journey.','text','Contact Section Subtitle'),
('home','contact','form_title','Book Your Free Trial Class','text','Contact Form Title'),

-- ══ ABOUT PAGE ══
('about','hero','title','About Quran Journey Academy','text','About Page Hero Title'),
('about','hero','subtitle','Learn, Connect, and Grow with the Qur''an','text','About Page Hero Subtitle'),
('about','hero','bg_image','','image','About Hero Background Image'),
('about','mission','title','Our Mission','text','Mission Section Title'),
('about','mission','body','At Qur''an Journey Institute, we''re passionate about making Qur''anic education accessible, engaging, and transformative. With over 15 years of experience, our certified teachers guide students of all ages on their journey to connect with the Holy Qur''an.','html','Mission Body Text'),
('about','mission','body2','Our teachers are Al-Azhar certified scholars with verified Ijazah, ensuring authentic and traditional transmission of Quranic knowledge.','text','Mission Body Paragraph 2'),
('about','mission','image','','image','Mission Section Image'),
('about','stats','students','5,000+','text','Students Stat'),
('about','stats','experience','15+','text','Experience Stat'),
('about','stats','teachers','100%','text','Teachers Certified Stat'),
('about','stats','learning','24/7','text','Learning Availability Stat'),
('about','team','title','Meet Our Teachers','text','Team Section Title'),
('about','cta','title','Ready to Start Your Journey?','text','About CTA Title'),
('about','cta','subtitle','Join thousands of students learning the Quran online.','text','About CTA Subtitle'),

-- ══ COURSES PAGE ══
('courses','hero','title','Find the Perfect Course for You','text','Courses Page Title'),
('courses','hero','subtitle','Expert-led programs from absolute beginner to advanced scholar. Each course includes live 1-on-1 sessions with Al-Azhar certified teachers.','text','Courses Page Subtitle'),
('courses','hero','bg_image','','image','Courses Hero Image'),
('courses','features','badge1','Live 1-on-1 sessions','text','Feature Badge 1'),
('courses','features','badge2','Students in 60+ countries','text','Feature Badge 2'),
('courses','features','badge3','Flexible scheduling','text','Feature Badge 3'),
('courses','features','badge4','Free trial class','text','Feature Badge 4'),
('courses','features','badge5','Ijazah certification','text','Feature Badge 5'),
('courses','features','badge6','Arabic-speaking teachers','text','Feature Badge 6'),
('courses','cta','title','Ready to Start?','text','Courses CTA Title'),
('courses','cta','subtitle','Fill in your details and we''ll contact you within 24 hours.','text','Courses CTA Subtitle'),

-- ══ PRICING PAGE ══
('pricing','hero','title','Simple, Honest Pricing','text','Pricing Page Title'),
('pricing','hero','subtitle','All plans include live 1-on-1 sessions. Start with a free trial — no card required.','text','Pricing Page Subtitle'),
('pricing','hero','bg_image','','image','Pricing Hero Image'),
('pricing','offers','offer1','🎁 Early Bird: 10% off first 3 months','text','Special Offer 1'),
('pricing','offers','offer2','👨‍👩‍👧 Sibling Discount: 30% off additional children','text','Special Offer 2'),
('pricing','offers','offer3','👥 Referral: 3 friends = 1 month free','text','Special Offer 3'),
('pricing','included','title','Everything Included in Every Plan','text','Included Features Title'),
('pricing','faq','title','Frequently Asked Questions','text','FAQ Section Title'),
('pricing','cta','title','Start Your Journey Today','text','Pricing CTA Title'),
('pricing','cta','subtitle','Fill in your details and we''ll reach out within 24 hours.','text','Pricing CTA Subtitle'),

-- ══ BLOG PAGE ══
('blog','hero','title','Academy Blog','text','Blog Page Title'),
('blog','hero','subtitle','Insights, guidance, and knowledge from our scholars','text','Blog Page Subtitle'),
('blog','hero','bg_image','','image','Blog Hero Image'),
('blog','cta','title','Start Your Quran Journey','text','Blog CTA Title'),
('blog','cta','subtitle','Ready to begin? Book your free trial class today.','text','Blog CTA Subtitle'),

-- ══ CONTACT PAGE ══
('contact','hero','title','Contact Us','text','Contact Page Title'),
('contact','hero','subtitle','We''re here to help you start your journey','text','Contact Page Subtitle'),
('contact','hero','bg_image','','image','Contact Hero Image'),
('contact','info','title','Get In Touch','text','Contact Info Title'),
('contact','form','title','Send Us a Message','text','Contact Form Title'),
('contact','form','subtitle','Fill out the form and we''ll respond within 24 hours.','text','Contact Form Subtitle'),

-- ══ FEEDBACK PAGE ══
('feedback','hero','title','Student Feedback','text','Feedback Page Title'),
('feedback','hero','subtitle','Real stories from our global community of learners','text','Feedback Page Subtitle'),
('feedback','hero','bg_image','','image','Feedback Hero Image'),
('feedback','videos','title','Video Testimonials','text','Video Section Title'),
('feedback','videos','subtitle','Watch what our students have to say','text','Video Section Subtitle'),
('feedback','reviews','title','What Our Students Say','text','Reviews Section Title'),
('feedback','reviews','subtitle','Feedback from learners around the world','text','Reviews Section Subtitle'),
('feedback','cta','title','Join Our Growing Community','text','Feedback CTA Title'),
('feedback','cta','subtitle','Start your Quran journey today with a free trial class','text','Feedback CTA Subtitle'),
('feedback','form','title','Book Your Free Trial','text','Feedback Form Title'),
('feedback','form','subtitle','Join thousands of satisfied students.','text','Feedback Form Subtitle')
ON CONFLICT (page, section, key) DO UPDATE 
SET 
  value = EXCLUDED.value,
  type = EXCLUDED.type,
  label = EXCLUDED.label;

