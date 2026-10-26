import { MessageSquare } from 'lucide-react';

const SUGGESTIONS = [
  { icon: '💡', text: 'Explain a programming concept' },
  { icon: '🐛', text: 'Help me debug some code' },
  { icon: '📚', text: 'Teach me something new' },
  { icon: '🚀', text: 'Brainstorm a project idea' },
];

export default function WelcomeScreen({ onSuggestPrompt }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">
        <MessageSquare size={28} />
      </div>

      <div>
        <h1 className="welcome-title">SilentChat</h1>
        <p className="welcome-subtitle">
          Your private AI assistant — powered by a local model. Nothing leaves your machine.
        </p>
      </div>

      <div className="welcome-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            className="suggestion-card"
            onClick={() => onSuggestPrompt(s.text)}
          >
            <span className="suggestion-icon" aria-hidden="true">
              {s.icon}
            </span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
