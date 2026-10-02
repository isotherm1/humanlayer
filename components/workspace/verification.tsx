import { Scale, FlaskConical, Clock3, Info, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactDemo } from "@/types/artifact";
export function Verification({ demo }: { demo: ArtifactDemo }) {
  return (
    <div className="verification-view">
      <div className="verification-banner">
        <FileCheck2 size={22} />
        <div>
          <h2>Readable does not mean verified.</h2>
          <p>
            Intent review and executed tests answer different questions. Keep
            both visible.
          </p>
        </div>
        <Badge>Mock report</Badge>
      </div>
      <div className="verification-grid">
        <section className="verification-card">
          <header>
            <span className="verification-icon">
              <Scale size={20} />
            </span>
            <div>
              <h2>Semantic Verification</h2>
              <p>Does the proposal preserve intended behavior?</p>
            </div>
          </header>
          <div className="verification-status">
            <span className="pending-dot" />
            Human review required
          </div>
          {demo.verification.semantic.map((c) => (
            <article key={c.title}>
              <Clock3 size={16} />
              <div>
                <h3>{c.title}</h3>
                <p>{c.detail}</p>
                <Badge>Pending review</Badge>
              </div>
            </article>
          ))}
          <footer>No equivalence claim has been established.</footer>
        </section>
        <section className="verification-card">
          <header>
            <span className="verification-icon">
              <FlaskConical size={20} />
            </span>
            <div>
              <h2>Test Verification</h2>
              <p>What has actually been executed?</p>
            </div>
          </header>
          <div className="verification-status not-run">
            <span className="pending-dot" />
            Not run · 0 artifact tests executed
          </div>
          {demo.verification.tests.map((c) => (
            <article key={c.title}>
              <Clock3 size={16} />
              <div>
                <h3>{c.title}</h3>
                <p>{c.detail}</p>
                <Badge>Not executed</Badge>
              </div>
            </article>
          ))}
          <footer>No test runner or analysis service is connected.</footer>
        </section>
      </div>
      <div className="subtle-note">
        <Info size={15} />
        <p>
          This is a sample artifact report. Checks on the HumanLayer website
          repository are separate from tests of an imported artifact.
        </p>
      </div>
    </div>
  );
}
