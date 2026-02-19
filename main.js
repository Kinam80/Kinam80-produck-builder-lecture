document.addEventListener('DOMContentLoaded', () => {
    const profilePicture = document.getElementById('profile-picture');
    const profilePictureInput = document.getElementById('profile-picture-input');

    if (profilePicture && profilePictureInput) {
        profilePicture.addEventListener('click', () => {
            profilePictureInput.click();
        });

        profilePictureInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicture.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const canvas = document.getElementById('flower-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Flower {
            constructor(x, y, size, speed) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.speed = speed;
            }

            update() {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.y = 0 - this.size;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            }
        }

        const flowers = [];
        function init() {
            for (let i = 0; i < 50; i++) {
                let size = Math.random() * 5 + 2;
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                let speed = Math.random() * 1 + 0.5;
                flowers.push(new Flower(x, y, size, speed));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < flowers.length; i++) {
                flowers[i].update();
                flowers[i].draw();
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            flowers.length = 0; // Clear the array
            init();
        });
    }
});
