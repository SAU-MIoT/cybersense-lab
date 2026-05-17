import { signIn, signOut, getAdminProfile } from './auth.js';

const form = document.getElementById('login-form');
const message = document.getElementById('login-message');
const submit = document.getElementById('login-submit');
const USERNAME_EMAIL_MAP = {
  ibutun333: 'ibutun333@cybersense.local',
};

function nextTarget() {
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || 'admin.html';
  return /^[a-z0-9_-]+\.html$/i.test(next) ? next : 'admin.html';
}

function setMessage(text, type = 'error') {
  if (!message) return;
  message.textContent = text || '';
  message.className = text ? `login-message ${type}` : 'login-message';
}

function normalizeLoginId(value) {
  const loginId = String(value || '').trim();
  return USERNAME_EMAIL_MAP[loginId.toLowerCase()] || loginId;
}

async function bootstrap() {
  const params = new URLSearchParams(location.search);
  if (params.get('logout') === '1') {
    await signOut();
    history.replaceState(null, '', 'login.html');
    setMessage('Oturum kapatildi.', 'success');
    return;
  }

  try {
    await getAdminProfile();
    location.href = nextTarget();
  } catch {
    // No valid session yet.
  }
}

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    setMessage('');

    const data = new FormData(form);
    const email = normalizeLoginId(data.get('email'));
    const password = String(data.get('password') || '');
    if (!email || !password) {
      setMessage('Kullanici adi ve sifre gerekli.');
      return;
    }

    submit.disabled = true;
    submit.innerHTML = '<i class="fa fa-circle-notch fa-spin"></i> Kontrol ediliyor';

    try {
      await signIn(email, password);
      setMessage('Giris basarili. Yonlendiriliyorsunuz...', 'success');
      location.href = nextTarget();
    } catch (err) {
      console.error(err);
      setMessage('Giris basarisiz ya da admin yetkisi yok.');
    } finally {
      submit.disabled = false;
      submit.innerHTML = '<i class="fa fa-right-to-bracket"></i> Giris';
    }
  });
}

bootstrap();
