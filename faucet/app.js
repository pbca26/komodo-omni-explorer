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
  dev: true,
};

var recaptchaResponse;
var activeCoin = 'rick';

function parseRef() {
  var ref = window.location.href;
  
  for (var key in config.coins) {
    if (ref.indexOf('/' + key + '/') > -1) {
      changeActiveCoin(key, true);
    }

    var address = ref.substring(ref.indexOf('/' + key + '/') + ('/' + key + '/').length, ref.length - 1);

    if (address.length === 34) {
      $('#address').val(address);
    }
  }
}

function verify(data) {
  if (data) {
    recaptchaResponse = data;
  }
};

function changeActiveCoin(coin, isInit) {
  activeCoin = coin;

  $('#faucet-selector').addClass('hide');
  $('#navbar-collapse').addClass('collapse');
  setTimeout(function () {
    $('#faucet-selector').removeClass('hide');
  }, 10);
  $('#faucetCoinIcon').attr('src', '/faucet/images/' + coin.toLowerCase() + '.png');
  $('#address').attr('placeholder', 'Enter a ' + coin.toUpperCase() + ' address');
  $('#address').val('');
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

  if (name === 'tdark') {
    $('.theme-selector .black').addClass('active');
  } else if (name === 'tgreen') {
    $('.theme-selector .green').addClass('active');
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

  $('.navbar-toggle').click(function() {
    if ($('#navbar-collapse').hasClass('collapse')) {
      $('#navbar-collapse').removeClass('collapse');
    } else {
      $('#navbar-collapse').addClass('collapse');
    }
  });

  $('#faucet-get').click(function() {
    var address = $('#address').val();

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