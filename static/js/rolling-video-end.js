document.addEventListener("DOMContentLoaded", function() {
    const carousel = document.querySelector('.video-carousel-end');
    const videos = Array.from(carousel.querySelectorAll('.video-slide-end'));
    const carouselWidth = carousel.clientWidth;

    let videoWidth = videos[0].videoWidth;
    let totalWidth =videos[0].clientWidth * videos.length;
    // print total width here
    console.log(videos.length); 
    console.log(videos[0]);
    let currentOffset = 0;
    let animationOn = true;

    function slideVideos() {
        if (!animationOn) return;
        currentOffset -= 2; // This controls the speed of the sliding. Adjust as needed.
        
        videos.forEach((video, index) => {
            let videoOffset = (index * videoWidth) + currentOffset;
            video.style.transform = `translateX(${videoOffset}px)`;
    
            // If the video is fully out of view on the left, reset its position to the right
            if (videoOffset + videoWidth < 0) {
                videoOffset +=  videoWidth;
                video.style.transform = `translateX(${videoOffset}px)`;
            }
        });

        if (currentOffset <= -(totalWidth - carouselWidth)) {
            // print curent offset
            console.log(currentOffset);
            currentOffset = 0;
        }
        requestAnimationFrame(slideVideos);
    }
    

    slideVideos();

    // Pause sliding animation on hover
    carousel.addEventListener('mouseover', function() {
        animationOn = false;
    });

    // Resume sliding animation on mouseout
    carousel.addEventListener('mouseout', function() {
        animationOn = true;
        slideVideos(); // Restart the animation loop
    });
});
