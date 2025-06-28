import './styles.css';
import  StoryPresenter  from './presenter/StoryPresenter.js';
if(!localStorage.getItem('authToken') && location.hash === '#/') {
  location.hash = '#/login';
}
document.addEventListener('DOMContentLoaded', () => {
   const hapusBtn = document.getElementById('hapus-story');
    const presenter = new StoryPresenter();
    presenter.init();
  
    const updateAuth = () => {
      const loggedIn = !!localStorage.getItem('authToken');
      document.getElementById('login-button').style.display = loggedIn ? 'none' : 'block';
      document.getElementById('register-button').style.display = loggedIn ? 'none' : 'block';
      document.getElementById('logout-button').style.display = loggedIn ? 'block' : 'none';
    };
  
    updateAuth();
  
    document.getElementById('logout-button').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      updateAuth();
      window.location.hash = '#/';
      window.location.reload();
    });

    window.clearAppCache = () => {
      if (window.presenter?.view?.onClearCache) {
        window.presenter.view.onClearCache();
      }
    };

    if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('SW registered: ', reg);
      })
      .catch(err => {
        console.error('SW registration failed: ', err);
      });
  });
}

    if (hapusBtn) {
    hapusBtn.addEventListener('click', async () => {
      const konfirmasi = confirm('Yakin ingin menghapus semua data story?');
      if (!konfirmasi) return;

      try {
        await IndexedDB.clearStories();
        alert('Data story berhasil dihapus dari IndexedDB.');
        console.log('Semua data story telah dihapus.');
      } catch (err) {
        console.error('Gagal menghapus data:', err);
        alert('Terjadi kesalahan saat menghapus data.');
      }
    });
  }

});
