function getAuthorization() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var weeknum = now.getDay();
  var hour = now.getHours();
  var min = parseInt(now.getMinutes() / 5);

  var str = year + "-" + Appendzero(month) + "-" + Appendzero(date) + " " + Appendzero(hour) + "" + min;
  var v = 'm.nonobank.com/msapi/' + str;
  var vMd5 = md5(v);
  return vMd5;
}

function Appendzero(obj) {
  if (obj < 10) {
    return "0" + "" + obj;
  } else {
    return obj;
  }
}


function getSearch() {
  if (window.location.search == '') {
    return false;
  }
  var query_string = {},
    query = window.location.search.substring(1),
    vars = query.split("&");

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }

  return query_string;
}

var HOST = /nonobank.com/.test(location.host) ? location.protocol + "//" + location.host + (location.port ? ":" + location.port : "") : "https://m.stb.nonobank.com";
$(document).on('ajaxStart', function() {
  $('#loading').show();
});

$(document).on('ajaxStop', function() {
  $('#loading').hide();
});
var util = {
  getSearch: getSearch,
  getAuthorization: getAuthorization
};
