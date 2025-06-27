import StoryModel from '../model/StoryModel.js';

class DetailStoryPresenter {
  constructor(view) {
    this._view = view;
    this._model = new StoryModel();
  }

  async show(storyId) {
    this._view.showLoading();

    try {
      const res = await this._model.getStoryById(storyId);
      if (res.error) {
        this._view.showError(res.message || 'Gagal memuat detail.');
        return;
      }

      const story = res.story || res;
      this._view.renderDetail(story);
    } catch (err) {
      console.error(err);
      this._view.showError('Terjadi kesalahan saat mengambil data.');
    }
  }
}

export default DetailStoryPresenter;
