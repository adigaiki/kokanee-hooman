const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
if (siteHeader && menuToggle) {
  const closeMenu = () => {
    siteHeader.classList.remove('is-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('.visually-hidden').textContent = 'Open menu';
  };
  menuToggle.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('is-menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.querySelector('.visually-hidden').textContent = isOpen ? 'Close menu' : 'Open menu';
  });
  siteHeader.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', closeMenu));
}

document.querySelectorAll('img').forEach((image) => {
  if (!image.closest('.hero') && !image.closest('.site-header') && !image.hasAttribute('loading')) image.loading = 'lazy';
});

const postcard = document.querySelector('[data-story-carousel]');
if (postcard) {
  const slides = [...postcard.querySelectorAll('.postcard-slide')];
  const segments = [...postcard.querySelectorAll('.progress-seg')];
  const count = postcard.querySelector('[data-story-count]');
  const caption = postcard.querySelector('[data-story-caption]');
  const stamp = postcard.querySelector('[data-postcard-stamp]');
  const previous = postcard.querySelector('.postcard-prev');
  const next = postcard.querySelector('.postcard-next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storySync = postcard.hasAttribute('data-story-sync');
  let active = 0;
  let copyTimer;
  let movePostcard = () => {};

  const updateCopy = (slide) => {
    if (!caption || !stamp) return;
    window.clearTimeout(copyTimer);
    if (reduceMotion) {
      caption.textContent = slide.dataset.caption;
      stamp.textContent = slide.dataset.stamp;
      return;
    }
    postcard.classList.add('is-copy-swapping');
    copyTimer = window.setTimeout(() => {
      caption.textContent = slide.dataset.caption;
      stamp.textContent = slide.dataset.stamp;
      postcard.classList.remove('is-copy-swapping');
    }, 180);
  };

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    const slide = slides[active];
    slides.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === active));
    segments.forEach((segment, segmentIndex) => {
      segment.classList.toggle('is-complete', segmentIndex < active);
      segment.classList.toggle('is-active', segmentIndex === active);
      segment.setAttribute('aria-current', segmentIndex === active ? 'true' : 'false');
    });
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    updateCopy(slide);
    movePostcard(active);
  };

  previous?.addEventListener('click', () => showSlide(active - 1));
  next?.addEventListener('click', () => showSlide(active + 1));
  segments.forEach((segment, index) => {
    segment.addEventListener('click', () => showSlide(index));
    segment.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showSlide(index);
      }
    });
  });

  if (storySync) {
    const chapters = [...document.querySelectorAll('.story-chapter')];
    const storyGrid = postcard.closest('.story-grid');
    const desktopStory = window.matchMedia('(min-width: 801px)');
    let chapterOffsets = [];
    let resizeFrame;

    const cacheChapterOffsets = () => {
      if (!storyGrid || !desktopStory.matches) {
        chapterOffsets = [];
        postcard.style.transform = '';
        return;
      }
      const gridTop = storyGrid.getBoundingClientRect().top;
      chapterOffsets = chapters.map((chapter) => chapter.getBoundingClientRect().top - gridTop);
      movePostcard(active, false);
    };

    movePostcard = (index, shouldAnimate = true) => {
      if (!desktopStory.matches || !chapterOffsets[index]) {
        postcard.style.transform = '';
        return;
      }
      postcard.classList.toggle('is-story-moving', shouldAnimate && !reduceMotion);
      postcard.style.transform = `translate3d(0, ${Math.max(0, chapterOffsets[index])}px, 0) rotate(-2.5deg)`;
    };

    const handleStoryResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(cacheChapterOffsets);
    };

    cacheChapterOffsets();
    window.addEventListener('resize', handleStoryResize, { passive: true });
    desktopStory.addEventListener?.('change', handleStoryResize);

    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const chapterIndex = chapters.indexOf(entry.target);
        if (chapterIndex < 0) return;
        chapters.forEach((chapter, index) => chapter.classList.toggle('is-active', index === chapterIndex));
        showSlide(chapterIndex);
      });
    }, { rootMargin: '-26% 0px -54% 0px', threshold: 0.1 });
    chapters.forEach((chapter) => chapterObserver.observe(chapter));
  }

  let swipeStartX = 0;
  let swipeStartY = 0;
  postcard.addEventListener('pointerdown', (event) => {
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
  });
  postcard.addEventListener('pointerup', (event) => {
    const distanceX = event.clientX - swipeStartX;
    const distanceY = event.clientY - swipeStartY;
    if (Math.abs(distanceX) < 42 || Math.abs(distanceX) < Math.abs(distanceY)) return;
    showSlide(active + (distanceX < 0 ? 1 : -1));
  });

  showSlide(0);
}

const ingredientWheel = document.querySelector('[data-ingredient-wheel]');
if (ingredientWheel) {
  const ingredients = [...ingredientWheel.querySelectorAll('.orbital')];
  const image = ingredientWheel.querySelector('.wheel-image');
  const caption = ingredientWheel.querySelector('.wheel-caption');
  const name = ingredientWheel.querySelector('[data-wheel-name]');
  const story = ingredientWheel.querySelector('[data-wheel-story]');
  const size = ingredientWheel.querySelector('[data-wheel-size]');
  const photoStatus = ingredientWheel.querySelector('[data-wheel-photo-status]');
  const pantryLink = ingredientWheel.querySelector('[data-wheel-link]');
  const touchMode = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceWheelMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = ingredients[0];
  let imageTimer;
  let captionTimer;

  const setWheelImage = (ingredient) => {
    window.clearTimeout(imageTimer);
    ingredientWheel.classList.toggle('has-placeholder', Boolean(ingredient.dataset.photoStatus));
    photoStatus.textContent = ingredient.dataset.photoStatus || '';
    if (ingredient.dataset.photoStatus) return;
    if (reduceWheelMotion) {
      image.src = ingredient.dataset.image;
      image.alt = ingredient.dataset.alt;
      return;
    }
    image.classList.add('is-swapping');
    imageTimer = window.setTimeout(() => {
      image.src = ingredient.dataset.image;
      image.alt = ingredient.dataset.alt;
      image.classList.remove('is-swapping');
    }, 300);
  };
  const showIngredient = (ingredient) => {
    selected = ingredient;
    ingredients.forEach((item) => item.classList.toggle('is-selected', item === ingredient));
    window.clearTimeout(captionTimer);
    if (!reduceWheelMotion) caption.classList.add('is-swapping');
    captionTimer = window.setTimeout(() => {
      name.textContent = ingredient.textContent;
      story.textContent = ingredient.dataset.ingredientStory;
      size.textContent = ingredient.dataset.size;
      pantryLink.href = ingredient.dataset.productLink;
      caption.classList.remove('is-swapping');
    }, reduceWheelMotion ? 0 : 180);
    setWheelImage(ingredient);
  };

  ingredients.forEach((ingredient) => {
    ingredient.addEventListener('mouseenter', () => showIngredient(ingredient));
    ingredient.addEventListener('focus', () => showIngredient(ingredient));
    ingredient.addEventListener('click', () => showIngredient(ingredient));
    ingredient.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showIngredient(ingredient);
      }
    });
  });
  if (touchMode) {
    document.addEventListener('click', (event) => {
      if (!ingredientWheel.contains(event.target)) showIngredient(selected);
    });
  }
  showIngredient(selected);
}

document.querySelectorAll('.product-card[data-product-name]').forEach((card) => {
  const name = card.dataset.productName;
  const options = [...card.querySelectorAll('[data-product-size]')];
  const enquiry = card.querySelector('[data-product-enquiry]');

  const updateEnquiry = (size) => {
    const subject = `Enquiry: ${name} (${size})`;
    const body = `Hello Kokanee Hooman,\n\nI would like to enquire about ${name} in ${size}.\n\nThank you.`;
    enquiry.href = `mailto:hello@kokaneehooman.com?${new URLSearchParams({ subject, body }).toString()}`;
  };

  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((item) => {
        const selected = item === option;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      updateEnquiry(option.dataset.productSize);
    });
  });

  updateEnquiry(options[0].dataset.productSize);
});
