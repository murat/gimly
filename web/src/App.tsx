import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import {
  ArrowRight,
  FileText,
  LinkSimple,
  WarningCircle,
} from "@phosphor-icons/react";

interface Url {
  url: {
    title: string;
    url: string;
  };
  short_id: string;
  click_count: number;
}

interface ApiResponse {
  data: Url[];
}

interface ApiError {
  status: string;
  error: string;
}

const IndexPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post<Url>("/api/url", {
        data: { title, url },
      });
      setUrls([...urls, response.data]);
      setTitle("");
      setUrl("");
      setError("");
    } catch (error: any) {
      const apiError = error.response.data as ApiError;
      setError(apiError.error);
    }
  };

  const handleCopyClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    url: string
  ) => {
    event.preventDefault();
    navigator.clipboard.writeText(url);
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await axios.get<ApiResponse>("/api/url");
        setUrls(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUrls();
  }, []);

  return (
    <div className="px-6">
      <div className="flex flex-col min-h-screen justify-center items-center pt-16 pb-8">
        <div className="text-center mb-auto">
          <h1 className="font-bold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            A simple yet powerful URL shortener for everyone.
          </h1>

          <p className="text-zinc-500 mt-3">
            Just paste your loooong 🧐 and boooring 😤 URL, and see the magic
            happen! 🎉
          </p>
        </div>

        <div className="bg-white p-8 max-w-lg w-full mx-auto shadow-lg shadow-black/5 ring-1 ring-zinc-100 rounded-lg my-12">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                URL:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkSimple size={20} />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-gray-400 block w-full pl-10 p-2.5 transition-all"
                  placeholder="Paste URL"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              </div>
              {error && (
                <p className="flex mt-3 text-sm text-red-500">
                  <WarningCircle size={20} className="mr-1.5" /> Houston, we
                  have a problem.
                </p>
              )}
            </div>

            <div className="mb-8">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Title: <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText size={20} />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-gray-400 block w-full pl-10 p-2.5 transition-all"
                  placeholder="Enter a title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="text-white bg-black hover:bg-slate-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center transition-all"
              >
                Shorten
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </form>

          {/* // TODO: Complete url list section */}
          {/* {urls.length > 0 && (
            <ul className="url-list">
              {urls.map((url) => (
                <li key={url.url.url}>
                  <div className="url-container">
                    <div className="url-title">{url.url.title}</div>
                    <div className="url-url">
                      <a
                        href={`/u/${url.url.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {url.url.url}
                      </a>
                    </div>
                    {(url.click_count || 0) > 0 && (
                      <div className="url-click-count">
                        {url.click_count} clicks
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(event) => handleCopyClick(event, url.url.url)}
                    className="copy-button"
                  >
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          )} */}
        </div>

        <div className="text-sm text-zinc-500 mt-auto">
          Gimly &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
