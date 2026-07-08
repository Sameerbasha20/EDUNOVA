import client from './client'

export const cmsApi = {
  getSettings: () => client.get('/cms/settings/').then(r => r.data.results?.[0] || null),
  getStats: () => client.get('/cms/stats/').then(r => r.data.results || []),
  getWhyChoose: () => client.get('/cms/why-choose/').then(r => r.data.results || []),
  getTechPartners: () => client.get('/cms/tech-partners/').then(r => r.data.results || []),
  getAcademicPrograms: () => client.get('/cms/academic-programs/').then(r => r.data.results || []),
  getDepartments: () => client.get('/cms/departments/').then(r => r.data.results || []),
  getLeadership: () => client.get('/cms/leadership/').then(r => r.data.results || []),
  getPage: (slug) => client.get(`/cms/pages/${slug}/`).then(r => r.data),
  getNews: () => client.get('/cms/news/').then(r => r.data.results || []),
  getEvents: () => client.get('/cms/events/').then(r => r.data.results || []),
  getAchievements: () => client.get('/cms/achievements/').then(r => r.data.results || []),
  getGalleryAlbums: () => client.get('/cms/gallery-albums/').then(r => r.data.results || []),
  getTestimonials: () => client.get('/cms/testimonials/').then(r => r.data.results || []),
  getFAQs: () => client.get('/cms/faqs/').then(r => r.data.results || []),
  getDocuments: (audience = 'public') => client.get(`/cms/documents/?audience=${audience}`).then(r => r.data.results || []),
  getJobs: () => client.get('/cms/jobs/').then(r => r.data.results || []),
  getScholarships: () => client.get('/cms/scholarships/').then(r => r.data.results || []),
  submitContact: (payload) => client.post('/cms/contact/', payload).then(r => r.data),
}
