AOS.init({
    offset: 120,        // offset (in px) from the original trigger point
    delay: 0,           // values from 0 to 3000, with step 50ms
    duration: 900,      // values from 0 to 3000, with step 50ms
    easing: 'ease',     // default easing for AOS animations
    once: false,        // whether animation should happen only once - while scrolling down
    mirror: false,      // whether elements should animate out while scrolling past them
    anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger animation
});




let lastScrollTop = 0;
const delta = 5; // minimum scroll amount to detect
const navbar = document.querySelector(".navbar");
const navbarHeight = navbar.offsetHeight;

window.addEventListener("scroll", function () {
    let st = window.pageYOffset || document.documentElement.scrollTop;

    // Only do anything if scrolled more than delta
    if (Math.abs(st - lastScrollTop) <= delta) {
        return;
    }

    if (st > lastScrollTop && st > navbarHeight) {
        // Scrolling down and past navbar height: hide navbar
        navbar.style.top = `-${navbarHeight}px`;
    } else if (st + window.innerHeight < document.body.scrollHeight) {
        // Scrolling up: show navbar
        navbar.style.top = "0";
    }

    lastScrollTop = st <= 0 ? 0 : st;
});




$(document).ready(function () {
    // Toggle button text for Medical Insurance
    $('#toggleMedical').on('click', function () {
        var target = $('#medicalInsurance');
        if (target.hasClass('show')) {
            $(this).text('Show Medical Insurance Packages');
        } else {
            $(this).text('Close Medical Insurance Packages');
        }
    });

    // Toggle button text for Car Insurance
    $('#toggleCar').on('click', function () {
        var target = $('#carInsurance');
        if (target.hasClass('show')) {
            $(this).text('Show Car Insurance Packages');
        } else {
            $(this).text('Close Car Insurance Packages');
        }
    });

    // Toggle button text for Vessel Insurance
    $('#toggleVessel').on('click', function () {
        var target = $('#vesselInsurance');
        if (target.hasClass('show')) {
            $(this).text('Show Vessel Insurance Packages');
        } else {
            $(this).text('Close Vessel Insurance Packages');
        }
    });

    // Bootstrap Collapse Event Listeners to update button text after transition
    $('#medicalInsurance').on('shown.bs.collapse', function () {
        $('#toggleMedical').text('Close Medical Insurance Packages');
    }).on('hidden.bs.collapse', function () {
        $('#toggleMedical').text('Show Medical Insurance Packages');
    });

    $('#carInsurance').on('shown.bs.collapse', function () {
        $('#toggleCar').text('Close Car Insurance Packages');
    }).on('hidden.bs.collapse', function () {
        $('#toggleCar').text('Show Car Insurance Packages');
    });

    $('#vesselInsurance').on('shown.bs.collapse', function () {
        $('#toggleVessel').text('Close Vessel Insurance Packages');
    }).on('hidden.bs.collapse', function () {
        $('#toggleVessel').text('Show Vessel Insurance Packages');
    });
});

