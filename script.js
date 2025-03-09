// DOM Elements
const toggleThemeBtn = document.getElementById('toggle-theme');
const toggleLangBtn = document.getElementById('toggle-lang');
const themeText = document.getElementById('theme-text');
const langText = document.getElementById('lang-text');
const titleElement = document.getElementById('title');
const subtitleElement = document.getElementById('subtitle');
const urlLabelElement = document.getElementById('url-label');
const emptyTitleElement = document.getElementById('empty-title');
const emptyDescriptionElement = document.getElementById('empty-description');
const siteUrlInput = document.getElementById('site-url');
const extractBtn = document.getElementById('extract-btn');
const initialState = document.getElementById('initial-state');
const loader = document.getElementById('loader');
const loaderContainer = document.querySelector('.loader-container');
const errorMessage = document.getElementById('error-message');
const noResults = document.getElementById('no-results');
const resultsContainer = document.getElementById('results');

// Language translations
const translations = {
  en: {
    title: 'WordPress User Extractor',
    subtitle: 'Extract user information from WordPress sites via the REST API',
    urlLabel: 'WordPress Site URL',
    toggleLang: 'فارسی',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    extractUsers: 'Extract Users',
    enterURL: 'Enter WordPress site URL (e.g. https://example.com)',
    loading: 'Loading...',
    error: 'Error fetching data. Please check the URL and try again.',
    networkError: 'Network error. Please check your connection and try again.',
    noUsers: 'No users found for this WordPress site.',
    invalidURL: 'Please enter a valid URL',
    emptyTitle: 'Ready to Extract Users',
    emptyDescription: 'Enter a WordPress site URL above and click "Extract Users" to fetch user information.',
    id: 'ID',
    name: 'Name',
    username: 'Username',
    role: 'Role',
    registered: 'Registered',
    url: 'Website',
    description: 'Description'
  },
  fa: {
    title: 'استخراج کننده کاربران وردپرس',
    subtitle: 'استخراج اطلاعات کاربران از سایت‌های وردپرسی از طریق REST API',
    urlLabel: 'آدرس سایت وردپرسی',
    toggleLang: 'English',
    darkMode: 'حالت تاریک',
    lightMode: 'حالت روشن',
    extractUsers: 'استخراج کاربران',
    enterURL: 'آدرس سایت وردپرسی را وارد کنید (مثلا https://example.com)',
    loading: 'در حال بارگذاری...',
    error: 'خطا در دریافت اطلاعات. لطفا آدرس را بررسی کرده و دوباره تلاش کنید.',
    networkError: 'خطای شبکه. لطفا اتصال خود را بررسی کرده و دوباره تلاش کنید.',
    noUsers: 'کاربری برای این سایت وردپرسی یافت نشد.',
    invalidURL: 'لطفا یک آدرس معتبر وارد کنید',
    emptyTitle: 'آماده استخراج کاربران',
    emptyDescription: 'آدرس سایت وردپرسی را در بالا وارد کنید و روی «استخراج کاربران» کلیک کنید تا اطلاعات کاربران را دریافت کنید.',
    id: 'شناسه',
    name: 'نام',
    username: 'نام کاربری',
    role: 'نقش',
    registered: 'تاریخ ثبت نام',
    url: 'وب‌سایت',
    description: 'توضیحات'
  }
};

// App state
let currentLang = 'en';
let isDarkMode = false;

// Functions
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
  updateUI();
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fa' : 'en';
  document.documentElement.lang = currentLang;
  document.body.style.direction = currentLang === 'fa' ? 'rtl' : 'ltr';
  document.body.setAttribute('dir', currentLang === 'fa' ? 'rtl' : 'ltr');
  localStorage.setItem('language', currentLang);
  updateUI();
}

function updateUI() {
  const t = translations[currentLang];
  
  // Update text content
  titleElement.textContent = t.title;
  subtitleElement.textContent = t.subtitle;
  urlLabelElement.textContent = t.urlLabel;
  langText.textContent = t.toggleLang;
  themeText.textContent = isDarkMode ? t.lightMode : t.darkMode;
  extractBtn.querySelector('span').textContent = t.extractUsers;
  siteUrlInput.placeholder = t.enterURL;
  noResults.textContent = t.noUsers;
  emptyTitleElement.textContent = t.emptyTitle;
  emptyDescriptionElement.textContent = t.emptyDescription;
  
  // If there are results, refresh them with the current language
  if (resultsContainer.children.length > 0) {
    const cachedData = JSON.parse(localStorage.getItem('wpUserData'));
    if (cachedData) {
      displayResults(cachedData);
    }
  }
}

function resetUI() {
  initialState.style.display = 'block';
  errorMessage.style.display = 'none';
  noResults.style.display = 'none';
  resultsContainer.innerHTML = '';
  loaderContainer.style.display = 'none';
}

async function extractUsers() {
  const siteUrl = siteUrlInput.value.trim();
  
  // Validate URL
  if (!siteUrl) {
    showError(translations[currentLang].invalidURL);
    return;
  }
  
  // Format URL
  let formattedUrl = siteUrl;
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  
  // Remove trailing slash if present
  if (formattedUrl.endsWith('/')) {
    formattedUrl = formattedUrl.slice(0, -1);
  }
  
  // Show loader
  initialState.style.display = 'none';
  loaderContainer.style.display = 'flex';
  loader.style.display = 'block';
  errorMessage.style.display = 'none';
  noResults.style.display = 'none';
  resultsContainer.innerHTML = '';
  
  try {
    const response = await fetch(`${formattedUrl}/wp-json/wp/v2/users/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the data
    localStorage.setItem('wpUserData', JSON.stringify(data));
    
    // Display results
    displayResults(data);
  } catch (error) {
    showError(error.message.includes('fetch') 
      ? translations[currentLang].networkError 
      : translations[currentLang].error);
  } finally {
    loaderContainer.style.display = 'none';
    loader.style.display = 'none';
  }
}

function displayResults(users) {
  resultsContainer.innerHTML = '';
  
  if (!users || users.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  
  const t = translations[currentLang];
  
  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    
    // Set avatar image or fallback
    let avatarUrl = user.avatar_urls ? 
      (user.avatar_urls['96'] || user.avatar_urls['48'] || user.avatar_urls['24']) : 
      'https://secure.gravatar.com/avatar/?s=96&d=mm&r=g';
    
    userCard.innerHTML = `
      <div class="user-header">
        <img class="user-avatar" src="${avatarUrl}" alt="${user.name || 'User'}">
        <div>
          <h3 class="user-name">${user.name || 'Unknown'}</h3>
          <div class="user-username">@${user.slug || user.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</div>
        </div>
      </div>
      
      <div class="user-meta">
        <div class="meta-label">${t.id}:</div>
        <div class="meta-value">${user.id}</div>
        
        ${user.url ? `
        <div class="meta-label">${t.url}:</div>
        <div class="meta-value"><a href="${user.url}" target="_blank" rel="noopener">${user.url.replace(/^https?:\/\//, '')}</a></div>
        ` : ''}
        
        ${user.registered_date ? `
        <div class="meta-label">${t.registered}:</div>
        <div class="meta-value">${new Date(user.registered_date).toLocaleDateString(currentLang === 'fa' ? 'fa-IR' : undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}</div>
        ` : ''}
      </div>
      
      ${user.description ? `
      <div class="user-description">${user.description}</div>
      ` : ''}
    `;
    
    resultsContainer.appendChild(userCard);
  });
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  loaderContainer.style.display = 'none';
  initialState.style.display = 'none';
}

// Event listeners
toggleThemeBtn.addEventListener('click', toggleTheme);
toggleLangBtn.addEventListener('click', toggleLanguage);
extractBtn.addEventListener('click', extractUsers);
siteUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    extractUsers();
  }
});

// Check for saved preferences
if (localStorage.getItem('darkMode') === 'true') {
  isDarkMode = true;
  document.body.classList.add('dark');
}

if (localStorage.getItem('language') === 'fa') {
  currentLang = 'fa';
  document.documentElement.lang = 'fa';
  document.body.style.direction = 'rtl';
  document.body.setAttribute('dir', 'rtl');
}

// Initialize UI
updateUI();

// Check if we have cached data
const cachedData = localStorage.getItem('wpUserData');
if (cachedData) {
  try {
    const data = JSON.parse(cachedData);
    initialState.style.display = 'none';
    displayResults(data);
  } catch (e) {
    // If there's an error parsing the cached data, reset to initial state
    localStorage.removeItem('wpUserData');
    resetUI();
  }
}
