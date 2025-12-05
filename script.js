// ==================== [Common Data & Utils] ====================
const categories = ["교육/역량", "취업/창업", "금융/자산", "창업", "복지/건강", "참여/권리"];

function generatePolicyData(count) {
    const data = [];
    for (let i = 1; i <= count; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        data.push({
            id: i,
            category: randomCategory,
            title: `[${randomCategory}] 청년 정책 제목 ${i}`,
            desc: "이 정책은 서울시 청년들을 위한 맞춤형 지원 사업입니다. 혜택을 놓치지 마세요. 이 정책은 특히 서울시 거주 청년들에게...",
            date: `2025.12.${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')} 마감`,
            image: `https://placehold.co/600x400/transparent/dddddd?text=Img+${i}`
        });
    }
    return data;
}

// Data Sets
const tinderData = generatePolicyData(10);
const allSlideData = generatePolicyData(30);
const myLikedData = generatePolicyData(5); // 마이페이지용 더미 데이터

// Card HTML Generator
function createCardHTML(item, isTinder = false) {
    const cardClass = isTinder ? 'policy-card tinder-card' : 'policy-card';
    const swipeIcons = isTinder ? `
        <div class="swipe-icon left"><i class="fa-solid fa-heart-crack"></i></div>
        <div class="swipe-icon right"><i class="fa-solid fa-heart"></i></div>
    ` : '';
    
    // Encode object to string for function argument
    const itemData = encodeURIComponent(JSON.stringify(item));
    
    return `
        <div class="${cardClass}" data-id="${item.id}" onclick="openModal('${itemData}')">
            ${swipeIcons}
            <div class="card-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${item.desc}</p>
                <span class="card-date">${item.date}</span>
            </div>
        </div>
    `;
}

// ==================== [Modal Logic (Common)] ====================
const modal = document.getElementById('policy-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalImg = document.getElementById('modal-img');
const modalCategory = document.getElementById('modal-category');
const modalDate = document.getElementById('modal-date');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalHeartBtn = document.getElementById('modal-heart-btn');

window.openModal = function(itemDataEncoded) {
    const item = JSON.parse(decodeURIComponent(itemDataEncoded));
    
    if(modalTitle) modalTitle.innerText = item.title;
    if(modalDesc) modalDesc.innerText = item.desc;
    if(modalImg) modalImg.src = item.image;
    if(modalCategory) modalCategory.innerText = item.category;
    if(modalDate) modalDate.innerText = item.date;
    
    if(modalHeartBtn) {
        modalHeartBtn.classList.remove('active');
        modalHeartBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
    
    if(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.add('active'); }, 10);
    }
};

function closeModal() {
    if(modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if(modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

if(modalHeartBtn) {
    modalHeartBtn.addEventListener('click', () => {
        modalHeartBtn.classList.toggle('active');
        if(modalHeartBtn.classList.contains('active')) {
            modalHeartBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        } else {
            modalHeartBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
    });
}

// ==================== [Main Page Logic] ====================
// DOM 요소가 존재할 때만 실행 (mypage.html에서 에러 방지)
const tinderList = document.getElementById('tinder-list');
const slideRow1 = document.getElementById('slide-row-1');
const slideRow2 = document.getElementById('slide-row-2');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultMessage = document.getElementById('result-message');
const btnSignup = document.getElementById('btn-signup');
const btnShare = document.getElementById('btn-share');
const signupModal = document.getElementById('signup-modal');
const shareModal = document.getElementById('share-modal');
const shareUrlInput = document.getElementById('share-url-input');

// 1. Tinder Section Logic
class CardSwiper {
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.init();
    }
    init() {
        if(!this.container) return;
        this.container.innerHTML = '<div class="no-more-cards">모든 카드를 확인했습니다! 🎉</div>';
        [...this.data].reverse().forEach(item => {
            const cardHTML = createCardHTML(item, true);
            this.container.insertAdjacentHTML('beforeend', cardHTML);
        });
        this.cards = document.querySelectorAll('.tinder-card');
        this.setupEvents();
    }
    setupEvents() { this.cards.forEach((card) => { this.addListeners(card); }); }
    addListeners(card) {
        let isDragging = false; let startX = 0; let currentX = 0;
        const leftIcon = card.querySelector('.swipe-icon.left');
        const rightIcon = card.querySelector('.swipe-icon.right');
        const startDrag = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            card.style.transition = 'none';
        };
        const moveDrag = (e) => {
            if (!isDragging) return;
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            currentX = clientX - startX;
            const rotate = currentX * 0.05;
            card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
            const opacity = Math.min(Math.abs(currentX) / 100, 1);
            if (currentX > 0) { rightIcon.style.opacity = opacity; leftIcon.style.opacity = 0; }
            else { leftIcon.style.opacity = opacity; rightIcon.style.opacity = 0; }
        };
        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            card.style.transition = 'transform 0.3s ease';
            leftIcon.style.opacity = 0; rightIcon.style.opacity = 0;
            const threshold = 100;
            if (currentX > threshold) { this.swipeCard(card, 'right'); }
            else if (currentX < -threshold) { this.swipeCard(card, 'left'); }
            else { card.style.transform = 'translateX(0) rotate(0)'; }
        };
        card.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
        card.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
    }
    swipeCard(card, direction) {
        const moveX = direction === 'right' ? 1000 : -1000;
        const rotate = direction === 'right' ? 30 : -30;
        card.style.transform = `translateX(${moveX}px) rotate(${rotate}deg)`;
        card.style.opacity = '0';
        setTimeout(() => { card.remove(); }, 300);
    }
}

// 2. Marquee Slide Logic
function renderSlide(data) {
    if(!slideRow1 || !slideRow2) return;
    const row1Data = data.filter((_, i) => i % 2 === 0);
    const row2Data = data.filter((_, i) => i % 2 !== 0);
    const infiniteRow1 = [...row1Data, ...row1Data, ...row1Data];
    const infiniteRow2 = [...row2Data, ...row2Data, ...row2Data];
    slideRow1.innerHTML = infiniteRow1.map(item => createCardHTML(item, false)).join('');
    slideRow2.innerHTML = infiniteRow2.map(item => createCardHTML(item, false)).join('');
    if(resultMessage) resultMessage.innerText = `추천 정책 (${data.length}건)`;
}

function handleSearch() {
    if(!searchInput) return;
    const keyword = searchInput.value.trim().toLowerCase();
    if (keyword === "") { renderSlide(allSlideData); return; }
    const filteredData = allSlideData.filter(item => item.title.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword));
    renderSlide(filteredData);
    if(resultMessage) resultMessage.innerText = `'${keyword}' 검색 결과 (${filteredData.length}건)`;
}

// 3. Signup & Share Modals (Main only)
if(btnSignup) {
    btnSignup.addEventListener('click', () => {
        signupModal.classList.remove('hidden');
        setTimeout(() => { signupModal.classList.add('active'); }, 10);
    });
    window.closeSignupModal = function() {
        signupModal.classList.remove('active');
        setTimeout(() => { signupModal.classList.add('hidden'); }, 300);
    }
    signupModal.addEventListener('click', (e) => { if (e.target === signupModal) closeSignupModal(); });
}

if(btnShare) {
    btnShare.addEventListener('click', () => {
        shareUrlInput.value = window.location.href;
        shareModal.classList.remove('hidden');
        setTimeout(() => { shareModal.classList.add('active'); }, 10);
    });
    window.closeShareModal = function() {
        shareModal.classList.remove('active');
        setTimeout(() => { shareModal.classList.add('hidden'); }, 300);
    }
    window.copyUrl = function() {
        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
            alert("URL이 복사되었습니다!");
            closeShareModal();
        });
    }
    shareModal.addEventListener('click', (e) => { if (e.target === shareModal) closeShareModal(); });
}

// ==================== [My Page Logic] ====================
const mypageList = document.getElementById('mypage-list');

function renderMyPage() {
    if(!mypageList) return;
    
    if(myLikedData.length === 0) {
        mypageList.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <p>아직 찜한 정책이 없어요.</p>
            </div>
        `;
    } else {
        mypageList.innerHTML = myLikedData.map(item => createCardHTML(item, false)).join('');
    }
}

// ==================== [Initialization] ====================
document.addEventListener('DOMContentLoaded', () => {
    // Run Main Page Logic if elements exist
    if(tinderList) new CardSwiper(tinderList, tinderData);
    if(slideRow1) renderSlide(allSlideData);
    if(searchBtn) searchBtn.addEventListener('click', handleSearch);
    if(searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    
    // Run My Page Logic
    if(mypageList) renderMyPage();
});