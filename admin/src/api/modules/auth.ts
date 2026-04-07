import http from '../http'

export const getCaptchaApi = () => http.get('/api/captcha')

export const loginApi = (data: {
  username: string
  password: string
  captcha: string
}) => http.post('/api/login', data)
