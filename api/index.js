const {
  http
} = require('./../utils/http')
const config = require('./../config/index')
const fs = require('fs')

const fileUrl = process.cwd() + '/api/accessTokenInfo.json'
let accessTokenInfo = fs.readFileSync(fileUrl, 'utf-8')

let accessTokenInfoObj = JSON.parse(accessTokenInfo)
let expires = accessTokenInfoObj.expires,
  accessToken = accessTokenInfoObj.accessToken;

// 获取access_token    https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

function getAccessToken() {

  return new Promise(function (resolve, reject) {
    if (!expires || new Date().getTime() > expires) {
      http.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`)
        .then(res => {
          console.log('res:', res)
          accessToken = res.access_token;
          expires = (new Date().getTime() + (res.expires_in - 60) * 1000);



          fs.writeFile(fileUrl, JSON.stringify({
            accessToken,
            expires
          }), 'utf-8', function (err, data) {
            if (err) {
              reject(err)
              return null
            }

            resolve(accessToken)
          })

        }, err => {
          reject(err)
        })
        .catch(err => {
          reject(err)
        })
    } else {
      resolve(accessToken)
    }
  })
}


// 自定义菜单创建  https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN

function createMenu() {
  getAccessToken()
    .then(accessToken => {

      console.log('accessToken:', accessToken)

      let params = {
        "button": [{
            "type": "click",
            "name": "打招呼",
            "key": "SAY_HI"
          },
          {
            "name": "菜单",
            "sub_button": [{
                "type": "view",
                "name": "搜索",
                "url": "https://www.baidu.com/"
              },
              {
                "type": "click",
                "name": "赞一下我们",
                "key": "LIKE"
              }
            ]
          }
        ]
      }

      http.post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`, params)
        .then(res => {
          console.log('res:', res)
        })
    })

}


createMenu()

module.exports = {
  getAccessToken,
  createMenu
}