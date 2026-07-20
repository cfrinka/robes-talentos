'use client';

import type { Category } from '@/lib/content/types';

interface TalentFilterBarProps {
  categories: Category[];
  activeCategory: string | null;
  search: string;
  onSelectCategory: (name: string) => void;
  onSearchChange: (value: string) => void;
}

// Ported from src/islands/TalentFilterBar.astro. The Cidade/Idade/Gênero/
// Altura/Idiomas/Disponibilidade groups below are decorative in the current
// site (they render but filter nothing) -- replicated as-is, not "fixed".
export function TalentFilterBar({
  categories,
  activeCategory,
  search,
  onSelectCategory,
  onSearchChange,
}: TalentFilterBarProps) {
  return (
    <aside className="filters">
      <h1>Talentos</h1>
      <input
        type="text"
        placeholder="Buscar por nome..."
        className="search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="filter-group">
        <div className="filter-label">Categoria</div>
        <div>
          {categories.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className={`category-check${c.name === activeCategory ? ' active' : ''}`}
              onClick={() => onSelectCategory(c.name)}
            >
              <div className="check-box">
                <div className="dot" />
              </div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label">Cidade</div>
        <div className="static-list">
          São Paulo
          <br />
          Rio de Janeiro
          <br />
          Belo Horizonte
          <br />
          Salvador
          <br />
          Curitiba
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label">Idade</div>
        <div className="chip-row">
          <span className="chip">18–25</span>
          <span className="chip">26–35</span>
          <span className="chip">36+</span>
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label">Gênero</div>
        <div className="static-list">
          Feminino
          <br />
          Masculino
          <br />
          Não-binário
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label">Altura</div>
        <div className="range-track">
          <div className="range-fill" />
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label">Idiomas</div>
        <div className="chip-row">
          <span className="chip">PT</span>
          <span className="chip">EN</span>
          <span className="chip">ES</span>
          <span className="chip">IT</span>
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-label">Disponibilidade</div>
        <div className="static-list">
          Disponível
          <br />
          Em turnê
          <br />
          Indisponível
        </div>
      </div>
    </aside>
  );
}
