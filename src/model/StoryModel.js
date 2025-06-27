import IndexedDB  from "../utils/indexedDB";  

class StoryModel {
    constructor() {
      this.baseUrl = 'https://story-api.dicoding.dev/v1';
    }

    get token() {
      return localStorage.getItem('authToken') || '';
    }
  
    async getStories() {
      const token = this.token;
      if (!token) {
        return { error: true, message: 'Unauthorized access. Please login first.' };
      }
      try {
        const res = await fetch(`${this.baseUrl}/stories?location=1`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await res.json();
        if (!data.error && data.listStory) {
          await IndexedDB.putStories(data.listStory);
        }

        return data;
      } catch (err) {
        const cached = await IndexedDB.getAllStories();
        return {
          error: true,
          message: 'Failed to fetch from API, using cached data',
          listStory: cached,
          offline: true,
        };
      }
    }

    async addStory({ photo, description, lat, lon }) {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('description', description);
      if (lat !== undefined && lon !== undefined) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }
      try {
        const res = await fetch(`${this.baseUrl}/stories`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
          body: formData
        });
        return await res.json();
      } catch (err) {
        return { error: true, message: err.message };
      }
    }
  
    async login({ email, password }) {
      try {
        const res = await fetch(`${this.baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!data.error && data.loginResult) {
          localStorage.setItem('authToken', data.loginResult.token);
        }
        return data;
      } catch (err) {
        return { error: true, message: err.message };
      }
    }
  
    async register({ name, email, password }) {
      try {
        const res = await fetch(`${this.baseUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        return await res.json();
      } catch (err) {
        return { error: true, message: err.message };
      }
    }
  }
  
  export default StoryModel;