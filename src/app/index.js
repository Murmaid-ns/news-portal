import './assets/styles/main.scss';
import axios from 'axios';
import $ from 'jquery';

const API_KEY = '318e5c21-7497-4045-b6b2-a845dae3b6c2';
const guardianApi = axios.create({ baseURL: 'https://content.guardianapis.com' });
const newsList = document.querySelector('.news-list');
const refreshBtn = document.querySelector('#refresh-button');
// const pageInput = document.querySelector('#page-input');

guardianApi.interceptors.request.use((config) => {
  const { url } = config;

  const apiKeyQuery = url.includes('?') ? `&api-key=${API_KEY}` : `?api-key=${API_KEY}`;

  return {
    ...config,
    url: `${url}${apiKeyQuery}`,
  };
});

function renderNews(news) {
  return news
    .map(({
      webTitle, id, webUrl, fields,
    }) => `
      <li class="news-list__item" data-id="${id}">
        <h4 class="news-list__title">${webTitle}</h4>
        <div class="accordion__body" style="display: none;">
        <div class="news-list__body">${fields.body}</div>
        <p><a href="${webUrl}">Link to full news</a></p>
        </div>
      </li>
    `)
    .join('');
}

function anim(newsListTitle) {
  newsListTitle.forEach((el) => {
    el.addEventListener('click', () => {
      const body = $(el).next()[0];
      $('.accordion__body').each((index, elem) => {
        if (elem === body) {
          $(elem).slideToggle();
        } else {
          $(elem).slideUp();
        }
      });
    });
  });
}

guardianApi.interceptors.response.use((response) => {
  const { data } = response;
  return data.response;
});

async function searchNews(page = '1', query = '') {
  const response = await guardianApi.get(`/search?show-fields=body&page=${page}&q=${query}`);
  return response.results;
}

async function displayNews() {
  try {
    const news = await searchNews();
    newsList.innerHTML = renderNews(news);
    const newsListTitle = document.querySelectorAll('.news-list__title');
    anim(newsListTitle);
  } catch (e) {
    newsList.innerHTML = `<div class="error">${e.message}</div>`;
    console.log(e);
  }
}

displayNews();
refreshBtn.addEventListener('click', displayNews);
