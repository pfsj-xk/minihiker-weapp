// pages/account-information/account-details.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    accountInfo: null,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: '会员信息',
    });

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

    if (app.globalData.accountInfoProvider.infoIsOutdated()) {

      console.log('AccountInfoProvider info is stale, require refresh');
      this.fetchAccountInfo();

    } else {

      // If the current account info is valid, use it directly
      this.setData({
        accountInfo: app.globalData.accountInfoProvider
      });

    }

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

    // Force an accountInfo refresh
    this.fetchAccountInfo();

  },

  /**
   * Fetch the account information and store it.
   */
  fetchAccountInfo: function () {

    wx.showLoading({
      title: '下载中',
    });

    if (!app.globalData.accountInfoProvider.id) {

      // We have to wait until we have an accountId
      app.requestLogin();
      setTimeout(this.fetchAccountInfo, 1000);

    } else {

      let endpoint = 'families/' + app.globalData.accountInfoProvider.id + '?expand=clients';
      let url = app.globalData.url + endpoint;

      let header = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + app.globalData.accessToken
      };

      wx.request({
        url: app.globalData.url + endpoint,
        header: header,
        method: 'GET',
        success: res => {

          if (res.statusCode == 200) {

            // Save the refreshed data 
            res.data.updated_ts = Date.now();
            app.globalData.accountInfoProvider.saveFromServerResponse(res.data);
            this.setData({
              accountInfo: app.globalData.accountInfoProvider
            });

          } else {

            // There was a problem with the request
            console.warn('Error fetching family ' + app.globalData.accountInfo.id);
            console.info(res);

            // If the request fails, try again after 5 seconds
            setTimeout(this.fetchAccountInfo, 5000);

          }
        },
        fail: res => {
          console.warn('Error fetching family ' + app.globalData.accountInfo.id);
          console.info(res);

          // If the request fails, try again after 5 seconds
          setTimeout(this.fetchAccountInfo, 5000);
        },
        complete: res => {
          wx.hideLoading();
        }
      });

    }

  },

  /**
   * Navigate to the personal-info page to add a new client PI.
   */
  addClient: function () {
    wx.navigateTo({
      url: '/pages/personal-information/personal-information',
    });
  },

  /**
   * Navigate to the personal-info page to perform a client PI update
   */
  updateClient: function (e) {

    wx.navigateTo({
      url: '/pages/personal-information/personal-information?id=' + e.currentTarget.dataset.clientId
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})