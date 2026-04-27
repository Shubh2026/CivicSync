import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="relative py-16 overflow-hidden"
      style={{
        background: "oklch(0.07 0.02 220)",
        borderTop: "1px solid oklch(1 0 0 / 0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg leading-none">C</span>
              </div>
              <span
                className="text-white font-black text-2xl tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Civic<span className="text-emerald-400">Sync</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-4">
              Connecting passionate volunteers with NGOs and social groups to create measurable,
              lasting community change across the United States.
            </p>
            <p className="text-white/25 text-xs font-medium tracking-wider">
              Developer – Shubh Rawat &nbsp;•&nbsp; For the People
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-white font-semibold text-sm mb-4 tracking-wide"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Platform
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "For Volunteers", href: "/role-select?role=volunteer" },
                { label: "For NGOs", href: "/role-select?role=ngo" },
                { label: "Impact Reports", href: "#" },
                { label: "Success Stories", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-emerald-400 text-sm transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-white font-semibold text-sm mb-4 tracking-wide"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 hover:text-emerald-400 text-sm transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © 2026 CivicSync. Built with 💚 for community impact.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200">
              Sign In
            </Link>
            <Link href="/role-select" className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
