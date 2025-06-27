import StoryModel from '../model/StoryModel.js';
import { subscribePushNotification } from '../utils/web-push.js';
import StoryView from '../view/StoryView.js';
import IndexedDB from '../utils/indexedDB.js';

class StoryPresenter {
  constructor() {
    this.model = new StoryModel();
    this.view = new StoryView();
    this.currentForm = null;  // Menyimpan referensi ke form yang sedang aktif
    this.initRouter();
  }

  init() {
    this.showPage(window.location.hash);

    this.view.setClearCacheHandler(async () => {
      try {
        await IndexedDB.clearStories();
        alert('Cache berhasil dihapus.');
        this.showStoriesPage();
      } catch (err) {
        console.error('Gagal menghapus cache:', err);
        alert('Terjadi kesalahan saat menghapus cache.');
      }
    });
  }

  initRouter() {
    window.addEventListener('hashchange', () => {
      this.showPage(window.location.hash);
    });
  }

  showPage(hash) {
    const main = document.getElementById('main-content');
    if (!main) return;

    // ✅ Berhenti kamera jika ada form aktif sebelum pindah halaman
    if (this.currentForm) {
      this.currentForm.stopCamera();  // Berhenti kamera saat berpindah halaman
    }

    main.classList.remove('fade-enter-active');
    main.classList.add('fade-exit');
    setTimeout(() => {
      main.classList.add('fade-exit-active');
    }, 10);

    setTimeout(() => {
      switch (hash) {
        case '#/add':
          if (this.model.token) this.showAddPage();
          else { alert('Please login first'); window.location.hash = '#/login'; }
          break;
        case '#/login':
          this.showLoginPage();
          break;
        case '#/register':
          this.showRegisterPage();
          break;
        default:
          if (this.model.token) this.showStoriesPage();
          else { alert('Please login first'); window.location.hash = '#/login'; }
      }

      main.classList.remove('fade-exit', 'fade-exit-active');
      main.classList.add('fade-enter');
      setTimeout(() => {
        main.classList.add('fade-enter-active');
      }, 10);
    }, 300);
  }

  async showStoriesPage() {
    this.view.showLoading();
    const res = await this.model.getStories();
    console.log('Fetched:', res);
    if (res.error && res.offline) {
      this.showOfflineMessage?.();
      this.view.showStories(res.listStory || []);
    } else if (res.error) {
      this.view.showError(res.message);
    } else {
      this.view.showStories(res.listStory);
    }
  }

  showAddPage() {
    const form = this.view.showAddForm();
    this.currentForm = form;  // Menyimpan referensi form yang aktif

    // Berhenti kamera ketika tombol ambil foto diklik
    form.setTakePhotoHandler(() => {
      form.stopCamera();
    });

    form.setSubmitHandler(async () => {
      const data = form.getFormData();
      if (!data.photo || !data.description) return alert('Fill photo & description');
      if (!data.lat || !data.lon) return alert('Choose location on map');
      const res = await this.model.addStory(data);
      if (res.error) alert(res.message);
      else {
        alert('Story added!');
        window.location.hash = '#/';
      }
    });
  }

  showLoginPage() {
    const form = this.view.showLoginForm();
    form.setLoginHandler(async () => {
      const { email, password } = form.getLoginData();
      if (!email || !password) return alert('Fill email/password');
      const res = await this.model.login({ email, password });
      if (res.error) {
        alert(res.message);
      } else {
        alert('Login Successful!');
        const token = res.loginResult.token;
        localStorage.setItem('authToken', token);

        subscribePushNotification(token);
        window.location.hash = '#/';
      }
    });
  }

  showRegisterPage() {
    const form = this.view.showRegisterForm();
    form.setRegisterHandler(async () => {
      const { name, email, password } = form.getRegisterData();
      if (!name || !email || !password) return alert('Fill all fields');
      const res = await this.model.register({ name, email, password });
      if (res.error) alert(res.message);
      else {
        alert('Registration successful, please login.');
        window.location.hash = '#/login';
      }
    });
  }

  showOfflineMessage() {
    const main = document.getElementById('main-content');
    const warning = document.createElement('div');
    warning.innerText = '⚠️ Kamu sedang offline. Menampilkan data tersimpan.';
    warning.style.background = '#fffae6';
    warning.style.color = '#333';
    warning.style.padding = '1em';
    warning.style.marginBottom = '1em';
    warning.style.border = '1px solid #ccc';
    warning.style.borderRadius = '8px';
    main.prepend(warning);
  }
}

export default StoryPresenter;
