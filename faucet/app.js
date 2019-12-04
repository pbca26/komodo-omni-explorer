var config = {
  coins: {
    rick: {
      outSize: 7.777,
      explorer: 'https://rick.kmd.dev',
    },
    morty: {
      outSize: 7.777,
      explorer: 'https://morty.kmd.dev',
    },
    coqui: {
      outSize: 0.1,
      explorer: 'https://explorer.coqui.cash',
    },
    prlpay: {
      outSize: 0.1,
      explorer: 'http://explorer.prlpay.com',
    },
  },
  dev: false,
};

var recaptchaResponse;
var activeCoin = 'rick';
var address = '';

function parseRef() {
  var ref = window.location.href;
  
  for (var key in config.coins) {
    window.location.hash = window.location.hash.replace(key.toUpperCase(), key);
    ref = ref.replace(key.toUpperCase(), key);

    if (ref.indexOf('/' + key + '/') > -1) {
      changeActiveCoin(key, true);
    }

    address = ref.substring(ref.indexOf('/' + key + '/') + ('/' + key + '/').length, ref.length);

    if (address.length === 34) {
      $('#address').val(address);
    } else {
      address = '';
    }
  }
}

function verify(data) {
  if (data) {
    recaptchaResponse = data;
  }
};

function changeActiveCoin(coin, isInit) {
  if (!isInit) {
    window.location.hash = window.location.hash.replace(activeCoin, coin);
  }
  activeCoin = coin;

  $('#faucet-selector').addClass('hide');
  $('#navbar-collapse').addClass('collapse');
  setTimeout(function () {
    $('#faucet-selector').removeClass('hide');
  }, 10);
  $('#faucetCoinIcon').attr('src', '/faucet/images/' + coin + '.png');
  $('#address').attr('placeholder', 'Enter a ' + coin + ' address');
  $('#address').val(address ? address : '');
  $('#error').addClass('hide');
  $('#success').addClass('hide');
  $('#success').html('');
  $('#error').html('');
  
  if (!isInit) grecaptcha.reset();
};

function setTheme(name) {
  document.getElementById('body').className = name;
  localStorage.setItem('settings', JSON.stringify({ theme: name }));
  
  $('.theme-selector .black').removeClass('active');
  $('.theme-selector .green').removeClass('active');
  $('.theme-selector .light').removeClass('active');

  if (name === 'tdark') {
    $('.theme-selector .black').addClass('active');
  } else if (name === 'tgreen') {
    $('.theme-selector .green').addClass('active');
  } else if (name === 'tlight') {
    $('.theme-selector .light').addClass('active');
  }
};

function init() {
  var themeLocalStorageVar = localStorage.getItem('settings');

  parseRef();

  if (!themeLocalStorageVar) {
    $('.theme-selector .black').addClass('active');
    localStorage.setItem('settings', JSON.stringify({ theme: 'tdark' }));
    document.getElementById('body').className = 'tdark';
  } else {
    const json = JSON.parse(themeLocalStorageVar);

    if (json &&
        json.theme) {
      document.getElementById('body').className = json.theme;

      if (json.theme === 'tdark') {
        $('.theme-selector .black').addClass('active');
      } else if (json.theme === 'tgreen') {
        $('.theme-selector .green').addClass('active');
      } else if (json.theme === 'tlight') {
        $('.theme-selector .light').addClass('active');
      }
    }
  }

  $('#faucet-selector li').each(function(index) {
    $(this).click(function() {
      changeActiveCoin($(this).attr('class'));
    });
  });
};

$(document).ready(function() {
  init();

  $('.theme-selector .black').click(function() {
    setTheme('tdark');
  });
  $('.theme-selector .green').click(function() {
    setTheme('tgreen');
  });
  $('.theme-selector .light').click(function() {
    setTheme('tlight');
  });

  $('.navbar-toggle').click(function() {
    if ($('#navbar-collapse').hasClass('collapse')) {
      $('#navbar-collapse').removeClass('collapse');
    } else {
      $('#navbar-collapse').addClass('collapse');
    }
  });

  $('#faucet-get').click(function() {
    address = $('#address').val();

    $.get((config.dev ? 'http://localhost:8115' : 'https://www.atomicexplorer.com') + '/api/faucet?address=' + address + '&coin=' + activeCoin + '&grecaptcha=' + recaptchaResponse,
      function(data, status) {
        if (data.msg === 'success') {
          var successHtml = 
            '<strong>' + config.coins[activeCoin.toLowerCase()].outSize + '</strong> ' + activeCoin.toUpperCase() + ' is sent to ' + address +
            '<div class="margin-top-md">' +
              '<a target="_blank" href="' + config.coins[activeCoin.toLowerCase()].explorer + '/tx/' + data.result + '">Open in explorer</a>' +
            '</div>';
          $('#success').html(successHtml);
          $('#success').removeClass('hide');
          $('#error').addClass('hide');
        } else {
          $('#error strong').html(data.result);
          $('#error').removeClass('hide');
          $('#success').addClass('hide');
        }

        grecaptcha.reset();
      });
  });
});