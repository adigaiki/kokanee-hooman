const recipeHeroImages = {
  'Chakli Recipe | Kokanee Hooman': '../images/chakli.jpg',
  'Patoli Recipe | Kokanee Hooman': '../images/pataleo-gen.png',
};

const heroPlaceholder = document.querySelector('.recipe-hero-placeholder');
const heroImage = recipeHeroImages[document.title];
if (heroPlaceholder && heroImage) {
  heroPlaceholder.style.backgroundImage = `url("${heroImage}")`;
  heroPlaceholder.style.backgroundPosition = 'center';
  heroPlaceholder.style.backgroundSize = 'cover';
  heroPlaceholder.textContent = '';
  heroPlaceholder.setAttribute('role', 'img');
  heroPlaceholder.setAttribute('aria-label', document.title.startsWith('Chakli') ? 'Freshly made chakli' : 'Patoli wrapped in turmeric leaf');
}

const instagramEmbeds = [...document.querySelectorAll('[data-instagram-embed]')].filter((embed) => !embed.innerHTML.includes('REPLACE_WITH_'));
if (instagramEmbeds.length && 'IntersectionObserver' in window) {
  const embedObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    document.body.appendChild(script);
    embedObserver.disconnect();
  }, { rootMargin: '300px' });
  instagramEmbeds.forEach((embed) => embedObserver.observe(embed));
}
