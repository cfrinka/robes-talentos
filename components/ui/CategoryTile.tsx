import Link from 'next/link';
import type { Category } from '@/lib/content/types';

interface CategoryTileProps {
  category: Category;
}

export function CategoryTile({ category }: CategoryTileProps) {
  return (
    <Link
      className="category-tile"
      href={`/talentos?category=${encodeURIComponent(category.name)}`}
      style={{ backgroundImage: `url('${category.image}')` }}
    >
      <div className="category-tile-label">{category.name}</div>
    </Link>
  );
}
