import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  )
}
