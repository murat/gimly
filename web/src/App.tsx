import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Url {
  url: {
    title: string;
    url: string;
  };
  short_id: string;
  click_count: number;
};

interface ApiResponse {
  data: Url[];
}

interface ApiError {
  status: string;
  error: string;
}

const IndexPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post<Url>('/api/url', { data: { title, url } });
      setUrls([...urls, response.data]);
      setTitle('');
      setUrl('');
      setError('');
    } catch (error: any) {
      const apiError = error.response.data as ApiError;
      setError(apiError.error);
    }
  };

  const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, url: string) => {
    event.preventDefault();
    navigator.clipboard.writeText(url);
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await axios.get<ApiResponse>('/api/url');
        setUrls(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUrls();
  }, []);

  return (
    <div className="index-page">
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="title-input">Title:</label>
          <input
            id="title-input"
            className="text-input"
            type="text"
            placeholder="Enter a title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="url-input">URL:</label>
          <input
            id="url-input"
            className="text-input"
            type="text"
            placeholder="Enter a URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <button type="submit" className="submit-button">Shorten</button>
      </form>
      {urls.length > 0 && (
        <ul className="url-list">
          {urls.map((url) => (
            <li key={url.url.url}>
              <div className="url-container">
                <div className="url-title">{url.url.title}</div>
                <div className="url-url"><a href={`/u/${url.url.url}`} target="_blank">{url.url.url}</a></div>
                {(url.click_count || 0) > 0 &&
                  <div className="url-click-count">{url.click_count} clicks</div>
                }
              </div>
              <button onClick={(event) => handleCopyClick(event, url.url.url)} className="copy-button">
                Copy
              </button>
            </li>
          ))}
        </ul>
      )
      }
    </div >
  );
}

export default IndexPage;