import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/modules', label: 'Modules' },
  { href: '/drills', label: 'Drills' },
  { href: '/reference', label: 'Reference' },
  { href: '/progress', label: 'Progress' },
  { href: '/author', label: 'Author' }
];

export function NavLinks() {
  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {navItems.map((item) => (
        <Link className="rounded-md bg-white px-3 py-2 shadow-sm hover:bg-slate-100" key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
