$(function() {

  var ua = navigator.userAgent;


  var am_id = util.getSearch()['am_id'] || util.getSearch()['utm_source'] || '';
  var approach = util.getSearch()['approach'] || util.getSearch()['utm_term'] || '';
  var approach2 = util.getSearch()['approach2'] || util.getSearch()['utm_content'] || '';
  var approach3 = util.getSearch()['approach3'] || util.getSearch()['utm_campaign'] || '';
  var landing_page = util.getSearch()['landing_page'] || 'nonobank';

  var recommender = util.getSearch()['recommender'];
  var hasNextPage = util.getSearch()['needreg'] == 'true' ? true : false;
  var isWeiXin = /micromessenger/.test(ua.toLowerCase());
  if (isWeiXin) {
    wxShare();
  }
  var isAndroid = /android/.test(ua.toLowerCase());
  

  var regSessionId, codeImgSessionId, curUrl = window.location.href,
    phonePassSuccess = false;
  var toastr = {
    active: false,
    info: function(msg) {
      var _this = this;
      if (_this.active) {
        return;
      }
      _this.active = true;
      vm.toastrInfo = msg;
      setTimeout(function() {
        vm.toastrInfo = '';
        _this.active = false;
      }, 3000)
    }
  };



  var vm = new Vue({
    el: 'body',
    components: { swiper: VueSwiper },
    data: {
      showLoading: false,
      toastrInfo: '',
      hasNextPage: hasNextPage,
      showForm: false,
      showShareMask: false,
      agreed: true,
      sendMessageSuccess: false,
      ruleHtml: '',
      showRule: false,
      regData: {
        phone: '',
        codeImgPath: '',
        safeCode: '',
        msgCode: '',
        pwd: ''
      },
      countdown: {
        initTime: 61,
        time: 61,
        text: '获取验证码',
        active: false
      },
      keyBoardOn: false,
      showBtn: true


    },
    methods: {
      onSlideChangeEnd: function(currentPage) {
        if (isAndroid) {
          if (currentPage == 5) {

            $('input').on('focus',function() {
              vm.keyBoardOn = true;
               vm.showBtn = false;
            }).on('blur', function() {
                vm.showBtn = true;
            })
          } else {
            vm.keyBoardOn = false;
          }
        }
      },
      init: function() {
        if (this.hasNextPage) {
          this.getCodeImg();
        }
      },
      getCodeImg: function() {

        var _this = this;
        $.ajax({
          url: HOST + '/msapi/user/getSessionId',
          type: 'GET',
          dataType: 'json',
          success: function(res) {
            if (res.flag != 1) {
              toastr.info(res.msg);
              return;
            }
            codeImgSessionId = res.data && res.data.session_id;
            _this.regData.codeImgPath = HOST + '/msapi/randomImage?sessionId=' + codeImgSessionId;
          }
        });
      },

      validatePhone: function() {
        var _this = this;
        if (!this.regData.phone) {
          toastr.info('请输入手机号');
          return false;
        }
        if (!/^1\d{10}/.test(this.regData.phone)) {
          toastr.info('手机号码格式不正确');
          return false;
        }

        return true;

      },
      validateSafeCode: function() {
        if (!this.validatePhone()) {
          return;
        }

        if (!this.regData.safeCode) {
          toastr.info('请输入安全码');
          return;
        }

        this.sendMessage();

      },
      sendMessage: function() {
        var _this = this;
        if (_this.countdown.active) {
          return;
        }

        var params = {
          'sessionId': regSessionId || codeImgSessionId,
          'validateCode': this.regData.safeCode,
          'phone': this.regData.phone,
          'approach': '',
          'am_id': '',
          'referer': curUrl,
          'activity_name': '内部分享'
        };

        $.ajax({
          url: HOST + '/msapi/user/sendMessageByValidateCode',
          type: 'POST',
          data: params,
          dataType: 'json',
          success: function(res) {
            if (res.flag != 1) { //失败
              toastr.info(res.msg);
              _this.sendMessageSuccess = false;

              if (res.flag == 23) {
                if (_this.sendMessageSuccess) {
                  _this.sendMessageSuccess = false;
                }
                _this.getCodeImg();
                _this.regData.safeCode = '';

              }
              return;
            }
            _this.sendMessageSuccess = true;
            var data = res.data;
            regSessionId = data['session_id'];

            startCountDown();

          }

        });

        function startCountDown() {
          _this.countdown.time--;
          if (_this.countdown.time >= 0) {
            _this.countdown.active = true;
            setTimeout(startCountDown, 1000);

          } else {
            _this.countdown.active = false;
            _this.countdown.text = '重新获取';
            _this.countdown.time = _this.countdown.initTime;

          }
        }
      },
      regSubmit: function() {

        if (!this.validatePhone()) {
          if (this.sendMessageSuccess) {
            this.sendMessageSuccess = false;
          }
          return;
        }
        if (!this.regData.safeCode) {
          toastr.info('请输入安全码');
          return;
        }
        if (!this.regData.msgCode) {
          toastr.info('请输入短信验证码');
          if (!this.sendMessageSuccess) {
            this.sendMessageSuccess = true;
          }

          return;
        }
        if (!this.regData.pwd) {
          toastr.info('请设置密码');
          return;
        }
        if (!/^(?!\d+$|[a-zA-Z]+$|[\W-_]+$)[\s\S]{6,16}$/.test(this.regData.pwd)) {
          toastr.info('密码格式不正确');
          return;
        }
        if (!this.agreed) {
          toastr.info('请同意服务协议和隐私条款');
        }
        var tokenId = localStorage.getItem('tongdun_token');
        var params = {
          'validatemobile': this.regData.msgCode,
          'password': md5(this.regData.pwd),
          'mobile': this.regData.phone,
          'sessionId': regSessionId,
          'borrowtype': '理财',
          'terminal': 3,
          'am_id': am_id,
          'approach': approach,
          'approach2': approach2,
          'approach3': approach3,
          'landing_page': landing_page,
          'recommender': recommender,
          'tokenId': tokenId
        };
        var vMd5 = util.getAuthorization();
        $.ajax({
          url: HOST + '/msapi/user/register',
          type: 'POST',
          data: params,
          dataType: 'json',
          headers: {
            'ComeFrom': 'MaiZI',
            'Authorization': vMd5
          },
          success: function(res) {
            if (res.flag != 1) {
              toastr.info(res.msg);

              return;
            }
            window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';

          }
        });
      },
      showRegForm: function() {
        if (this.showForm) {
          _czc.push(['_trackEvent', '内部活动', '点击', '注册']);
          this.regSubmit();

        } else {
          this.showForm = true;
        }
      },

      agreedRules: function() {
        this.agreed = !this.agreed;
      },
      share: function(type) {
        if (type == 'hide') {
          this.showShareMask = false;
        } else {
          this.showShareMask = true;
          _czc.push(['_trackEvent', '内部活动', '点击', '分享']);
        }
      },
      showProtocol: function(url) {
        $.ajax({
          url: url+'.html',
          type: 'GET',
          dataType: 'html',
          success: function(res) {
           vm.ruleHtml = res;
           vm.showRule = true;

          }
        });
      },
      hideProtocol: function() {
        if(vm.showRule) {
          vm.showRule = false;
        }
      }
    }
  });

  vm.$watch('regData.safeCode', function(newVal, oldVal) {
    if (newVal != oldVal && newVal && newVal.length == 4) {
      vm.validateSafeCode();
    }

  });

  vm.init();

  function wxShare() {
    var href = window.location.href;
    var share_title = '弱弱的分享一篇“鸡汤”',
      share_desc = '人生的900个月',
      share_link = HOST + '/nono/share/index.html?needreg=true&recommender=' + recommender,
      share_icon = HOST + '/nono/share/images/share_icon.jpg';
    $.ajax({
      url: HOST + '/msapi/activity/getSignPackage',
      type: 'POST',
      dataType: 'json',
      data: {
        url: href,
        type: 'nonobank'
      },
      success: function(res) {
        if (res.flag != 1) {
          alert(res.msg);
          return;
        }
        var data = res.data;

        var appId = data.appId;
        var timeline = data.timestamp;
        var code = data.nonceStr;
        var sign = data.signature;
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: appId, // 必填，公众号的唯一标识
          timestamp: timeline, // 必填，生成签名的时间戳
          nonceStr: code, // 必填，生成签名的随机串
          signature: sign, // 必填，签名，见附录1
          jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.error(function(res) {
          alert('error=' + JSON.stringify(res));
        });

        wx.ready(function() {
          //朋友圈
          wx.onMenuShareTimeline({
            title: share_title, // 分享标题

            link: share_link, // 分享链接

            imgUrl: share_icon, // 分享图标
            success: function() {
              // 用户确认分享后执行的回调函数
            },
            cancel: function() {
              // 用户取消分享后执行的回调函数
            }
          });

          wx.onMenuShareAppMessage({
            title: share_title, // 分享标题
            desc: share_desc, // 分享描述
            link: share_link, // 分享链接
            imgUrl: share_icon, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
              //alert(1)// 用户确认分享后执行的回调函数
            },
            cancel: function() {
              // 用户取消分享后执行的回调函数
            }
          });
        });


      },
      error: function(res) {}
    });
  }
})
