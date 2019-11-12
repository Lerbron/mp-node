const express = require('express');
const sha1= require('sha1');
const xml2js = require('xml2js')

const router = express.Router();

const config= require('./../config/index')
// require('./../api/index')

let msgId= ''

router.get('/', function(req, res, next) {

  const query= req.query;
  const signature= query.signature;
  const timestamp= query.timestamp;
  const nonce= query.nonce;
  const echostr= query.echostr;

  const arr= [config.token, timestamp, nonce]
  arr.sort()
  const arrStr= arr.join('')
  const sha1Str= sha1(arrStr)

  if (signature == sha1Str) {
    res.end(echostr)
  } else {
    res.end(false)
  }

});


router.post('/', function(req, res, next) {
  let bufData= []
  req.on('data', function (data) {
    bufData.push(data);

  })

  req.on('end', async function() {
    try {
      const result = await msgHandler(bufData);

      console.log('result:', result)
      res.send(result);
    } catch (error) {
      res.send('error');
    }

  })
})


function msgHandler(msgbufer) {
  var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
  var builder = new xml2js.Builder({ headless: true, cdata: true, explicitRoot: false, rootName: 'xml' });
  return new Promise((resolve, reject) => {
    parser.parseString(msgbufer.toString(), async function (err, result) {
      if (err) {
        reject({
          code: -1,
          msg: 'error',
          data: err,
        });
      }


      if (msgId && result.MsgId == msgId) return null;
      msgId= result.MsgId
      var baseData = {
        ToUserName: result.FromUserName,
        FromUserName: result.ToUserName,
        CreateTime: Date.now(),
      }
      console.log('result:', result)

      switch (result.MsgType) {
        case 'text':
          switch (result.Content.toLowerCase()) {
            case 'hello':
              // 返回欢迎内容
              var helpTxt = [
                'hello! Welcome!'
              ]
              var data = Object.assign({
                MsgType: 'text',
                Content: helpTxt.join('\n'),
              }, baseData);

              resolve(builder.buildObject(data));
              break;
            default:
              const defaultData= {
                MsgType: 'text',
                Content: 'hello world',
                ...baseData
              }
              resolve(builder.buildObject(defaultData))
              break;
          }
          break;
        case 'event':
          if (result.Event === 'subscribe') {
            // 关注
            var data = Object.assign({
              MsgType: 'test',
              Content: '谢谢您的关注！'
            
            }, baseData);

            resolve(builder.buildObject(data));
          } else if (result.Event === 'unsubscribe') {
            // 取消关注
            var data = Object.assign({
              MsgType: 'text',
              Content: '在下没能满足客官的需求，实在抱歉~~',
            }, baseData);

            resolve(builder.buildObject(data));
          } else if( result.Event === 'CLICK') {
            // 菜单click事件

            if(result.EventKey === 'SAY_HI') {
              let data= {
                MsgType: 'news',
                ArticleCount: 1,
                Articles: {
                  item: {
                    Title: 'HELLO',
                    Description: 'hello ladies and gentlemen ! Welcome !',
                    PicUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1573558071377&di=8daf811238d4913c88e3a05f9c99a488&imgtype=0&src=http%3A%2F%2Ff.hiphotos.baidu.com%2Fzhidao%2Fpic%2Fitem%2F1ad5ad6eddc451dafcaf624fb6fd5266d016323c.jpg',
                    Url: 'https://www.baidu.com'
                  }
                },
                ...baseData
              }
              resolve(builder.buildObject(data));
            } else if (result.EventKey === 'LIKE') {
              let data= {
                MsgType: 'text',
                Content: '点赞成功 ! 谢谢您！',
                ...baseData
              }
              resolve(builder.buildObject(data));
            }
          }
          resolve('');
          break;
        default:
          resolve('');
          break;
      }
    });
  });
}

module.exports = router;
