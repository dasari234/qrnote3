export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface WebSearchResponse {
  answer: string | null;
  results: WebSearchResult[];
}

export async function searchWeb(query: string): Promise<WebSearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not configured.');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      max_results: 5,
      include_answer: true,
      include_raw_content: false,
    }),

    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Web search failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    answer: typeof data.answer === 'string' ? data.answer : null,

    results: Array.isArray(data.results)
      ? data.results.map((item: any) => ({
          title: String(item.title ?? ''),
          url: String(item.url ?? ''),
          content: String(item.content ?? ''),
          score: typeof item.score === 'number' ? item.score : undefined,
        }))
      : [],
  };
}
