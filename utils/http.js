const axios= require('axios');
// import Cookies from 'js-cookie';
// import { message } from 'antd';

const http = axios.create({});
http.interceptors.request.use(config=>{
	return config;
}, (error)=> {
  // 对请求错误做些什么
  return Promise.reject(error);
});

http.interceptors.response.use(response => {
  return response.data;
}, err => {
  let errResponse = err.response

  return Promise.reject(errResponse);

})
module.exports= {
  http
}
