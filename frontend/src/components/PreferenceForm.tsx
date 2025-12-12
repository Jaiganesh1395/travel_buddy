import { useEffect, useState } from 'react';
import api from '../api/client';
import { TravelPreferences } from '../types';

type Props = {
  initial?: TravelPreferences;
  onSaved?: (prefs: TravelPreferences) => void;
};

const interestOptions = ['culture', 'food', 'nature', 'nightlife', 'shopping'];
const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'halal'];

export function PreferenceForm({ initial, onSaved }: Props) {
  const [preferences, setPreferences] = useState<TravelPreferences>(
    initial ?? {
      interests: ['culture', 'food'],
      budget: 'medium',
      travelPace: 'moderate',
      dietaryRestrictions: []
    }
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (initial) setPreferences(initial);
  }, [initial]);

  const toggle = (key: 'interests' | 'dietaryRestrictions', value: string) => {
    setPreferences((prev) => {
      const set = new Set(prev[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [key]: Array.from(set) };
    });
  };

  const save = async () => {
    setSaving(true);
    await api.put('/api/user/preferences', preferences);
    setStatus('Preferences saved');
    onSaved?.(preferences);
    setSaving(false);
  };

  return (
    <div className="card">
      <h3 className="section-title">Travel preferences</h3>
      <div className="grid two" style={{ marginTop: '1rem' }}>
        <div>
          <label>Budget</label>
          <select
            value={preferences.budget}
            onChange={(e) => setPreferences({ ...preferences, budget: e.target.value as TravelPreferences['budget'] })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label>Travel pace</label>
          <select
            value={preferences.travelPace}
            onChange={(e) =>
              setPreferences({ ...preferences, travelPace: e.target.value as TravelPreferences['travelPace'] })
            }
          >
            <option value="slow">Slow</option>
            <option value="moderate">Moderate</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Interests</label>
        <div className="tag-list">
          {interestOptions.map((interest) => {
            const active = preferences.interests.includes(interest);
            return (
              <button
                key={interest}
                className="btn light"
                style={{ padding: '0.5rem 0.75rem', opacity: active ? 1 : 0.65 }}
                type="button"
                onClick={() => toggle('interests', interest)}
              >
                {active ? '✓ ' : ''}
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Dietary restrictions</label>
        <div className="tag-list">
          {dietaryOptions.map((option) => {
            const active = preferences.dietaryRestrictions.includes(option);
            return (
              <button
                key={option}
                className="btn light"
                style={{ padding: '0.5rem 0.75rem', opacity: active ? 1 : 0.65 }}
                type="button"
                onClick={() => toggle('dietaryRestrictions', option)}
              >
                {active ? '✓ ' : ''}
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
        {status && <span style={{ color: '#16a34a', fontWeight: 600 }}>{status}</span>}
      </div>
    </div>
  );
}
