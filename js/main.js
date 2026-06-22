/**
 * Main Initialization
 */

import { initFirebase } from './firebase-auth.js';
import { initBasicMode } from './ui-basic.js';
import { initAdvancedMode } from './ui-advanced.js';
import { loadPreset } from './presets.js';

async function init() {
  console.log('🧠 NeuroWave Studio Pro iniciando...');

  // Initialize Firebase Auth
  try {
    await initFirebase();
    console.log('✅ Firebase Auth inicializado');
  } catch (err) {
    console.error('❌ Error inicializando Firebase:', err);
  }

  // Setup UI
  setupAuthUI();
  initBasicMode();
  initAdvancedMode();

  // Setup theme toggle
  setupThemeToggle();

  // Load default preset
  loadPreset('theta');

  // Setup global audio context
  window.NW_AUDIO_CTX = null;

  // Expose presets globally
  window.NW_PRESETS = await import('./presets.js');

  console.log('✅ NeuroWave Studio Pro listo');
}

function setupAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const googleBtn = document.getElementById('googleLoginBtn');
  const githubBtn = document.getElementById('githubLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginBtn) loginBtn.addEventListener('click', showLoginModal);
  if (registerBtn) registerBtn.addEventListener('click', showRegisterModal);
  if (googleBtn) googleBtn.addEventListener('click', handleGoogleLogin);
  if (githubBtn) githubBtn.addEventListener('click', handleGithubLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    });
  }
}

async function showLoginModal() {
  const email = prompt('Email:');
  if (!email) return;
  const password = prompt('Contraseña:');
  if (!password) return;

  const { loginWithEmail } = await import('./firebase-auth.js');
  const result = await loginWithEmail(email, password);
  if (!result.success) {
    alert('Error: ' + result.error);
  }
}

async function showRegisterModal() {
  const email = prompt('Email:');
  if (!email) return;
  const password = prompt('Contraseña (mín. 6 caracteres):');
  if (!password) return;

  const { registerWithEmail } = await import('./firebase-auth.js');
  const result = await registerWithEmail(email, password);
  if (!result.success) {
    alert('Error: ' + result.error);
  } else {
    alert('Registro exitoso. Por favor inicia sesión.');
  }
}

async function handleGoogleLogin() {
  const { loginWithGoogle } = await import('./firebase-auth.js');
  const result = await loginWithGoogle();
  if (!result.success) {
    alert('Error: ' + result.error);
  }
}

async function handleGithubLogin() {
  const { loginWithGithub } = await import('./firebase-auth.js');
  const result = await loginWithGithub();
  if (!result.success) {
    alert('Error: ' + result.error);
  }
}

async function handleLogout() {
  const { logout } = await import('./firebase-auth.js');
  await logout();
  alert('Sesión cerrada');
}

// Setup event listeners for auth state
window.addEventListener('load', () => {
  window.NW_EVENTS.on('auth:login', (user) => {
    STATE.isAuthenticated = true;
    STATE.user = user;
    updateAuthUI(true, user);
  });

  window.NW_EVENTS.on('auth:logout', () => {
    STATE.isAuthenticated = false;
    STATE.user = null;
    updateAuthUI(false);
  });
});

function updateAuthUI(isLoggedIn, user = null) {
  const authBtns = document.getElementById('authButtons');
  const userBar = document.getElementById('userBar');
  const userName = document.getElementById('userName');

  if (isLoggedIn) {
    if (authBtns) authBtns.style.display = 'none';
    if (userBar) {
      userBar.style.display = 'flex';
      if (userName && user) userName.textContent = user.email || 'Usuario';
    }
  } else {
    if (authBtns) authBtns.style.display = 'flex';
    if (userBar) userBar.style.display = 'none';
  }
}

window.addEventListener('load', init);