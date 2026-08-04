"use client";

import { useState } from 'react';

export default function DeleteDataRequestForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data-deletion/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const json = await res.json();
      if (json.ok) setMessage('Your deletion request was received. We will process it shortly.');
      else setMessage('Failed to submit request: ' + (json.error || 'unknown'));
    } catch (e) {
      console.error(e);
      setMessage('Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Request data deletion</h2>
      <p className="text-sm text-muted-foreground">Enter the email associated with your data and we will request deletion.</p>
      <div>
        <label className="block text-sm">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input input-bordered w-full" />
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Submitting...' : 'Submit request'}</button>
      </div>
      {message && <div className="text-sm">{message}</div>}
    </form>
  );
}
