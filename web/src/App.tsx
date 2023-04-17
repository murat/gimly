import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import {
  ArrowRight,
  ArrowUpRight,
  Copy,
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

interface IUrlListItemProps {
  title?: string;
  url: string;
}

const UrlListItem = (props: IUrlListItemProps) => {
  const { title = "Untitled link", url } = props;

  return (
    <li className="mb-12 last:mb-0 ml-4 text-sm">
      <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1 -left-1.5 border border-white"></div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="mt-1 mb-4 font-normal text-gray-500">
        <div className="truncate">
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        </div>
      </div>
      <div className="rounded-md flex justify-between items-center">
        <button
          type="button"
          className="text-black bg-gray-200 hover:bg-gray-300 transition-all font-medium rounded-lg text-xs px-3 py-2 text-center inline-flex items-center mr-2"
        >
          <Copy size={16} className="mr-1.5 opacity-50" />
          Copy link
        </button>

        <div className="text-gray-400">Click count: #0 click</div>
      </div>
    </li>
  );
};

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
      <div className="flex flex-col min-h-screen justify-center items-center pt-8 md:pt-16 pb-8">
        <div className="text-center mb-auto">
          <h1 className="font-bold text-transparent text-2xl md:text-4xl bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            A simple yet powerful URL shortener for everyone.
          </h1>

          <p className="text-zinc-500 mt-3">
            Just paste your loooong 🧐 and boooring 😤 URL, and see the magic
            happen! 🎉
          </p>
        </div>
        {/* header */}
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
                  className="bg-zinc-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 transition-all"
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
                  className="bg-zinc-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 transition-all"
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

          <div className="mt-8 pt-6 border-t border-zinc-100">
            <div className="flex justify-between items-center mb-6">
              <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Shortened links.
              </div>

              {/* NOTE: Can be deleted if unnecessary */}
              {urls.length > 0 && (
                <div className="text-gray-400">Total: #count</div>
              )}
            </div>

            {urls.length ? (
              <ol className="relative border-l border-gray-200 max-h-72 scroll-smooth overflow-y-auto overscroll-auto">
                <UrlListItem url="https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary" />

                <UrlListItem
                  url="https://www.freecodecamp.org/news/the-difference-between-arrow-functions-and-normal-functions/"
                  title="My link title"
                />
              </ol>
            ) : (
              <p className="flex mt-3 text-sm text-gray-600">
                <WarningCircle size={20} className="mr-1.5" /> There is no
                shortened link yet.
              </p>
            )}
          </div>
        </div>
        {/* content */}
        <div className="text-sm font-medium text-zinc-500 mt-auto">
          Gimly &copy; {new Date().getFullYear()}
          <span className="text-black mx-2">✦</span>
          <a
            href="https://github.com/murat/gimly"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-zinc-500"
          >
            GitHub <ArrowUpRight size={16} className="ml-1" />
          </a>
        </div>
        {/* footer */}
      </div>
      {/* container */}
    </div>
  );
};

export default IndexPage;
