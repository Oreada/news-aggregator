"use strict";

// меню Бургер -------------------------------------------------------------------------

// const iconMenu = document.querySelector(".menu__icon");
// const bodyMenu = document.querySelector(".menu__body");
// if (iconMenu) {
//     iconMenu.addEventListener("click", function (event) {

//         document.body.classList.toggle("_lock"); //! добавляем класс "_lock" в SCSS для запрета прокрутки при активном меню-бургере
//         iconMenu.classList.toggle("_active");
//         bodyMenu.classList.toggle("_active");

//     });
// };

// убираю placeholder при фокусе -----------------------------------------------------------

// const form = document.forms[0];
// const input = form.elements.inputEmail;
// const inputPlaceholder = input.placeholder;

// input.addEventListener("focus", function (event) {

//     input.placeholder = "";
// });

// input.addEventListener("blur", function (event) {

//     input.placeholder = inputPlaceholder;
// });


//! ======= Подключение плагина для стилизации выпадающего списка ===================================================================

const elementSelect = document.querySelector('.js-choice');
const choices = new Choices(elementSelect, {
	searchEnabled: false,
	itemSelectText: '',
});

//! ======= Work with api ===================================================================

const API_KEY = '738879d919fa4fac96337701bee3640e';
const newsList = document.querySelector('.news__list');

const getData = async (url) => {
	const response = await fetch(url, {
		headers: {
			'X-Api-Key': API_KEY,
		}
	});

	const data = await response.json();

	return data;
};

const renderCard = (data) => {
	newsList.textContent = '';
	data.forEach((news) => {
		const card = document.createElement('li');
		card.classList.add('news__item', 'card');

		card.innerHTML = `
		<img class="card__image" src="${news.urlToImage}"
							alt="${news.title}" width="270" height="200">
						<div class="card__text">
							<h3 class="card__title">
								<a class="card__link" href="${news.url}" target="_blank">${news.title}</a>
							</h3>
							<p class="card__description">${news.description}</p>
							<div class="card__footer footer-card">
								<time class="footer-card__datetime" datetime="${news.publishedAt}">
									<span>${news.publishedAt}</span><span> 11:06</span>
								</time>
								<div class="footer-card__author">${news.author || news.source.name}</div>
							</div>
						</div>
		`;

		newsList.append(card);
	});
};

const loadNews = async () => {

	newsList.innerHTML = '<li class="preload"><p class="preload__bg"></p></li>';  //! будет показываться этот элемент, пока не загрузятся новости

	const country = localStorage.getItem('country') || 'us';  //! если уже есть значение страны в localStorage, то берём его, иначе - по умолчанию "us"
	choices.setChoiceByValue(country);

	const data = await getData(`https://newsapi.org/v2/top-headlines?country=${country}&pageSize=50`);
	renderCard(data.articles);
};

//! ======= Choice the country by <select> ===================================================================

elementSelect.addEventListener('change', (event) => {
	const value = event.detail.value;
	// console.log(value);
	localStorage.setItem('country', value);  //! сохраняем выбранную страну в localStorage
	loadNews();
});


//! ======= Work with api ===================================================================

loadNews();

