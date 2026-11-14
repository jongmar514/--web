/**
 * 명지대당구캠퍼스 (Myongji Billiards Campus)
 * Single Page Web Application Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initPhoneFormatter();
  initInstructorRadioSelection();
  initInquiryForm();
  initKakaoButton();
  initAdminLogViewer();
  initActiveNavSpy();
});

/* -------------------------------------------------------------
 * 1. Mobile Menu Toggle
 * ------------------------------------------------------------- */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!mobileMenuBtn || !mobileMenu) return;

  mobileMenuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    if (isHidden) {
      mobileMenu.classList.remove('hidden');
      menuIcon.classList.remove('fa-bars');
      menuIcon.classList.add('fa-xmark');
    } else {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('fa-xmark');
      menuIcon.classList.add('fa-bars');
    }
  });

  // Close menu when clicking any nav link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('fa-xmark');
      menuIcon.classList.add('fa-bars');
    });
  });
}

/* -------------------------------------------------------------
 * 2. Navbar Background Styling on Scroll
 * ------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('shadow-xl', 'bg-[#070e0a]/95');
      navbar.classList.remove('bg-[#09110d]/90');
    } else {
      navbar.classList.remove('shadow-xl', 'bg-[#070e0a]/95');
      navbar.classList.add('bg-[#09110d]/90');
    }
  });
}

/* -------------------------------------------------------------
 * 3. Auto-format Phone Number (010-XXXX-XXXX)
 * ------------------------------------------------------------- */
function initPhoneFormatter() {
  const phoneInput = document.getElementById('userPhone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = '';

    if (value.length < 4) {
      formatted = value;
    } else if (value.length < 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length < 11) {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
    } else {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    e.target.value = formatted;
  });
}

/* -------------------------------------------------------------
 * 4. Instructor Radio Card Highlight
 * ------------------------------------------------------------- */
function initInstructorRadioSelection() {
  const cards = document.querySelectorAll('.instructor-radio-card');
  cards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');

    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active-card'));
      card.classList.add('active-card');
      if (radio) radio.checked = true;
    });

    if (radio && radio.checked) {
      card.classList.add('active-card');
    }
  });
}

/* -------------------------------------------------------------
 * 5. Inquiry Form Submission & LocalStorage Persistence
 * ------------------------------------------------------------- */
const STORAGE_KEY = 'myongji_billiards_inquiries';

function initInquiryForm() {
  const form = document.getElementById('lessonInquiryForm');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const modalUserName = document.getElementById('modalUserName');
  const modalSummary = document.getElementById('modalSummary');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const inquiryData = {
      id: 'INQ-' + Date.now(),
      createdAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      name: formData.get('userName')?.trim(),
      phone: formData.get('userPhone')?.trim(),
      instructor: formData.get('targetInstructor') || '상담 후 추천',
      level: formData.get('userLevel'),
      program: formData.get('programType'),
      preferredTime: formData.get('preferredTime')?.trim() || '시간 협의 가능',
      message: formData.get('userMessage')?.trim() || '별도 문의 내용 없음'
    };

    // Save to LocalStorage
    saveInquiryToStorage(inquiryData);

    // Populate Modal Content
    if (modalUserName) modalUserName.textContent = inquiryData.name;
    if (modalSummary) {
      modalSummary.innerHTML = `
        <div><strong>연락처:</strong> ${escapeHtml(inquiryData.phone)}</div>
        <div><strong>희망 강사진:</strong> <span class="text-billiard-gold">${escapeHtml(inquiryData.instructor)}</span></div>
        <div><strong>선택 프로그램:</strong> ${escapeHtml(inquiryData.program)}</div>
        <div><strong>현재 실력:</strong> ${escapeHtml(inquiryData.level)}</div>
        <div><strong>희망 시간:</strong> ${escapeHtml(inquiryData.preferredTime)}</div>
      `;
    }

    // Show Modal
    if (successModal) {
      successModal.classList.remove('hidden');
    }

    // Reset Form
    form.reset();

    // Reset radio selection visual
    document.querySelectorAll('.instructor-radio-card').forEach((c, idx) => {
      if (idx === 2) {
        c.classList.add('active-card');
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = true;
      } else {
        c.classList.remove('active-card');
      }
    });
  });

  if (closeSuccessModal && successModal) {
    closeSuccessModal.addEventListener('click', () => {
      successModal.classList.add('hidden');
    });

    // Close on clicking backdrop
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.add('hidden');
      }
    });
  }
}

function saveInquiryToStorage(inquiry) {
  try {
    const list = getInquiriesFromStorage();
    list.unshift(inquiry); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save inquiry to localStorage', err);
  }
}

function getInquiriesFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/* -------------------------------------------------------------
 * 6. Kakao Consultation Quick Button
 * ------------------------------------------------------------- */
function initKakaoButton() {
  const kakaoBtn = document.getElementById('kakaoQuickBtn');
  const floatKakao = document.getElementById('floatKakao');

  const showKakaoAlert = (e) => {
    e.preventDefault();
    alert("카카오톡 상담 안내:\n\n카카오톡 친구 검색창에서 '명지대당구캠퍼스'를 검색하시거나, 대표 전화(010-4633-0594)로 연락주시면 1:1 빠른 상담이 가능합니다.");
  };

  if (kakaoBtn) kakaoBtn.addEventListener('click', showKakaoAlert);
  if (floatKakao) floatKakao.addEventListener('click', showKakaoAlert);
}

/* -------------------------------------------------------------
 * 7. Admin / User Inquiry Log Modal Viewer
 * ------------------------------------------------------------- */
function initAdminLogViewer() {
  const adminBtn = document.getElementById('adminInquiryBtn');
  const viewRecentBtn = document.getElementById('viewRecentInquiryBtn');
  const modal = document.getElementById('inquiryLogModal');
  const closeBtn = document.getElementById('closeLogModal');
  const closeBtn2 = document.getElementById('closeLogModalBtn');
  const clearBtn = document.getElementById('clearLogsBtn');
  const container = document.getElementById('logListContainer');

  if (!modal || !container) return;

  const openLogModal = () => {
    renderInquiryLogs(container);
    modal.classList.remove('hidden');
  };

  const closeLogModal = () => {
    modal.classList.add('hidden');
  };

  if (adminBtn) adminBtn.addEventListener('click', openLogModal);
  if (viewRecentBtn) viewRecentBtn.addEventListener('click', openLogModal);
  if (closeBtn) closeBtn.addEventListener('click', closeLogModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeLogModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLogModal();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('접수된 모든 상담 로그를 비우시겠습니까?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderInquiryLogs(container);
      }
    });
  }
}

function renderInquiryLogs(container) {
  const inquiries = getInquiriesFromStorage();

  if (inquiries.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-gray-500">
        <i class="fa-regular fa-folder-open text-3xl mb-2 text-gray-600 block"></i>
        아직 접수된 상담 내역이 없습니다.<br/>
        레슨 문의 폼을 작성하시면 여기에 실시간으로 기록됩니다.
      </div>
    `;
    return;
  }

  container.innerHTML = inquiries.map(item => `
    <div class="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 hover:border-billiard-gold/40 transition-colors">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-bold text-white text-sm">${escapeHtml(item.name)}</span>
          <span class="text-xs text-billiard-gold">(${escapeHtml(item.phone)})</span>
        </div>
        <span class="text-[11px] text-gray-400 font-mono">${escapeHtml(item.createdAt)}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-300">
        <div><strong class="text-gray-400">강사진:</strong> ${escapeHtml(item.instructor)}</div>
        <div><strong class="text-gray-400">프로그램:</strong> ${escapeHtml(item.program)}</div>
        <div><strong class="text-gray-400">구력/핸디:</strong> ${escapeHtml(item.level)}</div>
        <div><strong class="text-gray-400">희망시간:</strong> ${escapeHtml(item.preferredTime)}</div>
      </div>
      ${item.message && item.message !== '별도 문의 내용 없음' ? `
        <div class="pt-2 border-t border-white/5 text-[11px] text-gray-400">
          <strong class="text-gray-300">문의내용:</strong> ${escapeHtml(item.message)}
        </div>
      ` : ''}
    </div>
  `).join('');
}

/* -------------------------------------------------------------
 * 8. Active Nav Spy on Scroll
 * ------------------------------------------------------------- */
function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (currentId && link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* Helper to prevent XSS in rendering logs */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
