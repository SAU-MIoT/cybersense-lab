import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const Team = lazy(() => import('./pages/Team'));
const Projects = lazy(() => import('./pages/Projects'));
const Publications = lazy(() => import('./pages/Publications'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Events = lazy(() => import('./pages/Events'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ekip" element={<Team />} />
        <Route path="/projeler" element={<Projects />} />
        <Route path="/yayinlar" element={<Publications />} />
        <Route path="/duyurular" element={<Announcements />} />
        <Route path="/etkinlikler" element={<Events />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/gizlilik-ve-kvkk" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
