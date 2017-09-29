$(function() {
  var toastr = {
    info: function(msg) {
      var _this = this;
      if (_this.toastrActive) {
        return;
      }
      _this.toastrActive = true;
      vm.toastrInfo = msg;
      setTimeout(function() {
        vm.toastrInfo = '';
        _this.toastrActive = false;
      }, 3000)
    }
  };


  var vm = new Vue({
    el: '#app',
    data: {
      toastrActive: false,
      toastrInfo: '',
      user: {
        name: '',
        pwd: ''
      },
      rule: {
        Type: 'password',
      },
      drop: false, //区域切换
      btnBg: false, //登录按钮；
      showLoading: false
    },
    methods: {

      secondSelect: function() {
        if (vm.rule.imgType == 1) {
          vm.rule = {
            Type: 'text',
            imgType: 0,
          }
        } else {
          vm.rule = {
            imgType: 1,
            Type: 'password',

          }
        };
        vm.drop = !vm.drop;
      },
      login: function() {
        if (!this.user.name) {
          toastr.info('请输入账号');
          return;
        }

        if (!this.user.pwd) {
          toastr.info('请输入密码');
          return;
        }
        var _this = this;
        var vMd5 = util.getAuthorization();
        var tokenId = localStorage.getItem('tongdun_token');
        $.ajax({
          type: 'POST',
          url: HOST + '/msapi/user/login',
          dataType: 'json',
          headers: {
            'ComeFrom': 'MaiZI',
            'Authorization': vMd5
          },
          data: {
            username: this.user.name,
            password: md5(this.user.pwd),
            tokenId: tokenId
          },
          success: function(res) {
            if (res.flag != 1) {
              toastr.info(res.msg);
              return;
            }
            var sessionId = res.data.session_id;
            _this.getRecommender(sessionId);
          }
        });
      },
      getRecommender: function(sessionId) {
        var sessionId = sessionId;
        $.ajax({
          type: 'POST',
          url: HOST + '/msapi/user/myProlocutorCode',
          dataType: 'json',
          data: {
            sessionId: sessionId
          },
          success: function(res) {
            if (res.flag === 1) {
              var myCode = res.data.mycode;
              window.location.href = 'index.html?recommender=' + myCode;
            }
          }
        });
      }
    }
  });

});
