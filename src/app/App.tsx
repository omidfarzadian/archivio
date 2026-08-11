import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/routes/HomePage';
import { CategoryPage } from '@/routes/CategoryPage';
import { SearchPage } from '@/routes/SearchPage';
import { SettingsPage } from '@/routes/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
