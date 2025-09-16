window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Add the 'hidden' class to trigger the fade-out animation
        preloader.classList.add('preloader-hidden');

        // After the animation finishes, set display to 'none' to remove it from the layout
        preloader.addEventListener('transitionend', function () {
            preloader.style.display = 'none';
        });
    }
});