import { FaGithub } from "react-icons/fa";
export const Footer = () => {
  return (
    <div className="text-center text-gray-500 text-xs mt-4 py-2">
      <div>
        &copy; {new Date().getFullYear()} Jukeboxx by Ryo Katsuma. All rights reserved.
      </div>
      <div className="mt-2">
        <a
          href="https://github.com/katsuma/jukeboxx"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:text-gray-700 transition-colors"
        >
          <FaGithub title="GitHub" className="text-xl"/>
        </a>
      </div>
    </div>
  );
}
