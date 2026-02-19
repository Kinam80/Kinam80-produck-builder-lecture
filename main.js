// main.js

// 인증 및 사용자 관리 함수들
function initializeAuth() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length === 0) {
        // 기본 관리자 계정 생성
        users.push({
            username: 'admin',
            password: 'admin123',
            name: '관리자',
            role: 'admin',
            status: 'approved'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (user.status === 'approved' || user.role === 'admin') {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            return { success: true, user: user };
        } else if (user.status === 'pending') {
            return { success: false, message: '관리자의 승인을 기다리고 있습니다.' };
        } else {
            return { success: false, message: '로그인할 수 없는 계정입니다.' };
        }
    } else {
        return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
}

function register(username, password, name) {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return { success: false, message: '이미 존재하는 아이디입니다.' };
    }

    const newUser = {
        username: username,
        password: password,
        name: name,
        role: 'user', // 기본 역할은 user
        status: 'pending' // 관리자 승인 대기
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, message: '회원가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.' };
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('loggedInUser'));
}

// 페이지별 로직 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth(); // 인증 시스템 초기화 (기본 관리자 계정 생성 등)

    const path = window.location.pathname;

    // 로그인 페이지 로직
    if (path.includes('login.html')) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('login-button');

        // 이미 로그인 되어있으면 index.html로 리다이렉트
        if (getCurrentUser()) {
            window.location.href = 'index.html';
        }

        if (loginButton) {
            loginButton.addEventListener('click', () => {
                const username = usernameInput.value;
                const password = passwordInput.value;
                const result = login(username, password);

                if (result.success) {
                    alert('로그인 성공!');
                    if (result.user.role === 'admin') {
                        window.location.href = 'admin.html'; // 관리자는 관리자 페이지로
                    } else {
                        window.location.href = 'index.html'; // 일반 사용자는 메인 페이지로
                    }
                } else {
                    alert('로그인 실패: ' + result.message);
                }
            });
        }
    }

    // 회원가입 페이지 로직
    else if (path.includes('register.html')) {
        const regUsernameInput = document.getElementById('reg-username');
        const regPasswordInput = document.getElementById('reg-password');
        const regPasswordConfirmInput = document.getElementById('reg-password-confirm');
        const regNameInput = document.getElementById('reg-name');
        const registerButton = document.getElementById('register-button');

        if (registerButton) {
            registerButton.addEventListener('click', () => {
                const username = regUsernameInput.value;
                const password = regPasswordInput.value;
                const passwordConfirm = regPasswordConfirmInput.value;
                const name = regNameInput.value;

                if (!username || !password || !passwordConfirm || !name) {
                    alert('모든 필드를 입력해주세요.');
                    return;
                }

                if (password !== passwordConfirm) {
                    alert('비밀번호가 일치하지 않습니다.');
                    return;
                }

                const result = register(username, password, name);
                if (result.success) {
                    alert(result.message);
                    window.location.href = 'login.html';
                } else {
                    alert('회원가입 실패: ' + result.message);
                }
            });
        }
    }

    // 메인 페이지 (index.html) 로직
    else if (path.includes('index.html')) {
        const loggedInUser = getCurrentUser();
        if (!loggedInUser) { // 로그인 안되어있으면 로그인 페이지로
            window.location.href = 'login.html';
            return;
        }

        // 로그인된 사용자 정보 표시
        const profileName = document.querySelector('.profile p:nth-child(3)'); // 이름이 표시되는 p 태그
        if (profileName) {
            profileName.textContent = `이름: ${loggedInUser.name}`;
        }
        
        // 로그아웃 버튼 추가 (예시)
        const logoutButton = document.createElement('button');
        logoutButton.textContent = '로그아웃';
        logoutButton.style.cssText = 'position: absolute; top: 20px; right: 20px; padding: 10px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;';
        logoutButton.addEventListener('click', logout);
        document.body.appendChild(logoutButton);


        const profilePicture = document.getElementById('profile-picture');
        const profilePictureInput = document.getElementById('profile-picture-input');
        const bgColorPicker = document.getElementById('bg-color-picker');

        // 배경 색상 관리
        const savedBgColor = localStorage.getItem('cyworldBgColor');
        if (savedBgColor) {
            document.body.style.backgroundColor = savedBgColor;
            bgColorPicker.value = savedBgColor;
        } else { // 기본 배경색 설정
            document.body.style.backgroundColor = '#f0f8ff';
            bgColorPicker.value = '#f0f8ff';
        }

        if (bgColorPicker) { // bgColorPicker가 index.html에만 있으므로 체크
            bgColorPicker.addEventListener('change', (event) => {
                const newColor = event.target.value;
                document.body.style.backgroundColor = newColor;
                localStorage.setItem('cyworldBgColor', newColor);
            });
        }


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

        if (addMemoryPhotoBtn) { // addMemoryPhotoBtn이 index.html에만 있으므로 체크
            addMemoryPhotoBtn.addEventListener('click', () => {
                memoryPhotoInput.click();
            });
        }


        if (memoryPhotoInput) { // memoryPhotoInput이 index.html에만 있으므로 체크
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
        }

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
                    <p><strong>${entry.author || '익명'}</strong> (${entry.timestamp})</p>
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

        if (submitGuestbookBtn) { // submitGuestbookBtn이 index.html에만 있으므로 체크
            submitGuestbookBtn.addEventListener('click', () => {
                const message = guestbookMessageInput.value.trim();
                const currentUser = getCurrentUser(); // 현재 로그인된 사용자 정보 가져오기
                const author = currentUser ? currentUser.name : '익명';

                if (message) {
                    const now = new Date();
                    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    guestbookEntries.push({ author, message, timestamp });
                    saveGuestbookEntries();
                    guestbookMessageInput.value = ''; // 입력 필드 초기화
                    displayGuestbookEntries();
                }
            });
        }
        displayGuestbookEntries(); // 페이지 로드 시 방명록 표시
    }
    // 관리자 페이지 로직
    else if (path.includes('admin.html')) {
        const userTableBody = document.querySelector('#user-table tbody');
        const adminLogoutButton = document.getElementById('admin-logout-button');
        const userStatusFilter = document.getElementById('user-status-filter');

        function displayUsersTable() {
            userTableBody.innerHTML = ''; // 기존 내용 지우기
            let users = getUsers();
            const filterStatus = userStatusFilter.value;

            // 관리자 계정 제외 및 필터링
            users = users.filter(user => user.role !== 'admin' && (filterStatus === 'all' || user.status === filterStatus));

            users.forEach(user => {
                const row = userTableBody.insertRow();
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.name}</td>
                    <td>${user.status === 'pending' ? '승인 대기' : user.status === 'approved' ? '승인됨' : '차단됨'}</td>
                    <td>${user.role === 'admin' ? '관리자' : '일반 사용자'}</td>
                    <td>
                        ${user.status === 'pending' ? `<button class="action-button approve" data-username="${user.username}">승인</button>` : ''}
                        ${user.status === 'approved' ? `<button class="action-button ban" data-username="${user.username}">차단</button>` : ''}
                        ${user.status === 'banned' ? `<button class="action-button unban" data-username="${user.username}">차단 해제</button>` : ''}
                        <button class="action-button delete" data-username="${user.username}">탈퇴</button>
                    </td>
                `;
            });

            // 액션 버튼 이벤트 리스너
            document.querySelectorAll('.action-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const username = event.target.dataset.username;
                    let users = getUsers();
                    const targetUserIndex = users.findIndex(u => u.username === username);
                    if (targetUserIndex === -1) return; // 사용자를 찾을 수 없음

                    const action = event.target.classList[1]; // approve, ban, unban, delete

                    if (action === 'approve') {
                        users[targetUserIndex].status = 'approved';
                        alert(`${username} 님의 가입이 승인되었습니다.`);
                    } else if (action === 'ban') {
                        users[targetUserIndex].status = 'banned';
                        alert(`${username} 님이 차단되었습니다.`);
                    } else if (action === 'unban') {
                        users[targetUserIndex].status = 'approved';
                        alert(`${username} 님의 차단이 해제되었습니다.`);
                    } else if (action === 'delete') {
                        if (confirm(`${username} 님을 정말로 탈퇴시키겠습니까?`)) {
                            users.splice(targetUserIndex, 1);
                            alert(`${username} 님이 탈퇴 처리되었습니다.`);
                        }
                    }
                    saveUsers(users);
                    displayUsersTable(); // 테이블 새로고침
                });
            });
        }

        userStatusFilter.addEventListener('change', displayUsersTable);
        adminLogoutButton.addEventListener('click', logout);
        displayUsersTable(); // 페이지 로드 시 사용자 테이블 표시
    }
});