(() => {
  'use strict';

  const STORAGE_KEY = 'flower.greeting.20-10.v2';

  const defaultGreeting = {
    recipient: 'Công chúa của anh',
    message: "Chúc công chúa của anh 20/10 thật vui vẻ và hạnh phúc nhé. <3\n\nAnh ước gì hôm nay có thể ở bên em, ôm em một cái thật lâu, tặng em một bó hoa và tự mình nói những lời yêu thương này thay vì chỉ gửi qua màn hình. Anh biết yêu xa đôi khi sẽ khiến chúng mình nhớ nhau, tủi thân vì không thể ở cạnh nhau những lúc cần, nhưng anh mong em luôn cảm nhận được rằng mình vẫn được yêu thương thật nhiều.\n\nCảm ơn công chúa vì đã xuất hiện trong cuộc đời anh. Anh mong em luôn vui vẻ, bình an, ăn uống đầy đủ và đừng buồn một mình nhé. Nếu có mệt mỏi hay chuyện gì không vui, hãy nhớ rằng em vẫn có anh để chia sẻ và dựa vào.\n\nAnh không mong gì nhiều, chỉ mong chúng mình đủ yêu thương và kiên nhẫn để cùng nhau đi qua những ngày xa cách, để một ngày nào đó anh có thể ở bên em trong những dịp đặc biệt như thế này, chứ không còn phải gửi lời chúc qua màn hình nữa.\n\nChúc em luôn hạnh phúc, không chỉ hôm nay mà cả những ngày sau này. Anh thương em nhiều lắm, mong sớm được gặp em, ôm em thật lâu và bù đắp cho em những ngày mình phải xa nhau. ❤️",
    sender: 'Cà ri gà của em'
  };
  const dialog = document.getElementById('greetingCard');
  const openButton = document.getElementById('openCard');
  const reading = document.getElementById('cardReading');
  const editor = document.getElementById('cardEditor');
  const editButton = document.getElementById('editCard');
  const status = document.getElementById('cardStatus');
  const closeButton = document.getElementById('closeCard');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopLayout = window.matchMedia('(min-width: 1100px)');
  const sceneElements = [...document.querySelectorAll('.bouquet-composition, .scene-footer')];
  const layoutAnimations = new Set();
  const album = document.getElementById('memoryAlbum');
  const albumToggle = document.getElementById('toggleAlbum');
  const albumObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      album.classList.add('is-revealed');
      albumObserver.unobserve(album);
    }
  }, { threshold: 0.08 });

  let albumRevealPromise;
  function revealAlbum() {
    if (albumRevealPromise) return albumRevealPromise;
    // Restore saved photos and decode them before revealing the paper frames.
    const photos = [...album.querySelectorAll('img')];
    photos.forEach(photo => { photo.loading = 'eager'; });
    albumRevealPromise = Promise.resolve(window.albumPhotosReady)
      .then(() => Promise.allSettled(photos.map(photo => photo.decode())))
      .then(() => {
        album.hidden = false;
        albumObserver.observe(album);
      });
    return albumRevealPromise;
  }

  albumToggle.addEventListener('click', () => {
    const expanded = album.classList.toggle('is-spread');
    albumToggle.setAttribute('aria-expanded', String(expanded));
    albumToggle.innerHTML = expanded ? 'Gấp album <span aria-hidden="true">♡</span>' : 'Xòe album <span aria-hidden="true">♡</span>';
  });
  document.getElementById('viewAlbum').addEventListener('click', async () => {
    await revealAlbum();
    album.classList.add('is-revealed');
    album.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    albumToggle.focus({ preventScroll: true });
  });

  function reflowScene(changeLayout) {
    layoutAnimations.forEach(animation => animation.cancel());
    layoutAnimations.clear();
    const before = sceneElements.map(element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height };
    });
    changeLayout();
    if (motion.matches) return;
    sceneElements.forEach((element, index) => {
      const after = element.getBoundingClientRect();
      if (!after.width || !after.height) return;
      const dx = before[index].left - after.left - window.scrollX;
      const dy = before[index].top - after.top - window.scrollY;
      const scale = element.matches('.bouquet-composition')
        ? ` scale(${before[index].width / after.width}, ${before[index].height / after.height})` : '';
      const animation = element.animate([
        { transform: `translate(${dx}px, ${dy}px)${scale}` },
        { transform: 'none' }
      ], { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
      layoutAnimations.add(animation);
      animation.onfinish = () => layoutAnimations.delete(animation);
    });
  }

  function revealCard() {
    const rect = dialog.getBoundingClientRect();
    if (!desktopLayout.matches || rect.top < 16 || rect.top > window.innerHeight * 0.35 || rect.bottom > window.innerHeight - 16) {
      dialog.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function setCardOpen(open) {
    if (dialog.open === open) return;
    reflowScene(() => {
      if (open) {
        showReading();
        status.textContent = '';
        // A non-modal dialog participates in the page grid and reserves its own space.
        document.body.classList.add('card-open');
        dialog.show();
      } else {
        dialog.close();
        document.body.classList.remove('card-open');
        showReading();
      }
      openButton.setAttribute('aria-expanded', String(open));
      openButton.querySelector('.envelope-action').textContent = open ? 'Gấp thiệp' : 'Mở thiệp';
    });
    if (open) {
      closeButton.focus({ preventScroll: true });
      revealAlbum();
      revealCard();
      document.dispatchEvent(new Event('bouquet:celebrate'));
    } else {
      openButton.focus({ preventScroll: true });
      const rect = openButton.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        openButton.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
      }
    }
  }

  motion.addEventListener('change', () => {
    if (motion.matches) {
      layoutAnimations.forEach(animation => animation.cancel());
      layoutAnimations.clear();
    }
  });
  const inputs = {
    recipient: document.getElementById('recipientInput'),
    message: document.getElementById('messageInput'),
    sender: document.getElementById('senderInput')
  };
  let greeting = { ...defaultGreeting };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Object.keys(inputs).every(key => typeof saved[key] === 'string'
      && saved[key].trim().length > 0 && saved[key].length <= inputs[key].maxLength)) {
      greeting = Object.fromEntries(Object.keys(inputs).map(key => [key, saved[key].trim()]));
    }
  } catch {
    // The default letter stays usable when storage is unavailable or malformed.
  }

  function renderGreeting() {
    document.getElementById('cardRecipient').textContent = greeting.recipient;
    const paragraphs = greeting.message.split(/\n\s*\n/).map(text => {
      const paragraph = document.createElement('span');
      paragraph.className = 'message-paragraph';
      paragraph.textContent = text;
      return paragraph;
    });
    document.getElementById('cardMessage').replaceChildren(...paragraphs);
    document.getElementById('cardSender').textContent = greeting.sender;
  }

  function showReading() {
    reading.hidden = false;
    editor.hidden = true;
    dialog.setAttribute('aria-labelledby', 'cardTitle');
    dialog.scrollTop = 0;
  }

  document.addEventListener('bouquet:ready', () => { openButton.hidden = false; });
  document.addEventListener('bouquet:rose', event => {
    const wish = document.getElementById('roseWish');
    wish.classList.remove('is-new');
    wish.textContent = event.detail.message;
    // Restart the brief reveal even when two flowers share the same wish.
    void wish.offsetWidth;
    wish.classList.add('is-new');
  });
  document.getElementById('replayBloom').addEventListener('click', () => {
    document.dispatchEvent(new Event('bouquet:replay'));
    document.getElementById('roseWish').textContent = '';
  });

  openButton.addEventListener('click', () => setCardOpen(!dialog.open));
  closeButton.addEventListener('click', () => setCardOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open && !event.defaultPrevented) {
      event.preventDefault();
      setCardOpen(false);
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open || !document.body.classList.contains('card-open')) return;
    document.body.classList.remove('card-open');
    openButton.setAttribute('aria-expanded', 'false');
    openButton.querySelector('.envelope-action').textContent = 'Mở thiệp';
    showReading();
  });

  editButton.addEventListener('click', () => {
    Object.keys(inputs).forEach(key => {
      inputs[key].value = greeting[key];
      inputs[key].setCustomValidity('');
    });
    reading.hidden = true;
    editor.hidden = false;
    status.textContent = '';
    dialog.setAttribute('aria-labelledby', 'editorTitle');
    dialog.scrollTop = 0;
    inputs.recipient.focus({ preventScroll: true });
    revealCard();
  });
  document.getElementById('cancelEdit').addEventListener('click', () => {
    showReading();
    editButton.focus({ preventScroll: true });
    revealCard();
  });
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => input.setCustomValidity(''));
  });
  editor.addEventListener('submit', event => {
    event.preventDefault();
    for (const input of Object.values(inputs)) {
      input.setCustomValidity(input.value.trim() ? '' : 'Bạn viết vài chữ vào đây nhé.');
    }
    if (!editor.reportValidity()) return;
    greeting = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()]));
    renderGreeting();
    showReading();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(greeting));
      status.textContent = 'Đã lưu lời chúc của bạn.';
    } catch {
      status.textContent = 'Đã cập nhật thiệp. Trình duyệt chưa cho phép lưu để dùng lần sau.';
    }
    editButton.focus({ preventScroll: true });
    revealCard();
  });
  renderGreeting();
})();
