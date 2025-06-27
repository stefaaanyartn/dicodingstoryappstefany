class StoryView {
    constructor() {
      this.mainContent = document.getElementById('main-content');
    }
  
    showLoading() {
      this.mainContent.innerHTML = '<div class="loading">Loading stories...</div>';
    }
  
 showStories(stories) {
  this.mainContent.innerHTML = '';
  const clearBtn = document.createElement('button');
  clearBtn.innerText = 'Hapus Data Story';
  clearBtn.className = 'clear-cache-btn';
  clearBtn.style.marginBottom = '1em';
  clearBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin menghapus cache lokal?')) {
      this.onClearCache?.();
      
    }
  });
  this.mainContent.appendChild(clearBtn);

  if (!stories || stories.length === 0) {
    return this.showEmpty();
  }

  if (window.location.hash === '#/') {
    const overview = document.createElement('section');
    overview.className = 'overview';
    overview.innerHTML = `
      <h2>Selamat datang di Story App!</h2>
      <p>
        Story App adalah aplikasi sederhana untuk berbagi cerita disertai lokasi.
        Kamu bisa mengunggah foto, menulis cerita, dan melihat cerita orang lain lengkap dengan peta lokasi.
      </p>`;
    this.mainContent.appendChild(overview);
  }

  const storyList = document.createElement('div');
  storyList.className = 'story-list';

  stories.forEach(s => {
    const storyItem = document.createElement('div');
    storyItem.className = 'story-item';

    const name = document.createElement('h3');
    name.textContent = s.name || 'Anonymous';
    storyItem.appendChild(name);
    let imageSrc = s.photoUrl;
    if (s.imageBlob) {
      imageSrc = URL.createObjectURL(s.imageBlob);
    }

    if (imageSrc) {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = s.description || 'Story image';
      img.crossOrigin = 'anonymous';
      img.loading = 'lazy';
      storyItem.appendChild(img);
    }

    const desc = document.createElement('p');
    desc.textContent = s.description || '';
    storyItem.appendChild(desc);


    const date = document.createElement('p');
    date.textContent = s.createdAt ? new Date(s.createdAt).toLocaleString() : '';
    storyItem.appendChild(date);

    if (s.lat && s.lon) {
      const mapDiv = document.createElement('div');
      mapDiv.className = 'story-map';
      mapDiv.id = `map-${s.id}`;
      storyItem.appendChild(mapDiv);
    }

    storyItem.appendChild(document.createElement('hr'));
    storyList.appendChild(storyItem);
  });

  this.mainContent.appendChild(storyList);

  stories.forEach(s => {
    if (s.lat && s.lon) {
      requestAnimationFrame(() => {
        const mapDiv = document.getElementById(`map-${s.id}`);
        if (mapDiv && mapDiv.offsetWidth > 0) {
          if (mapDiv._leaflet_map_instance) {
            mapDiv._leaflet_map_instance.remove();
            mapDiv.innerHTML = '';
          }

          const map = L.map(mapDiv).setView([s.lat, s.lon], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          L.marker([s.lat, s.lon])
            .addTo(map)
            .bindPopup(`<b>${s.name || 'Anonymous'}</b><br>${s.description || ''}<br><i>${new Date(s.createdAt).toLocaleString()}</i>`);

          map.invalidateSize();
          mapDiv._leaflet_map_instance = map;
        }
      });
    }
  });
}  
   showEmpty() {
      this.mainContent.innerHTML = `
        <div class="empty-state">
          <p>No stories found</p>
          <a href="#/add" class="add-button">Add your first story</a>
        </div>`;
    }
  
    showError(msg) {
      this.mainContent.innerHTML = `
        <div class="error">
          <p>${msg}</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>`;
    }

    setClearCacheHandler(handler) {
      this.onClearCache = handler;
    }
  
    showAddForm() {
      const self = this;
      this.mainContent.innerHTML = `
        <div class="add-form">
          <h2>Add New Story</h2>
          <video id="camera-preview" autoplay playsinline></video>
          <button id="capture-button">Ambil Foto</button>
          <canvas id="photo-canvas" style="display:none;"></canvas>
          <textarea id="description" placeholder="Your story..." required></textarea>
          <div id="location-map" class="story-map"></div>
          <button id="submit-story">Submit</button>
        </div>`;

      let stream = null;
      let capturedFile = null;
      
      const video = document.getElementById('camera-preview');
      const canvas = document.getElementById('photo-canvas');
      const captureBtn = document.getElementById('capture-button');
      const submitBtn = document.getElementById('submit-story');
      
      // 📸 Nyalain kamera
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
          stream = mediaStream;
          video.srcObject = stream;

          return new Promise(resolve => {
            video.onloadedmetadata = () => {
              video.play();
              resolve();
            };
          });
        })
        .catch(err => {
          console.error('Gagal mengakses kamera:', err);
      });
      
      // 🎯 Capture button logic
      captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);


        canvas.toBlob(blob => {
          if (!blob) {
            alert('Berhasil membuka kamera.');
            return;
          }

          capturedFile = new File([blob], 'story-photo.jpg', { type: 'image/jpeg' });
          
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          video.remove();
          captureBtn.remove();
        }, 'image/jpeg');
      });

      // 🗺️ Inisialisasi peta
      setTimeout(() => {
        const oldMapContainer = document.getElementById('location-map');

        // Bersihin peta sebelumnya secara total (fix error Leaflet)
        const newMapContainer = oldMapContainer.cloneNode(false); // hapus semua child & event
        oldMapContainer.parentNode.replaceChild(newMapContainer, oldMapContainer);

        const map = L.map(newMapContainer).setView([-6.2088, 106.8456], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        map.invalidateSize();

        let marker = null;
        self.selectedLocation = null;

        map.on('click', e => {
          if (marker) map.removeLayer(marker);
          marker = L.marker(e.latlng).addTo(map);
          self.selectedLocation = e.latlng;
        });
      }, 200);
        
      // 🔒 Pastikan kamera dimatikan juga saat tombol Submit diklik
      submitBtn.addEventListener('click', () => {
        try{
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        } catch (err) {
          console.error('Kesalahan saat submit:', err);
        }
      });
      
      return {
        getFormData: () => ({
          photo: capturedFile,
          description: document.getElementById('description').value,
          lat: self.selectedLocation?.lat,
          lon: self.selectedLocation?.lng
        }),
        setSubmitHandler: handler => {
          document.getElementById('submit-story').addEventListener('click', handler);
        },
        stopCamera: () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
      }
    };
  }

    showLoginForm() {
      this.mainContent.innerHTML = `
        <div class="auth-form">
          <h2>Login</h2>
          <input type="email" id="login-email" placeholder="Email" required>
          <input type="password" id="login-password" placeholder="Password" required>
          <button id="login-submit">Login</button>
          <p>Don't have an account? <a href="#/register">Register here</a></p>
        </div>`;
      return {
        getLoginData: () => ({
          email: document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        }),
        setLoginHandler: handler => {
          document.getElementById('login-submit').addEventListener('click', handler);
        }
      }
    }
  
    showRegisterForm() {
      this.mainContent.innerHTML = `
        <div class="auth-form">
          <h2>Register</h2>
          <input type="text" id="register-name" placeholder="Name" required>
          <input type="email" id="register-email" placeholder="Email" required>
          <input type="password" id="register-password" placeholder="Password" required>
          <button id="register-submit">Register</button>
          <p>Already have an account? <a href="#/login">Login here</a></p>
        </div>`;
      return {
        getRegisterData: () => ({
          name: document.getElementById('register-name').value,
          email: document.getElementById('register-email').value,
          password: document.getElementById('register-password').value
        }),
        setRegisterHandler: handler => {
          document.getElementById('register-submit').addEventListener('click', handler);
        }
      };
    }
  }

  export default StoryView;
  