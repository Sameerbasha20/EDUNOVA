import client from './client'

export const admissionsApi = {
  submit: (payload) => client.post('/admissions/enquiries/', payload).then(r => r.data),
  checkStatus: (registrationNumber) =>
    client.get(`/admissions/enquiries/${registrationNumber}/`).then(r => r.data),
}
