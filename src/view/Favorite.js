import IndexedDB from '../utils/indexedDB.js';

class FavoriteView {
  constructor() {
    this.root = document.getElementById('main-content');
  }

  async show() {
    this.root.innerHTML = `
      <h2>Daftar Favorit</h2>
      <button id="clear-all">Hapus Semua</button>
      <div id="favorites-list"></div>
    `;

    const stories = await IndexedDB.getFavoriteStoriesFromDb();
    const list = document.getElementById('favorites-list');
    const clearAllBtn = document.getElementById('clear-all');

    if (stories.length === 0) {
      list.innerHTML = '<p>Tidak ada data favorit yang tersimpan.</p>';
      return;
    }

    stories.forEach((story, index) => {
      const card = document.createElement('div');
      card.classList.add('story-card');
    
      const mapId = `fav-map-${index}`;
      card.innerHTML = `
        <img src="${story.imageBase64}" alt="${story.description || ''}" />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        ${story.lat && story.lon ? `<div id="${mapId}" class="story-map" style="height: 200px; margin-top: 10px;"></div>` : ''}
        <button class="delete-btn" data-id="${story.id}">Hapus</button>
      `;
    
      list.appendChild(card);
    
      if (story.lat && story.lon) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const mapContainer = document.getElementById(mapId);
            if (!mapContainer) return;
    
            const map = L.map(mapId).setView([story.lat, story.lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
    
            L.marker([story.lat, story.lon])
              .addTo(map)
              .bindPopup(`<b>${story.name}</b><br>${story.description}`)
              .openPopup();
    
            setTimeout(() => map.invalidateSize(), 100);
          }, 50); // cukup delay kecil
        });
      }
    });

    list.addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        await IndexedDB.removeFavoriteStoryFromDb(id);
        this.show(); // refresh view
      }
    });

    // 🧹 Hapus semua
    clearAllBtn.addEventListener('click', async () => {
      const konfirmasi = confirm('Yakin ingin menghapus semua data favorit?');
      if (konfirmasi) {
        await IndexedDB.clearAllFavoriteStories();
        this.show(); // refresh view
      }
    });
  }
}

export default FavoriteView;
