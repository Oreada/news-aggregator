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

//! ==== ФУНКЦИЯ ДЛЯ ВЕРНОГО СКЛОНЕНИЯ СУЩ. "РЕЗУЛЬТАТ" РЯДОМ С НОМЕРОМ, ОБОЗНАЧАЮЩИМ КОЛИЧЕСТВО ========================

const declOfNum = (n, titles) => titles[n % 10 === 1 && n % 100 !== 11 ?
	0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];

//! ======= Подключение плагина для стилизации выпадающего списка ======================================================

const elementSelect = document.querySelector('.js-choice');
const choices = new Choices(elementSelect, {
	searchEnabled: false,
	itemSelectText: '',
});

//! ======= Work with api ===============================================================================================

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

const getDateCorrectFormat = (isoDate) => {
	const datefromIso = new Date(isoDate);

	const optionsToDate = { year: 'numeric', month: 'numeric', day: 'numeric' };
	const formatDate = datefromIso.toLocaleString('en-GB', optionsToDate);  //! to see "https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString"

	const optionsToTime = { hour: 'numeric', minute: 'numeric' };
	const formatTime = datefromIso.toLocaleString('en-GB', optionsToTime);  //! to see "https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString"

	return `<span>${formatDate}</span><span> ${formatTime}</span>`;
};

const getImage = (url) => new Promise((resolve, reject) => {
	const image = new Image(270, 200);
	// const image = document.createElement('img');

	image.addEventListener('load', (event) => {
		resolve(image);
	});

	image.addEventListener('error', (event) => {
		// reject();  //! у нас вместо реджекта подстановка "no_photo" и опять резолв

		image.src = 'img/no_photo.jpg';
		resolve(image);
	});

	image.src = url || 'img/no_photo.jpg';
	image.className = 'card__image';
	return image;
});

const renderCard = (data) => {
	newsList.textContent = '';

	//! сюда добавили async/await, т.к. без них "const image = getImage(news.urlToImage);" вернёт сам промис - Promise {<pending>}
	data.forEach(async (news) => {
		const card = document.createElement('li');
		card.classList.add('news__item', 'card');

		//! добавляем картинку отдельно и через функцию getImage для проверки наличия изображения и принятия соотв.мер, если его нет:
		const image = await getImage(news.urlToImage);
		image.alt = news.title;
		card.append(image);
		// <img class="card__image" src="${news.urlToImage}" alt="${news.title}" width="270" height="200">

		card.insertAdjacentHTML('beforeend', `
								<div class="card__text">
									<h3 class="card__title">
										<a class="card__link" href="${news.url}" target="_blank">${news.title || ''}</a>
									</h3>
									<p class="card__description">${news.description || ''}</p>
									<div class="card__footer footer-card">
										<time class="footer-card__datetime" datetime="${news.publishedAt}">
											${getDateCorrectFormat(news.publishedAt)}
										</time>
										<div class="footer-card__author">${news.author || news.source.name}</div>
									</div>
								</div>
		`);
		newsList.append(card);
	});
};

const loadNews = async () => {

	titleFound.textContent = '';

	newsList.innerHTML = '<li class="preload"><p class="preload__bg"></p></li>';  //! будет показываться этот элемент, пока не загрузятся новости

	const country = localStorage.getItem('country') || 'us';  //! если уже есть значение страны в localStorage, то берём его, иначе - по умолчанию "us"
	choices.setChoiceByValue(country);  //! устанавливаем выбранную страну в селекте
	// console.log(country);

	const data = await getData(`https://newsapi.org/v2/top-headlines?country=${country}&pageSize=50`);
	renderCard(data.articles);
};

//! ======= Choice the country by <select> ==================================================================================

elementSelect.addEventListener('change', (event) => {
	const value = event.detail.value;
	// console.log(value);
	localStorage.setItem('country', value);  //! сохраняем выбранную страну в localStorage
	loadNews();
});

//! ======= Search ==========================================================================================================

const headerForm = document.querySelector('.header__form');
const titleFound = document.querySelector('.title__found-title');

const loadSearch = async (inputValue) => {

	newsList.innerHTML = '<li class="preload"><p class="preload__bg"></p></li>';  //! будет показываться этот элемент, пока не загрузятся новости

	const data = await getData(`https://newsapi.org/v2/everything?q=${inputValue}&pageSize=50`);

	titleFound.textContent = `По вашему запросу “${inputValue}” ${declOfNum(data.articles.length, ['найден', 'найдено', 'найдено'])} ${data.articles.length} ${declOfNum(data.articles.length, ['результат', 'результата', 'результатов'])}`;
	choices.setChoiceByValue('');  //! убираем выбранную страну из селекта

	renderCard(data.articles);
}

headerForm.addEventListener('submit', (event) => {
	event.preventDefault();  //! чтобы не перезагружалась страница при сабмите - отмена стандартного поведения

	const inputValue = headerForm.inputSearch.value;  //! то, что напечатали в инпуте формы поиска
	loadSearch(inputValue);

	headerForm.reset();  //! очистка поля ввода инпута
});

//! ======= Work with api ==============================================================================================

loadNews();

