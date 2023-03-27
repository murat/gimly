import React, { useState, useEffect } from 'react';

type ShortUrl = {
  url: {
    title: string;
    url: string;
  };
  short_id: string;
  click_count: number;
};

function IndexPage() {
  const [shortUrl, setShortUrl] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState<ShortUrl[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Send POST request to API with title and url values
    const response = await fetch('http://localhost:8080/api/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          title: titleInput,
          url: urlInput,
        },
      }),
    });

    // Check if request was successful
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      return;
    }

    // Parse response data and set shortened URL state
    const data = await response.json();
    setShortUrl(data.shortUrl);

    // Reset form inputs
    setTitleInput('');
    setUrlInput('');
  };

  useEffect(() => {
    const fetchUrls = async () => {
      // Send GET request to API to fetch list of shortened URLs
      const response = await fetch('http://localhost:8080/api/url');

      // Check if request was successful
      if (!response.ok) {
        console.error('Error:', response.status, response.statusText);
        return;
      }

      // Parse response data and set URLs state
      const data = await response.json();
      setUrls(data.data as ShortUrl[]);
    };

    fetchUrls();
  }, []);

  return (
    <div className="index-page">
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title-input">Title:</label>
        <input
          type="text"
          id="title-input"
          value={titleInput}
          onChange={(event) => setTitleInput(event.target.value)}
        />
        <label htmlFor="url-input">URL:</label>
        <input
          type="text"
          id="url-input"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
        />
        <button type="submit">Shorten</button>
      </form>
      {shortUrl && (
        <div>
          <p>Shortened URL:</p>
          <a href={shortUrl}>{shortUrl}</a>
        </div>
      )}
      <h2>Shortened URLs</h2>
      <ul>
        {urls.map((url) => (
          <li key={url.url.url}>
            <a href={`/u/${url.short_id}`}>{url.url.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IndexPage;