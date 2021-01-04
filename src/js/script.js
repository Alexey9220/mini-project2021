$(document).ready(function () {

  let newUserModal = $('#new__user__modal');

  // Полный список пользователей
  allUserData();

  // intlTelInput - type=tel
  $('[type="tel"]').intlTelInput({
    utilsScript: "js/utils.js",
    onlyCountries: ['us', 'gb', 'ua', 'ru', 'pl', 'by', 'fr', 'de'],
    initialCountry: "ua",
    preferredCountries: false,
    nationalMode: false
  });

  // Автофокус на первый input
	newUserModal.on('shown.bs.modal', function () {
    $(SELECTORS.FORM_ADD + ' #name').focus();
  })

  // Перезагрузка страницы после добавления
	newUserModal.on('hidden.bs.modal', function () {
    location.reload();
  })

  // Перезагрузка страницы после редактирования
  $('#edit__user__modal').on('hidden.bs.modal', function () {
    location.reload();
  })

  // Удаление пользователя
  $(document).on("click", '' + SELECTORS.BTN_DANGER + '', function () {

    let id = $(this).attr('data-user-id');

    $(document).on("click", '#delete__user__modal ' + SELECTORS.BTN_DANGER + '', function() {
      if (id) {
        removeUserData(id);
        location.reload();
      }
    });
  });

  // Форма редактирования пользователя
  $(document).on("click", '' + SELECTORS.MAIN_TABLE + ' ' + SELECTORS.BTN_PRIMARY + '', function () {

    const id = $(this).attr('data-user-id');

    $(SELECTORS.FORM_EDIT + ' #edit-user').val(id);

    // Информация о пользователе
    infoUserData(id);

    $(SELECTORS.FORM_EDIT + ' ' + SELECTORS.BTN_PRIMARY).on("click", function (e) {

      // Данные пользователя
      let user_name = $(SELECTORS.FORM_EDIT + ' #edit-name').val();
      let user_famil = $(SELECTORS.FORM_EDIT + ' #edit-lastname').val();
      let user_email = $(SELECTORS.FORM_EDIT + ' #edit-email').val();
      let user_phone = $(SELECTORS.FORM_EDIT + ' #edit-phone').val();
      let user_date = $(SELECTORS.FORM_EDIT + ' #edit-date').val();

      // Проверка заполнения полей
      errors = getCheckForm(user_name, user_famil, user_email, user_phone);

      if (errors) {
        // Показываем ошибки
        $(SELECTORS.FORM_EDIT + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-danger" role="alert">' + errors + '</div>');

      } else {
        // Обновление в Firebase
        updateUserData(id, user_name, user_famil, user_email, user_phone, user_date);
        // Показываем результат
        $(SELECTORS.FORM_EDIT + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-warning" role="alert">' + VARIABLES.EDIT + '</div>');
      }
    });
  });

  // Добавление пользователя
  $(SELECTORS.FORM_ADD + ' ' + SELECTORS.BTN_PRIMARY).on("click", function (e) {

    e.preventDefault();

    // Данные пользователя
    let user_name = $(SELECTORS.FORM_ADD + ' #name').val();
    let user_famil = $(SELECTORS.FORM_ADD + ' #lastname').val();
    let user_email = $(SELECTORS.FORM_ADD + ' #email').val();
    let user_phone = $(SELECTORS.FORM_ADD + ' #phone').val();
    let user_date = $(SELECTORS.FORM_ADD + ' #date').val();

    // Проверка заполнения полей
    let errors = getCheckForm(user_name, user_famil, user_email, user_phone);

    if (errors) {
      // Показываем ошибки
      $(SELECTORS.FORM_ADD + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-danger" role="alert">' + errors + '</div>');
    } else {
      // Добавление в Firebase
      addUserData(user_name, user_famil, user_email, user_phone, user_date);
      // Показываем результат
      $(SELECTORS.FORM_ADD + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-warning" role="alert">' + VARIABLES.SAVE + '</div>');
      // Очищаем форму
      $(SELECTORS.FORM_ADD_ID).trigger('reset');
    }
  });
});

// Добавление данных Firebase
function addUserData(name, famil, email, phone, date) {
  firebase.database().ref('/users/').push({
    name: name,
    famil: famil,
    email: email,
    phone: phone,
    date: date
  }, (error) => {
    if (error) {
      $(SELECTORS.FORM_ADD + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-danger" role="alert">' + VARIABLES.ERROR + '</div>');
    } else {
      $(SELECTORS.FORM_ADD + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-success" role="alert">' + VARIABLES.ADDED + '</div>');
    }
  });
};

// Редактирование данных Firebase
function updateUserData(id, name, famil, email, phone, date) {
  firebase.database().ref('users/' + id).update({
    name: name,
    famil: famil,
    email: email,
    phone: phone,
    date: date
  }, (error) => {
    if (error) {
      $(SELECTORS.FORM_EDIT + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-danger" role="alert">' + VARIABLES.ERROR + '</div>');

    } else {
      $(SELECTORS.FORM_EDIT + ' ' + SELECTORS.FORM_RES).html('<div class="alert alert-success" role="alert">' + VARIABLES.SAVED + '</div>');
    }
  });
}

// Удаление данных Firebase
function removeUserData(id) {
  firebase.database().ref('/users/' + id).remove();
}

// Данные о пользователе (id) Firebase
function infoUserData(id) {
  let ref = firebase.database().ref('users/' + id);
  ref.once("value")
    .then(function (snapshot) {
      // Заполняем данные формы
      $(SELECTORS.FORM_EDIT + ' #edit-name').val(snapshot.child("name").val());
      $(SELECTORS.FORM_EDIT + ' #edit-lastname').val(snapshot.child("famil").val());
      $(SELECTORS.FORM_EDIT + ' #edit-email').val(snapshot.child("email").val());
      $(SELECTORS.FORM_EDIT + ' #edit-phone').val(snapshot.child("phone").val());
      $(SELECTORS.FORM_EDIT + ' #edit-date').val(snapshot.child("date").val());
    });
}

// Количество пользователей Firebase
function countUserData() {
  let ref = firebase.database().ref("users");
  ref.once("value")
    .then(function (snapshot) {
      counts = snapshot.numChildren();
      $(".dropdown .d-inline-block").html(VARIABLES.ALL_COUNT + ' ' + counts);
    });
}

// Все пользователи Firebase
function allUserData() {

  countUserData();

  let sortResults = getUrlParameter('sortby');
  let sorting = '';

  if (sortResults) {
    sorting = sortResults;
  } else {
    sorting = 'name';
  }

  let userDataRef = firebase.database().ref('users').orderByChild(sorting);
  userDataRef.once("value").then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      let key = childSnapshot.key;
      let childData = childSnapshot.val();
      childData['id'] = key;
      $(".tbody").append('<tr><td>' + childSnapshot.val().name + '</td><td>' + childSnapshot.val().famil + '</td><td>' + childSnapshot.val().email + '</td><td>' + childSnapshot.val().phone + '</td><td>' + childSnapshot.val().date + '</td><td><div class="text-center"><button data-user-id ="' + childData.id + '" type="button" class="w-100 btn-sm btn btn-primary" data-toggle="modal" data-target="#edit__user__modal">' + VARIABLES.EDIT_BTN + '</button></div></td><td><div class="text-center"><button data-user-id ="' + childData.id + '" type="button" class="w-100 btn-sm btn btn-danger" data-toggle="modal" data-target="#delete__user__modal">' + VARIABLES.DELETE_BTN + '</button></div></td></tr>');
    });
  });
}

// Проверка заполнения полей
function getCheckForm(user_name, user_famil, user_email, user_phone) {

  let error = '';

  if (!user_phone) {
    error = ERRORS.EMPTY_PHONE;
  }

  if (!user_email) {
    error = ERRORS.EMPTY_EMAIL;
  }

  if (user_email) {

  	let emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

  	if (!emailReg.test(user_email)) {
      error = ERRORS.WRONG_EMAIL;
    }
  }

  if (!user_famil) {
    error = ERRORS.EMPTY_LASTNME;
  }

  if (!user_name) {
    error = ERRORS.EMPTY_NAME;
  }

  return error;
}

// URL параметры для сортировки
function getUrlParameter(name) {

  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

  let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  let results = regex.exec(location.href);

  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, '    '));

}