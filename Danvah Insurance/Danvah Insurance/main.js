// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function () {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // On window load, not just DOM content
        window.addEventListener('load', function () {
            preloader.classList.add('preloader-hidden');
            preloader.addEventListener('transitionend', function () {
                preloader.style.display = 'none';
            });
        });
    }

    // --- Navbar Scroll Behavior ---
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 50;

    if (navbar) {
        const handleNavbarScroll = () => {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };
        window.addEventListener('scroll', handleNavbarScroll);
    }

    // --- Navbar Hide/Show on Scroll ---
    let lastScrollTop = 0;
    const delta = 5; // minimum scroll amount to detect
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    window.addEventListener("scroll", function () {
        if (!navbar) return;
        let st = window.pageYOffset || document.documentElement.scrollTop;

        if (Math.abs(st - lastScrollTop) <= delta) return;

        if (st > lastScrollTop && st > navbarHeight) {
            // Scrolling down and past navbar height: hide navbar
            navbar.style.top = `-${navbarHeight}px`;
        } else {
            // Scrolling up: show navbar
            navbar.style.top = "0";
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });

    // --- Dark/Light Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = themeToggleBtn.querySelector('.ri-sun-line');
    const moonIcon = themeToggleBtn.querySelector('.ri-moon-line');
    const body = document.body;

    const applyTheme = (theme) => {
        body.setAttribute('data-bs-theme', theme);
        if (theme === 'dark') {
            sunIcon.classList.remove('d-none');
            moonIcon.classList.add('d-none');
        } else {
            sunIcon.classList.add('d-none');
            moonIcon.classList.remove('d-none');
        }
        localStorage.setItem('theme', theme);
    };

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });


    // Initialize AOS (Animate on Scroll) library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            offset: 120, // offset (in px) from the original trigger point
            delay: 0, // values from 0 to 3000, with step 50ms
            duration: 900, // values from 0 to 3000, with step 50ms
            easing: 'ease', // default easing for AOS animations
            once: true, // animation happens only once
            mirror: false, // whether elements should animate out while scrolling past them
            anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger animation
        });
    }

    // --- News Feed Fetching ---
    // The API key is now hidden in a serverless function.
    const newsFeed = document.getElementById('news-feed');

    if (newsFeed) {
        // Call our own serverless function endpoint
        fetch('/.netlify/functions/get-news')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data);

                // Handle API errors returned in the JSON body
                if (data.status === 'error') {
                    throw new Error(data.message || 'The news service returned an error.');
                }

                if (!data.articles || data.articles.length === 0) {
                    newsFeed.innerHTML = '<p class="text-center col-12">No news articles available at the moment.</p>';
                    return;
                }

                // Display the first 3 articles
                data.articles.slice(0, 3).forEach(article => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 mb-4';

                    // Use fallbacks for potentially missing data
                    const title = article.title || 'No Title Available';
                    const description = article.description || 'No description available.';
                    const image = article.urlToImage || 'https://via.placeholder.com/400x250?text=News';
                    const url = article.url || '#';

                    col.innerHTML = `
                        <div class="blog-post image-zoom theme-shadow h-100">
                            <div class="image-zoom-wrapper">
                                <img src="${image}" alt="Image for news article: ${title}" class="img-fluid rounded" loading="lazy">
                            </div>
                            <div class="p-4 d-flex flex-column">
                                <h5 class="flex-grow-1">${title}</h5>
                                <p>${description}</p>
                                <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-brand mt-2 align-self-start">Read More</a>
                            </div>
                        </div>
                    `;

                    newsFeed.appendChild(col);
                });
            })
            .catch(err => {
                console.error('Fetch error:', err);
                newsFeed.innerHTML = `<p class="text-center text-danger col-12">Failed to load news. This feature may not work when running the file locally. Try using the Netlify dev server or check the deployed site.</p>`;
            });
    }


    // --- Formspree Contact Form Handling ---
    const contactForm = document.querySelector('form[action*="formspree.io"]');
    const formMessageDiv = document.getElementById('form-message');

    if (contactForm && formMessageDiv) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    formMessageDiv.innerHTML = '<p class="text-success">✅ Message sent successfully!</p>';
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        const errorMsg = data.errors ? data.errors.map(error => error.message).join(', ') : 'Something went wrong.';
                        formMessageDiv.innerHTML = `<p class="text-danger">❌ Error: ${errorMsg}</p>`;
                    });
                }
            }).catch(error => {
                console.error('Form submission error:', error);
                formMessageDiv.innerHTML = '<p class="text-danger">⚠️ Network error. Please check your connection and try again.</p>';
            });
        });
    }

    // --- Dynamic Copyright Year ---
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }
});

// --- Service Section Collapse Button Text Toggle ---
function setupCollapseButton(buttonId, targetId, showText, hideText) {
    const button = document.getElementById(buttonId);
    const target = document.getElementById(targetId);

    if (!button || !target) return;

    const updateButtonText = () => {
        if (target.classList.contains('show')) {
            button.textContent = hideText;
        } else {
            button.textContent = showText;
        }
    };

    target.addEventListener('shown.bs.collapse', updateButtonText);
    target.addEventListener('hidden.bs.collapse', updateButtonText);
}

setupCollapseButton('toggleMedical', 'medicalInsurance', 'Show Medical Insurance Packages', 'Close Medical Insurance Packages');
setupCollapseButton('toggleCar', 'carInsurance', 'Show Car Insurance Packages', 'Close Car Insurance Packages');
setupCollapseButton('toggleVessel', 'vesselInsurance', 'Show Vessel Insurance Packages', 'Close Vessel Insurance Packages');