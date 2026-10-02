"use client";
import { useState } from "react";
import { ScanLine, CornerDownLeft, Quote, Send, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inspectorQuestions } from "@/lib/product";
import type { ArtifactDemo, InspectorQuestion, Issue } from "@/types/artifact";
export function Inspector({
  demo,
  selectedIssue,
  onClearIssue,
}: {
  demo: ArtifactDemo;
  selectedIssue: Issue | null;
  onClearIssue: () => void;
}) {
  const [question, setQuestion] = useState<InspectorQuestion>("why"),
    [prompt, setPrompt] = useState(""),
    [message, setMessage] = useState("");
  const response = demo.inspector[question];
  return (
    <div className="inspector-inner">
      <header className="inspector-header">
        <span>
          <ScanLine size={16} />
          AI Inspector
        </span>
        <Badge>Mock</Badge>
      </header>
      <div className="inspector-body">
        <div className="inspector-context">
          <span className="eyebrow">CURRENT CONTEXT</span>
          <div className="inspector-artifact">
            <span className="mini-artifact-icon">
              {demo.kind === "code" ? "{ }" : "¶"}
            </span>
            <div>
              <strong>{demo.name}</strong>
              <small>Sample analysis · {demo.confidence}% confidence</small>
            </div>
          </div>
        </div>
        {selectedIssue && (
          <div className="inspector-selected">
            <div>
              <span>FOCUSED EVIDENCE</span>
              <button
                onClick={onClearIssue}
                aria-label="Clear focused evidence"
              >
                <X size={13} />
              </button>
            </div>
            <strong>
              {selectedIssue.id} · {selectedIssue.title}
            </strong>
            <p>{selectedIssue.evidence.observation}</p>
            <code>
              {selectedIssue.evidence.file} · {selectedIssue.evidence.location}
            </code>
          </div>
        )}
        <div className="inspector-intro">
          <h3>Keep the inference accountable.</h3>
          <p>
            Ask what supports it.
            <br />
            See where the interpretation stops.
          </p>
        </div>
        <div className="inspector-prompts">
          {inspectorQuestions.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setQuestion(q.id);
                setMessage("");
              }}
              className={question === q.id ? "active" : ""}
              aria-pressed={question === q.id}
            >
              <span>{q.label}</span>
              <CornerDownLeft size={13} />
            </button>
          ))}
        </div>
        <div className="inspector-response" aria-live="polite">
          <div className="response-label">
            <span className="brand-mark">
              <ScanLine size={14} />
            </span>
            <strong>HumanLayer</strong>
            <span>Demo response</span>
          </div>
          <h4>{response.title}</h4>
          <p>{response.body}</p>
          <div className="inspector-evidence">
            {response.evidence.map((e, i) => (
              <div key={i}>
                <Quote size={12} />
                <span>{e}</span>
              </div>
            ))}
          </div>
          {selectedIssue && question === "evidence" && (
            <pre className="focused-excerpt">
              {selectedIssue.evidence.excerpt}
            </pre>
          )}
        </div>
      </div>
      <form
        className="inspector-composer"
        onSubmit={(e) => {
          e.preventDefault();
          setMessage(
            "Live AI is not connected. Explore the sample questions above.",
          );
          setPrompt("");
        }}
      >
        <label className="sr-only" htmlFor="inspector-prompt">
          Ask the inspector
        </label>
        <textarea
          id="inspector-prompt"
          placeholder="Ask about this artifact…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          maxLength={500}
        />
        <div>
          <span>Sample conversation only</span>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!prompt.trim()}
            aria-label="Submit inspector question"
          >
            <Send size={14} />
          </Button>
        </div>
        {message && (
          <p className="inspector-message" role="status">
            <Info size={13} />
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
