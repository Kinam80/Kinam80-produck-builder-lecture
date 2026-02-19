document.addEventListener('DOMContentLoaded', () => {
    const profilePicture = document.getElementById('profile-picture');
    const profilePictureInput = document.getElementById('profile-picture-input');
    const bgColorPicker = document.getElementById('bg-color-picker');

    // 배경 색상 관리
    const savedBgColor = localStorage.getItem('cyworldBgColor');
    if (savedBgColor) {
        document.body.style.backgroundColor = savedBgColor;
        bgColorPicker.value = savedBgColor;
    }

    bgColorPicker.addEventListener('change', (event) => {
        const newColor = event.target.value;
        document.body.style.backgroundColor = newColor;
        localStorage.setItem('cyworldBgColor', newColor);
    });

    if (profilePicture && profilePictureInput) {
        // 프로필 사진 로드
        const savedProfilePicture = localStorage.getItem('cyworldProfilePicture');
        if (savedProfilePicture) {
            profilePicture.src = savedProfilePicture;
        } else {
            profilePicture.src = "https://via.placeholder.com/200"; // 기본 이미지
        }

        profilePicture.addEventListener('click', () => {
            profilePictureInput.click();
        });

        profilePictureInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePicture.src = e.target.result;
                    localStorage.setItem('cyworldProfilePicture', e.target.result); // 로컬 스토리지에 저장
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

    // 추억 사진 관리
    const memoryPhotoInput = document.getElementById('memory-photo-input');
    const addMemoryPhotoBtn = document.getElementById('add-memory-photo');
    const memoryPhotosGrid = document.querySelector('.memory-photos-grid');

    let memoryPhotos = JSON.parse(localStorage.getItem('cyworldMemoryPhotos')) || [];

    function saveMemoryPhotos() {
        localStorage.setItem('cyworldMemoryPhotos', JSON.stringify(memoryPhotos));
    }

    function displayMemoryPhotos() {
        memoryPhotosGrid.innerHTML = ''; // 기존 사진 지우기
        memoryPhotos.forEach((photoSrc, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'memory-photo-item';

            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = `추억 사진 ${index + 1}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
            deleteBtn.addEventListener('click', () => {
                memoryPhotos.splice(index, 1); // 배열에서 삭제
                saveMemoryPhotos(); // 로컬 스토리지 업데이트
                displayMemoryPhotos(); // 화면 다시 그리기
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            memoryPhotosGrid.appendChild(imgContainer);
        });
    }

    addMemoryPhotoBtn.addEventListener('click', () => {
        memoryPhotoInput.click();
    });

    memoryPhotoInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    memoryPhotos.push(e.target.result);
                    saveMemoryPhotos();
                    displayMemoryPhotos();
                };
                reader.readAsDataURL(file);
            });
        }
    });

    displayMemoryPhotos(); // 페이지 로드 시 추억 사진 표시

    // 방명록 관리
    const guestbookMessageInput = document.getElementById('guestbook-message');
    const submitGuestbookBtn = document.getElementById('submit-guestbook-entry');
    const guestbookEntriesContainer = document.querySelector('.guestbook-entries');

    let guestbookEntries = JSON.parse(localStorage.getItem('cyworldGuestbookEntries')) || [];

    function saveGuestbookEntries() {
        localStorage.setItem('cyworldGuestbookEntries', JSON.stringify(guestbookEntries));
    }

    function displayGuestbookEntries() {
        guestbookEntriesContainer.innerHTML = ''; // 기존 방명록 지우기
        guestbookEntries.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'guestbook-entry-item';
            entryDiv.innerHTML = `
                <p><strong>익명</strong> (${entry.timestamp})</p>
                <p>${entry.message}</p>
                <button class="delete-guestbook-entry" data-index="${index}">삭제</button>
            `;
            guestbookEntriesContainer.appendChild(entryDiv);
        });

        // 삭제 버튼 이벤트 리스너 재등록
        document.querySelectorAll('.delete-guestbook-entry').forEach(button => {
            button.addEventListener('click', (event) => {
                const indexToDelete = event.target.dataset.index;
                guestbookEntries.splice(indexToDelete, 1);
                saveGuestbookEntries();
                displayGuestbookEntries();
            });
        });
    }

    submitGuestbookBtn.addEventListener('click', () => {
        const message = guestbookMessageInput.value.trim();
        if (message) {
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            guestbookEntries.push({ message, timestamp });
            saveGuestbookEntries();
            guestbookMessageInput.value = ''; // 입력 필드 초기화
            displayGuestbookEntries();
        }
    });

    displayGuestbookEntries(); // 페이지 로드 시 방명록 표시
});


