document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    // The distance from the top of the page (in pixels) to scroll before the navbar changes.
    // You can adjust this value to your liking.
    const scrollThreshold = 50;

    if (navbar) {
        const handleNavbarScroll = () => {
            if (window.scrollY > scrollThreshold) {
                // Add the 'navbar-scrolled' class if scrolled past the threshold
                navbar.classList.add('navbar-scrolled');
            } else {
                // Remove the class if back at the top
                navbar.classList.remove('navbar-scrolled');
            }
        };

        // Add a scroll event listener to the window
        window.addEventListener('scroll', handleNavbarScroll);
    }
});