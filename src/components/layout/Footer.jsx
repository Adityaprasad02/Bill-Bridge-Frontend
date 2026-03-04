
import { Github, Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-10">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Top Links */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-2">Bill-Bridge</h4>
            <p className="text-sm text-zinc-400">
              Smart invoice & billing management platform.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-2">Product</h4>
            <ul className="space-y-1 text-sm">
              <li><a className="hover:text-white" href="#">Features</a></li>
              <li><a className="hover:text-white" href="#">Pricing</a></li>
              <li><a className="hover:text-white" href="#">Dashboard</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <ul className="space-y-1 text-sm">
              <li><a className="hover:text-white" href="#">About Us</a></li>
              <li><a className="hover:text-white" href="#">Team</a></li>
              <li><a classof="hover:text-white" href="#">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-2">Legal</h4>
            <ul className="space-y-1 text-sm">
              <li><a className="hover:text-white" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white" href="#">Terms of Service</a></li>
              <li><a className="hover:text-white" href="#">Security</a></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="my-6 border-zinc-800" />

        {/* Bottom Row */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Bill-Bridge. All rights reserved.
          </p>

          <div className="flex gap-4 text-zinc-400">
                <a href="https://github.com/Adityaprasad02" className="hover:text-white">
                    <Github size={20} />
                    GitHub
                </a>
                <a href="https://www.linkedin.com/in/adityaps09" className="hover:text-white">
                    <Linkedin size={20} />
                    Linkedin
                </a>
                <a href="#" className="hover:text-white">
                    <Twitter size={20} />
                    Twitter
                </a>
                <a href="#" className="hover:text-white">
                    <Instagram size={20} />
                    Instagram
                </a>
                </div>
        </div>

      </div>
    </footer>
  );
}